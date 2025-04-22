import { SupplierFactory } from './suppliers/SupplierFactory.js';

let expectedData = {};
let invoiceData = [];
let selectedSupplier = null;
let invoiceFileName = '';

document.getElementById('supplier-select').addEventListener('change', function (event) {
  const selectedValue = event.target.value;
  selectedSupplier = SupplierFactory.create(selectedValue);
  console.log('[SupplierFactory] Created supplier:', selectedSupplier);
  console.log('[SupplierFactory] Instance of PFGSupplier?', selectedSupplier instanceof SupplierFactory.create('pfg').constructor);

  checkBothFilesReady();
});

document.getElementById('expected-file').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    if (selectedSupplier) {
      selectedSupplier.parseExpectedCSV(e.target.result, function(parsed) {
        expectedData = parsed;
        console.log('Parsed Expected Data (PFG):', parsed);
        checkBothFilesReady();
      });
    } else {
      expectedData = {};
      checkBothFilesReady();
    }
  };
  reader.readAsText(file);
});

document.getElementById('invoice-file').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  invoiceFileName = file.name.toLowerCase();

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      invoiceData = results.data;

      if (invoiceData.length > 0) {
        console.log('[Invoice File] First row keys:', Object.keys(invoiceData[0]));
        console.log('[Invoice File] First row sample:', invoiceData[0]);
      } else {
        console.warn('[Invoice File] No data parsed.');
      }

      checkBothFilesReady();
    }
  });  
});

function checkBothFilesReady() {
  const valid = selectedSupplier !== null &&
                Object.keys(expectedData).length > 0 &&
                invoiceData.length > 0;

  document.getElementById('compare-btn').disabled = !valid;
}

function compareCSV() {
  console.log('[compareCSV] Total invoice rows:', invoiceData.length);
  console.log('[compareCSV] Selected supplier:', selectedSupplier?.name);

  const mismatches = [];

  invoiceData.forEach((row, idx) => {
    console.log(`[Row ${idx}] Invoice Raw:`, row);
    const parsed = selectedSupplier.parseInvoiceRow(row, expectedData);
    if (!parsed) {
      console.warn(`[Row ${idx}] was skipped by parseInvoiceRow.`);
      return;
    }

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

  displayTable(mismatches);
}

function displayTable(data) {
  const container = document.getElementById('result-table');
  container.innerHTML = '';
  if (data.length === 0) {
    container.innerHTML = '<p>No mismatches found. All good!</p>';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const headers = ['Item Description', 'Item Code', 'Standard Price', 'INV Unit Price', 'Quantity', 'INV EXT Price'];
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  data.forEach(row => {
    const tr = document.createElement('tr');
    if (row.highlight === 'yellow') {
      tr.style.backgroundColor = '#fffac2';
    }
    if (row.highlight === 'orange') {
      tr.style.backgroundColor = '#ffe5b4';
    }

    const tdDesc = document.createElement('td');
    tdDesc.textContent = row.description;
    tr.appendChild(tdDesc);

    const tdCode = document.createElement('td');
    tdCode.textContent = row.itemCode;
    tr.appendChild(tdCode);

    const tdExpected = document.createElement('td');
    tdExpected.textContent = row.expectedPrice ? `$${row.expectedPrice}` : '';
    tr.appendChild(tdExpected);

    const tdInvoice = document.createElement('td');
    tdInvoice.textContent = `$${row.invoicePrice}`;
    tr.appendChild(tdInvoice);

    const tdQty = document.createElement('td');
    tdQty.textContent = row.quantity;
    tr.appendChild(tdQty);

    const tdExt = document.createElement('td');
    tdExt.textContent = `$${row.extendedPrice}`;
    tr.appendChild(tdExt);

    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

document.getElementById('compare-btn').addEventListener('click', compareCSV);
