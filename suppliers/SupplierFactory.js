const { SyscoSupplier } = require('./SyscoSupplier');
const { PFGSupplier } = require('./PFGSupplier');

class SupplierFactory {
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

module.exports = SupplierFactory;
