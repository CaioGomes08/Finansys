import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';
import { switchMap } from 'rxjs/operators';
// tslint:disable-next-line: import-spacing
import toastr from 'toastr';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {


  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm = false;
  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  // PRIVATES METHODS
  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryid: [null, [Validators.required]],
    });
  }

  private loadEntry() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe( // recupera os parametros passados pela rota
        switchMap(params => this.entryService.getById(+params.get('id'))) // mapeando os valores retornados do service
      )
        .subscribe(
          (entry) => {
            this.entry = entry;
            this.entryForm.patchValue(this.entry); // Setando os valores retornados no formulário
          },
          (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
        );
    }
  }

  private setPageTitle() {
    if (this.currentAction === 'edit') {
      const entryName = this.entry.name || '';
      this.pageTitle = `Editando lançamento - ${entryName}`;
    } else {
      this.pageTitle = 'Cadastro de lançamento';
    }
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry)
      .subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      );
  }

  private updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.update(entry)
      .subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      );
  }

  private actionsForSuccess(entry: Entry) {
    toastr.success('Solicitação processada com sucesso!');

    // redirecionando e recarregando o component
    this.router.navigateByUrl('entries', { skipLocationChange: true })
      .then(
        () => this.router.navigate(['entries', entry.id, 'edit'])
      );
  }

  private actionsForError(error) {
    toastr.error('Erro ao processar solicitação!');

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente mais tarde'];
    }
  }
}
