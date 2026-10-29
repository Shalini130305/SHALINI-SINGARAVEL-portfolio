// AI Finance dashboard. ALL DATA IS FICTIONAL DEMO DATA with transparent demo rules.
// Not the original project's reconciliation logic, and not connected to any backend.
(() => {
  // [id, bank date, description, category, bank amount, ledger amount (null = none), ledger date]
  const DATA = [
    ['TXN-1001', '2026-01-03', 'Client invoice INV-201', 'Revenue', 12500, 12500, '2026-01-03'],
    ['TXN-1002', '2026-01-05', 'Cloud hosting subscription', 'Software', -3200, -3200, '2026-01-05'],
    ['TXN-1003', '2026-01-09', 'Office supplies', 'Admin', -840, -480, '2026-01-09'],
    ['TXN-1004', '2026-01-14', 'Consulting receipt', 'Revenue', 8000, 8000, '2026-01-19'],
    ['TXN-1005', '2026-01-22', 'Travel reimbursement', 'Travel', -1450, null, null],
    ['TXN-1006', '2026-02-02', 'Client invoice INV-207', 'Revenue', 15200, 15200, '2026-02-02'],
    ['TXN-1007', '2026-02-06', 'Payroll vendor fee', 'Payroll', -650, -650, '2026-02-06'],
    ['TXN-1008', '2026-02-11', 'Software licence renewal', 'Software', -2400, -2400, '2026-02-12'],
    ['TXN-1009', '2026-02-18', 'Client refund', 'Refunds', -900, -900, '2026-02-18'],
    ['TXN-1010', '2026-02-25', 'Utilities', 'Admin', -1100, -1100, '2026-02-25'],
    ['TXN-1011', '2026-03-03', 'Client invoice INV-214', 'Revenue', 9800, 9800, '2026-03-03'],
    ['TXN-1012', '2026-03-08', 'Marketing campaign', 'Marketing', -4300, null, null],
    ['TXN-1013', '2026-03-15', 'Interest income', 'Other', 260, 260, '2026-03-15'],
    ['TXN-1014', '2026-03-21', 'Equipment purchase', 'Capex', -5600, -5060, '2026-03-21'],
    ['TXN-1015', '2026-03-27', 'Client invoice INV-219', 'Revenue', 11100, 11100, '2026-03-27']
  ];

  const LABEL = { matched: 'Matched', amount: 'Amount mismatch', date: 'Date mismatch', unmatched: 'Unmatched' };
  const DAY = 864e5;
  const money = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sum = list => list.reduce((s, r) => s + r.amt, 0);

  // Demo reconciliation rules, applied in order; the first failing rule sets the status.
  const rows = DATA.map(([id, date, desc, cat, amt, led, ldate]) => {
    let status = 'matched';
    let note = 'Rule 4: all checks pass. Amount and date agree within the 2-day demo tolerance.';
    if (led === null) {
      status = 'unmatched';
      note = 'Rule 1: no ledger entry exists for this bank transaction.';
    } else if (Math.abs(amt - led) > 0.005) {
      status = 'amount';
      note = `Rule 2: bank and ledger amounts differ by ${money(Math.abs(amt - led))}.`;
    } else {
      const days = Math.round(Math.abs(Date.parse(date) - Date.parse(ldate)) / DAY);
      if (days > 2) {
        status = 'date';
        note = `Rule 3: ledger date is ${days} days from the bank date (limit is 2).`;
      }
    }
    return { id, date, desc, cat, amt, led, ldate, status, note };
  });

  const $ = id => document.getElementById(id);
  const f = { q: $('q'), st: $('st'), from: $('from'), to: $('to') };
  let selected = null;

  function filtered() {
    const q = f.q.value.trim().toLowerCase(), st = f.st.value, from = f.from.value, to = f.to.value;
    return rows.filter(r =>
      (!q || `${r.id} ${r.desc} ${r.cat}`.toLowerCase().includes(q)) &&
      (st === 'all' || r.status === st) &&
      (!from || r.date >= from) &&
      (!to || r.date <= to));
  }

  function render() {
    const list = filtered();
    const inc = sum(list.filter(r => r.amt > 0));
    const exp = -sum(list.filter(r => r.amt < 0));
    const matched = list.filter(r => r.status === 'matched').length;

    $('kpi').innerHTML = [
      ['Income', money(inc)],
      ['Expenses', money(exp)],
      ['Net', money(inc - exp)],
      ['Records shown', list.length],
      ['Match rate', list.length ? Math.round(matched / list.length * 100) + '%' : '—'],
      ['Exceptions', list.length - matched]
    ].map(([l, v]) => `<div class="card kpi"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('');

    $('rows').innerHTML = list.length ? list.map(r =>
      `<tr tabindex="0" data-id="${r.id}" class="${r.id === selected ? 'sel' : ''}">` +
      `<td>${r.id}</td><td>${r.date}</td><td>${r.desc}</td>` +
      `<td class="num ${r.amt < 0 ? 'neg' : 'pos'}">${money(r.amt)}</td>` +
      `<td><span class="st ${r.status}">${LABEL[r.status]}</span></td></tr>`).join('')
      : '<tr><td colspan="5" class="empty">No transactions match these filters.</td></tr>';

    const r = rows.find(x => x.id === selected);
    $('detail').innerHTML = r
      ? `<h3>${r.id}</h3><p class="muted">${r.desc}</p>
         <dl><dt>Date</dt><dd>${r.date}</dd><dt>Category</dt><dd>${r.cat}</dd>
         <dt>Bank amount</dt><dd>${money(r.amt)}</dd>
         <dt>Ledger amount</dt><dd>${r.led === null ? 'None' : money(r.led)}</dd>
         <dt>Ledger date</dt><dd>${r.ldate || 'None'}</dd>
         <dt>Status</dt><dd><span class="st ${r.status}">${LABEL[r.status]}</span></dd></dl>
         <p class="small">${r.note}</p>`
      : '<p class="muted">Select a transaction to see its reconciliation details.</p>';

    const months = {};
    list.forEach(t => {
      const m = t.date.slice(0, 7);
      months[m] = months[m] || { i: 0, o: 0 };
      if (t.amt > 0) months[m].i += t.amt;
      else months[m].o -= t.amt;
    });
    const keys = Object.keys(months).sort();
    const max = Math.max(1, ...keys.map(k => Math.max(months[k].i, months[k].o)));
    $('months').innerHTML = keys.length ? keys.map(k =>
      `<div class="bar-g"><div class="bar-pair">` +
      `<div class="bar in" style="height:${Math.round(months[k].i / max * 170)}px" title="Income ${money(months[k].i)}"></div>` +
      `<div class="bar out" style="height:${Math.round(months[k].o / max * 170)}px" title="Expenses ${money(months[k].o)}"></div>` +
      `</div><small>${k}</small></div>`).join('')
      : '<p class="empty">No data for these filters.</p>';

    const total = Math.max(1, list.length);
    $('statusbars').innerHTML = Object.keys(LABEL).map(k => {
      const c = list.filter(t => t.status === k).length;
      return `<div class="hbar"><span>${LABEL[k]}</span><div class="track">` +
        `<div class="fill ${k}" style="width:${c / total * 100}%"></div></div><span>${c}</span></div>`;
    }).join('');
  }

  function select(tr) {
    selected = tr.dataset.id;
    render();
    $('rows').querySelector(`tr[data-id="${selected}"]`)?.focus();
  }

  ['input', 'change'].forEach(ev => Object.values(f).forEach(el => el.addEventListener(ev, render)));
  $('reset').addEventListener('click', () => {
    f.q.value = ''; f.st.value = 'all'; f.from.value = ''; f.to.value = '';
    render();
  });
  $('rows').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) select(tr); });
  $('rows').addEventListener('keydown', e => {
    const tr = e.target.closest('tr[data-id]');
    if (tr && e.key === 'Enter') select(tr);
  });
  render();
})();
