import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';
import { switchMap } from 'rxjs/operators';
// tslint:disable-next-line: import-spacing
import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {


  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createCategory();
    } else {
      this.updateCategory();
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

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private loadCategory() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe( // recupera os parametros passados pela rota
        switchMap(params => this.categoryService.getById(+params.get('id'))) // mapeando os valores retornados do service
      )
        .subscribe(
          (category) => {
            this.category = category;
            this.categoryForm.patchValue(this.category); // Setando os valores retornados no formulário
          },
          (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
        );
    }
  }

  private setPageTitle() {
    if (this.currentAction === 'edit') {
      const categoryName = this.category.name || '';
      this.pageTitle = `Editando Categoria - ${categoryName}`;
    } else {
      this.pageTitle = 'Cadastro de categoria';
    }
  }

  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.create(category)
      .subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      );
  }

  private updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.update(category)
      .subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      );
  }

  private actionsForSuccess(category: Category) {
    toastr.success('Solicitação processada com sucesso!');

    // redirecionando e recarregando o component
    this.router.navigateByUrl('categories', { skipLocationChange: true })
      .then(
        () => this.router.navigate(['categories', category.id, 'edit'])
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
