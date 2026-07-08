const HEADER_ALIASES = {
  Timestamp: 'timestamp_server',
  '時間戳記': 'timestamp_server',
  board_id: 'board_id',
  note_id: 'note_id',
  action: 'action',
  text: 'text',
  x: 'x',
  y: 'y',
  width: 'width',
  height: 'height',
  color: 'color',
  z_index: 'z_index',
  timestamp_client: 'timestamp_client',
};

export async function fetchSheetEvents(config) {
  if (config.sheetName) {
    return fetchGvizRows(config.sheetId, config.sheetName);
  }

  if (config.gid) {
    return fetchCsvRows(config.sheetId, config.gid);
  }

  return fetchGvizRows(config.sheetId, '表單回應 1');
}

async function fetchGvizRows(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('無法讀取 Google Sheet');
  }

  const text = await response.text();
  const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const data = JSON.parse(jsonText);
  const headers = data.table.cols.map((col) => normalizeHeader(col.label || col.id || ''));

  return data.table.rows.map((row, index) => {
    const record = { _rowIndex: index };
    row.c.forEach((cell, cellIndex) => {
      const key = headers[cellIndex];
      if (!key) return;
      record[key] = cell?.f ?? cell?.v ?? '';
    });
    return normalizeEvent(record, index);
  });
}

async function fetchCsvRows(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('無法讀取 Google Sheet');
  }

  const csv = await response.text();
  const rows = parseCsv(csv);
  const headers = (rows.shift() || []).map(normalizeHeader);

  return rows.map((row, index) => {
    const record = { _rowIndex: index };
    row.forEach((value, cellIndex) => {
      const key = headers[cellIndex];
      if (!key) return;
      record[key] = value;
    });
    return normalizeEvent(record, index);
  });
}

function normalizeHeader(header) {
  const trimmed = String(header).trim();
  return HEADER_ALIASES[trimmed] || trimmed;
}

function normalizeEvent(record, index) {
  return {
    board_id: stringValue(record.board_id),
    note_id: stringValue(record.note_id),
    action: stringValue(record.action),
    text: stringValue(record.text),
    x: numberValue(record.x, 80),
    y: numberValue(record.y, 80),
    width: numberValue(record.width, 180),
    height: numberValue(record.height, 120),
    color: stringValue(record.color) || 'yellow',
    z_index: numberValue(record.z_index, 1),
    timestamp_client: stringValue(record.timestamp_client),
    timestamp_server: stringValue(record.timestamp_server),
    _rowIndex: index,
  };
}

function stringValue(value) {
  return value == null ? '' : String(value).trim();
}

function numberValue(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}
