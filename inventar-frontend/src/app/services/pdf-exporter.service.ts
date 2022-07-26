import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfExporterService {

  constructor() { }

  public exportToPDF(pdfDocument: Blob): void {
    const fileURL = URL.createObjectURL(pdfDocument);
    const a = document.createElement('a');
    a.href = fileURL;
    a.target = '_blank';
    a.download = 'Monthly-Report-DEC/2021.pdf';
    document.body.appendChild(a);
    a.click();
  }
}
