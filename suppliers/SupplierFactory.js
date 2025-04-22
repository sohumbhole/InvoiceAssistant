import { SyscoSupplier } from './SyscoSupplier.js';
import { PFGSupplier } from './PFGSupplier.js';

export class SupplierFactory {
  static create(name) {
    switch (name.toLowerCase()) {
      case 'sysco':
        return new SyscoSupplier();
      case 'pfg':
        return new PFGSupplier();
      default:
        return null;
    }
  }
}