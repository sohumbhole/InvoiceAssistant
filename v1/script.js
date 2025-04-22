const expectedPrices = {};
let parsedCSV = [];

function addExpected() {
  const name = document.getElementById('item-name').value.trim();
  const price = parseFloat(document.getElementById('item-price').value);
  const varianceInput = document.getElementById('item-variance').value;
  const variance = varianceInput === '' ? NaN : parseFloat(varianceInput);

  if (!name || isNaN(price)) {
    alert("Please enter valid item name and price.");
    return;
  }

  expectedPrices[name] = { price, variance };

  const list = document.getElementById('expected-list');
  list.innerHTML = '<strong>Expected Prices:</strong><br>' +
    Object.entries(expectedPrices)
      .map(([k, v]) =>
        `${k}: $${v.price.toFixed(2)} ±${isNaN(v.variance) ? '(using global)' : v.variance + '%'}`)
      .join('<br>');
}

document.getElementById('csv-file').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      parsedCSV = results.data;
      document.getElementById('compare-btn').disabled = false;
      alert("CSV Loaded. Ready to compare.");
    }
  });
});

function compareCSV() {
  const globalVariance = parseFloat(document.getElementById('global-variance').value) || 0;
  const mismatches = [];

  parsedCSV.forEach(row => {
    const itemName = row['Item Description'];
    let unitPrice = row['Unit Price'];

    if (!itemName || !unitPrice || !(itemName in expectedPrices)) return;

    unitPrice = parseFloat(unitPrice.replace('$', '').trim());
    const expected = expectedPrices[itemName];
    const allowedDiff = !isNaN(expected.variance) ? expected.variance / 100 : globalVariance / 100;

    const lowerBound = expected.price * (1 - allowedDiff);
    const upperBound = expected.price * (1 + allowedDiff);

    if (unitPrice < lowerBound || unitPrice > upperBound) {
      mismatches.push(row);
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

  const headers = Object.keys(data[0]);
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}
