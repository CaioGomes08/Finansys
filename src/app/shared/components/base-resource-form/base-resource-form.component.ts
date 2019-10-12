import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseResourceModel } from '../../models/base-resource-model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from 'rxjs/operators';
// tslint:disable-next-line: import-spacing
import toastr from 'toastr';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {


  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T) {
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  // PRIVATES METHODS
  protected setCurrentAction() {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  protected loadResource() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe( // recupera os parametros passados pela rota
        switchMap(params => this.resourceService.getById(+params.get('id'))) // mapeando os valores retornados do service
      )
        .subscribe(
          (resource) => {
            this.resource = resource;
            this.resourceForm.patchValue(this.resource); // Setando os valores retornados no formulário
          },
          (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
        );
    }
  }

  protected setPageTitle() {
    if (this.currentAction === 'edit') {
      this.pageTitle = this.editionPageTitle();
    } else {
      this.pageTitle = this.creationPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return 'Novo';
  }

  protected editionPageTitle(): string {
    return 'Edição';
  }

  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.create(this.resource)
      .subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      );
  }

  protected updateResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(resource)
      .subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      );
  }

  protected actionsForSuccess(resource: T) {
    toastr.success('Solicitação processada com sucesso!');

    // Tira uma fotografia da url e me retorna a rota pai
    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

    // redirecionando e recarregando o component
    this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true })
      .then(() => this.router.navigate([baseComponentPath, resource.id, 'edit']));
  }

  protected actionsForError(error) {
    toastr.error('Erro ao processar solicitação!');

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente mais tarde'];
    }
  }

  protected abstract buildResourceForm(): void;
}
