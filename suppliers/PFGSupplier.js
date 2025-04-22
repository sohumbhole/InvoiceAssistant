import { Supplier } from './Supplier.js';

export class PFGSupplier extends Supplier {
  constructor() {
    super('PFG');
    this.columns = {
      code: 'Product Number',
      price: 'Price',
      desc: 'Product Description'
    };
  }

  parseExpectedCSV(fileText, callback) {
    const allLines = fileText.split(/\r\n|\n/);
    const dataLines = allLines.slice(8); // Data starts from row 9 (0-based index)
  
    const header = [
      'Product Description',
      'Brand',
      'StateOfOrigin',
      'Product Number',
      'Pack Size',
      'UOM',
      'Price'
    ];
  
    const cleanCSV = [header.join(','), ...dataLines].join('\n');
  
    Papa.parse(cleanCSV, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        const data = {};
        results.data.forEach(row => {
          const code = row['Product Number'];
          const price = parseFloat(row['Price']?.replace('$', '').trim());
          const desc = row['Product Description'];
  
          if (code && !isNaN(price)) {
            data[code] = { description: desc, price };
          }
        });
        callback(data);
      }
    });
  }
  

  parseInvoiceRow(row, expectedData) {
    const code = row['Product #'];
    const extPriceStr = row['Ext. Price'];
    const qtyStr = row['Qty Shipped'];
  
    if (!code || !extPriceStr || !qtyStr) return null;
  
    const qty = parseFloat(qtyStr);
    const ext = parseFloat(extPriceStr.replace('$', '').trim());
  
    if (qty === 0 || isNaN(qty) || isNaN(ext)) return null;
  
    const invoicePrice = ext / qty;
    const expected = expectedData[code];
    const description = row['Product Description'];
    const extendedPrice = ext;
  
    console.log('[PFG] Parsed Row:', { code, invoicePrice, expected, qty, extendedPrice, description });
  
    return {
      code,
      invoicePrice,
      expected,
      quantity: qty,
      extendedPrice,
      description
    };
  }
  
  
  
  
}
