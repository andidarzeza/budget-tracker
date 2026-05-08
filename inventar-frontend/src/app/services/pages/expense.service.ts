import { Injectable } from '@angular/core';
import { Expense } from 'src/app/models/models';
import { serverAPIURL } from 'src/environments/environment';
import { BaseService } from '../../core/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService extends BaseService<Expense> {
  readonly API_URl: string = `${serverAPIURL}/api/expense`;

  verifyInvoiceFromScannedUrl(url: string) {
    return this.http.post(`${this.API_URl}/verify-invoice-from-url`, { url });
  }
}
