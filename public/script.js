let expectedData = "";
let invoiceData = "";
let selectedSupplier = null;

document.getElementById('supplier-select').addEventListener('change', function (event) {
  selectedSupplier = event.target.value;
  checkBothFilesReady();
});

document.getElementById('expected-file').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    expectedData = e.target.result;
    checkBothFilesReady();
  };
  reader.readAsText(file);
});

document.getElementById('invoice-file').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    invoiceData = e.target.result;
    checkBothFilesReady();
  };
  reader.readAsText(file);
});

function checkBothFilesReady() {
  const valid = selectedSupplier && expectedData.length > 0 && invoiceData.length > 0;
  document.getElementById('compare-btn').disabled = !valid;
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
    if (row.highlight === 'yellow') tr.style.backgroundColor = '#fffac2';
    if (row.highlight === 'orange') tr.style.backgroundColor = '#ffe5b4';

    tr.innerHTML = `
      <td>${row.description}</td>
      <td>${row.itemCode}</td>
      <td>${row.expectedPrice ? `$${row.expectedPrice}` : ''}</td>
      <td>$${row.invoicePrice}</td>
      <td>${row.quantity}</td>
      <td>$${row.extendedPrice}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

document.getElementById('compare-btn').addEventListener('click', () => {
  fetch('/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceCSV: invoiceData,
      expectedCSV: expectedData,
      supplierName: selectedSupplier
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !Array.isArray(data.mismatches)) {
        throw new Error('Invalid server response: mismatches not found');
      }
      displayTable(data.mismatches);
    })
    .catch(err => console.error('Error comparing:', err));
});
