export const FIELD_KEYS = [
  'board_id',
  'note_id',
  'action',
  'text',
  'x',
  'y',
  'width',
  'height',
  'color',
  'z_index',
  'timestamp_client',
];

export const REQUIRED_PARAMS = [
  'board_id',
  'sheet_id',
  'form_url',
  ...FIELD_KEYS.map((key) => `field_${key}`),
];

export function generateId(prefix) {
  const random = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}_${Date.now().toString(36)}_${Array.from(random, (value) => value.toString(36)).join('')}`;
}

export function buildConfigFromParams(search = window.location.search) {
  const params = new URLSearchParams(search);
  const missing = REQUIRED_PARAMS.filter((key) => !params.get(key));

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  const fields = {};
  for (const key of FIELD_KEYS) {
    fields[key] = params.get(`field_${key}`);
  }

  return {
    ok: true,
    config: {
      boardId: params.get('board_id'),
      sheetId: params.get('sheet_id'),
      sheetName: params.get('sheet_name') || '',
      gid: params.get('gid') || '',
      formUrl: params.get('form_url'),
      fields,
    },
  };
}

export function buildBoardUrl(values, baseUrl = new URL('./board.html', window.location.href)) {
  const url = new URL(baseUrl);
  url.search = '';

  for (const [key, value] of Object.entries(values)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}
