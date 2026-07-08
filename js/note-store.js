export function reduceEventsToNotes(events, boardId) {
  const latestByNote = new Map();

  events
    .filter((event) => event.board_id === boardId && event.note_id)
    .forEach((event) => {
      const current = latestByNote.get(event.note_id);
      if (!current || compareEvents(event, current) >= 0) {
        latestByNote.set(event.note_id, event);
      }
    });

  return Array.from(latestByNote.values())
    .filter((event) => event.action !== 'delete')
    .map((event) => ({
      note_id: event.note_id,
      text: event.text,
      x: event.x,
      y: event.y,
      width: event.width,
      height: event.height,
      color: event.color || 'yellow',
      z_index: event.z_index || 1,
      updated_at: event.timestamp_client || event.timestamp_server || '',
      deleted: false,
    }))
    .sort((a, b) => a.z_index - b.z_index);
}

function compareEvents(a, b) {
  const aTime = parseEventTime(a);
  const bTime = parseEventTime(b);

  if (aTime !== bTime) {
    return aTime - bTime;
  }

  return (a._rowIndex || 0) - (b._rowIndex || 0);
}

function parseEventTime(event) {
  const client = Date.parse(event.timestamp_client);
  if (Number.isFinite(client)) return client;

  const server = Date.parse(normalizeGoogleTimestamp(event.timestamp_server));
  if (Number.isFinite(server)) return server;

  return 0;
}

function normalizeGoogleTimestamp(value) {
  if (!value) return '';
  return String(value)
    .replace(/上午\s*/, 'AM ')
    .replace(/下午\s*/, 'PM ')
    .replace(/\s+/g, ' ');
}
