import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { Category } from 'src/app/pages/categories/shared/category.model';
import { CategoryService } from 'src/app/pages/categories/shared/category.service';
import { Entry } from 'src/app/pages/entries/shared/entry.model';
import { EntryService } from 'src/app/pages/entries/shared/entry.service';

import currencyFormatter from 'currency-formatter';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  expenseTotal: any = 0;
  revenueTotal: any = 0;
  balance: any = 0;

  expenseChartData: any;
  revenueChartData: any;

  chartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  categories: Category[] = [];
  entries: Entry[] = [];

  @ViewChild('month', { static: true }) month: ElementRef = null;
  @ViewChild('year', { static: true }) year: ElementRef = null;

  constructor(
    private entryService: EntryService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.categoryService.getAll()
      .subscribe(categories => {
        this.categories = categories;
      });

  }

  public gerarRelatorio() {
    const month = this.month.nativeElement.value;
    const year = this.year.nativeElement.value;

    if (!month || !year) {
      alert('Você precisa selecionar o mês ou o ano para gerar os relatórios');
    } else {
      this.entryService.getByMonthAndYear(month, year)
        .subscribe(this.setValues.bind(this));
    }
  }

  private setValues(entries: Entry[]) {
    this.entries = entries;
    this.calculateBalance();
    this.setChartData();
  }

  private calculateBalance() {
    let expenseTotal = 0;
    let revenueTotal = 0;

    this.entries.forEach(entry => {
      if (entry.type === 'revenue') {
        revenueTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' });
      } else {
        expenseTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' });
      }
    });

    this.expenseTotal = currencyFormatter.format(expenseTotal, { code: 'BRL' });
    this.revenueTotal = currencyFormatter.format(revenueTotal, { code: 'BRL' });
    this.balance = currencyFormatter.format(revenueTotal - expenseTotal, { code: 'BRL' });
  }

  private setChartData() {
    this.revenueChartData = this.getChartData('revenue', 'Gráfico de Receitas', '#9CCC65');
    this.expenseChartData = this.getChartData('expense', 'Gráfico de Despesas', '#e03131');
  }

  private getChartData(entryType: string, title: string, color: string) {
    const chartData = [];

    this.categories.forEach(category => {
      // filtrar todas as entries que passar aqui pela categoria e tipo
      const filteredEntries = this.entries.filter(
        entry => entry.categoryId === category.id && entry.type === entryType
      );

      // se encontrar lançamentos some o valor e adicione ao chartData
      if (filteredEntries.length > 0) {
        const totalAmount = filteredEntries.reduce(
          (total, entry) => total + currencyFormatter.unformat(entry.amount, { code: 'BRL' }), 0
        );

        chartData.push({
          categoryName: category.name,
          totalAmount
        });
      }
    });

    return {
      labels: chartData.map(i => i.categoryName),
      datasets: [{
        label: title,
        backgroundColor: color,
        data: chartData.map(i => i.totalAmount)
      }]
    };
  }
}
