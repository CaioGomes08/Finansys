import { OnInit } from '@angular/core';

import { BaseResourceModel } from 'src/app/shared/models/base-resource-model';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';

export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {

  resources: T[] = [];

  constructor(private resourceService: BaseResourceService<T>) { }

  ngOnInit() {
    this.resourceService.getAll()
      .subscribe(resources => {
        this.resources = resources;
      }, error => alert('Erro ao carregar a lista')
      );
  }

  deleteResource(resource: T) {
    const mustDelete = confirm('Deseja realmente excluir esse item ?');

    if (mustDelete) {
      this.resourceService.delete(resource.id)
      .subscribe(() => this.resources = this.resources.filter(e => e !== resource),
        () => alert('Erro ao tentar excluir'));
    }
  }
}
