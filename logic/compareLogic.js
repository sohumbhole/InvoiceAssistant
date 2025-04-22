function compareCSV(invoiceData, expectedData, selectedSupplier) {
    const mismatches = [];
  
    invoiceData.forEach((row, idx) => {
      const parsed = selectedSupplier.parseInvoiceRow(row, expectedData);
      if (!parsed) return;
  
      const {
        code,
        invoicePrice,
        expected,
        quantity,
        extendedPrice,
        description
      } = parsed;
  
      const normalizedCode = parseInt(code)?.toString();
      const normalizedExpected = expectedData[normalizedCode];
  
      if (!normalizedExpected) {
        if (extendedPrice !== 0) {
          mismatches.push({
            itemCode: code,
            description,
            expectedPrice: '',
            invoicePrice: invoicePrice.toFixed(2),
            quantity,
            extendedPrice: extendedPrice.toFixed(2),
            highlight: 'orange'
          });
        }
      } else if (Math.abs(invoicePrice - normalizedExpected.price) > 0.005) {
        mismatches.push({
          itemCode: code,
          description,
          expectedPrice: normalizedExpected.price.toFixed(2),
          invoicePrice: invoicePrice.toFixed(2),
          quantity,
          extendedPrice: extendedPrice.toFixed(2),
          highlight: 'yellow'
        });
      }
    });
  
    return mismatches;
  }
  
  module.exports = {
    compareCSV
  };
  