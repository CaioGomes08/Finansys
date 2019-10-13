import { NgModule } from '@angular/core';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports/reports.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ReportsComponent
  ],
  imports: [
    ReportsRoutingModule,
    SharedModule
  ]
})
export class ReportsModule { }
