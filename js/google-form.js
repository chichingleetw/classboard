export async function submitEvent(config, event) {
  const formData = new FormData();
  const timestamp = event.timestamp_client || new Date().toISOString();

  formData.append(config.fields.board_id, event.board_id);
  formData.append(config.fields.note_id, event.note_id);
  formData.append(config.fields.action, event.action);
  formData.append(config.fields.text, event.text || '');
  formData.append(config.fields.x, String(Math.round(event.x || 0)));
  formData.append(config.fields.y, String(Math.round(event.y || 0)));
  formData.append(config.fields.width, String(Math.round(event.width || 180)));
  formData.append(config.fields.height, String(Math.round(event.height || 120)));
  formData.append(config.fields.color, event.color || 'yellow');
  formData.append(config.fields.z_index, String(event.z_index || 1));
  formData.append(config.fields.timestamp_client, timestamp);

  await fetch(config.formUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData,
  });
}
