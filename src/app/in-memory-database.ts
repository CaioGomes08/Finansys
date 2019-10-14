import { InMemoryDbService } from 'angular-in-memory-web-api';

import { Category } from './pages/categories/shared/category.model';
import { Entry } from "./pages/entries/shared/entry.model";

export class InMemoryDatabase implements InMemoryDbService {

    createDb() {
        const categories: Category[] = [
            {id: 1, name: 'Lazer', description: 'Cinema, parques, praia, etc'},
            {id: 2, name: 'Saúde', description: 'Plano de Saúde e Remédios'},
            {id: 3, name: 'Moradia', description: 'Pagamentos de Contas da Casa'},
            {id: 4, name: 'Salário', description: 'Recebimento de Salário'},
            {id: 5, name: 'Freelas', description: 'Trabalhos como freelancer'}
        ];

        const entries: Entry[] = [
            // tslint:disable-next-line: max-line-length
            {id: 1, name: 'Gás de cozinha', categoryId: categories[0].id, category: categories[0], paid: false, date: '14/09/2019', amount: '70,80', type: 'expense', description: 'Compra do gás' } as Entry,
            // tslint:disable-next-line: max-line-length
            {id: 2, name: 'Suplementos', categoryId: categories[1].id, category: categories[1], paid: true, date: '25/09/2019', amount: '50,80', type: 'expense', description: 'Suplemento alimentar' } as Entry,
            // tslint:disable-next-line: max-line-length
            {id: 3, name: 'Salário empresa', categoryId: categories[3].id, category: categories[3], paid: true, date: '20/09/2019', amount: '4000,80', type: 'revenue', description: 'Adiantamento de salário' } as Entry,
            // tslint:disable-next-line: max-line-length
            {id: 4, name: 'Salário empresa', categoryId: categories[3].id, category: categories[3], paid: true, date: '11/10/2019', amount: '4455,80', type: 'revenue', description: 'Adiantamento de salário' } as Entry,
            // tslint:disable-next-line: max-line-length
            {id: 5, name: 'Pagamento do cartāo', categoryId: categories[0].id, category: categories[0], paid: true, date: '16/10/2019', amount: '2000,80', type: 'expense', description: 'Pagamento do cartāo' } as Entry,
        ];

        return { categories, entries };
    }
}
