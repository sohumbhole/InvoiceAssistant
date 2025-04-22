import { SyscoSupplier } from './SyscoSupplier.js';

export class Supplier {
    constructor(name) {
      this.name = name;
    }
  
    parseExpectedCSV(fileText, callback) {
      throw new Error('parseExpectedCSV must be implemented in subclass');
    }

    parseInvoiceRow(row) {
      throw new Error('parseInvoiceRow must be implemented');
    }
  
  }
  