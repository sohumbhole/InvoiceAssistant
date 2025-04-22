const express = require('express');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const app = express();
const port = process.env.PORT || 3000;

const { compareCSV } = require('./logic/compareLogic');
const SupplierFactory = require('./suppliers/SupplierFactory');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/compare', (req, res) => {
  try {
    const { invoiceCSV, expectedCSV, supplierName } = req.body;

    const supplier = SupplierFactory.create(supplierName);
    if (!supplier) {
      return res.status(400).json({ error: 'Invalid supplier name' });
    }

    const parsedInvoice = parse(invoiceCSV, {
      columns: true,
      skip_empty_lines: true
    });

    supplier.parseExpectedCSV(expectedCSV, (parsedExpected) => {
      if (!parsedExpected || typeof parsedExpected !== 'object') {
        return res.status(500).json({ error: 'Invalid parsed expected data' });
      }

      const mismatches = compareCSV(parsedInvoice, parsedExpected, supplier);

      if (!Array.isArray(mismatches)) {
        return res.status(500).json({ error: 'Internal comparison error' });
      }

      res.json({ mismatches });
    });
  } catch (error) {
    console.error('Server error during /compare:', error);
    res.status(500).json({ error: 'Server error during comparison' });
  }
});

app.use((req, res, next) => {
  console.log(`[DEBUG] Unknown path hit: ${req.method} ${req.url}`);
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
