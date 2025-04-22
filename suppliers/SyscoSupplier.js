import { Supplier } from './Supplier.js';

export class SyscoSupplier extends Supplier {
    constructor() {
      super('Sysco');
      this.dataStartsAt = 1;
      this.columns = {
        code: 'SUPC',
        price: 'Case $',
        desc: 'Desc'
      };
    }
  
    parseExpectedCSV(fileText, callback) {
      const allLines = fileText.split(/\r\n|\n/);
      const dataLines = allLines.slice(this.dataStartsAt);
      const cleanCSV = dataLines.join('\n');
  
      Papa.parse(cleanCSV, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          const data = {};
          results.data.forEach(row => {
            const code = row['SUPC'];
            const price = parseFloat(row['Case $']?.replace('$', '').trim());
            const desc = row['Desc'];
            if (code && !isNaN(price)) {
              data[code] = { description: desc, price };
            }
          });
          callback(data);
        }
      });
    }

    parseInvoiceRow(row, expectedData) {
      if (!row['Item Code'] || !row['Unit Price']) return null;
    
      const code = row['Item Code'];
      const invoicePrice = parseFloat(row['Unit Price'].replace('$', '').trim());
      const expected = expectedData[code];
      const quantity = row['Current Quantity'];
      const extendedPrice = parseFloat(row['Current Extended Price']);
      const description = row['Item Description'];
    
      return { code, invoicePrice, expected, quantity, extendedPrice, description };
    }
    
  }