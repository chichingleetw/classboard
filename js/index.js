import { FIELD_KEYS, buildBoardUrl, generateId } from './config.js';
import { renderQr } from './qr.js';

const form = document.querySelector('#setup-form');
const resultPanel = document.querySelector('#result-panel');
const studentLink = document.querySelector('#student-link');
const copyButton = document.querySelector('#copy-link');
const openBoard = document.querySelector('#open-board');
const copyStatus = document.querySelector('#copy-status');
const resetBoardIdButton = document.querySelector('#reset-board-id');
const qrCode = document.querySelector('#qr-code');

let boardId = generateId('board');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = readFormValues();
  const boardUrl = buildBoardUrl({ board_id: boardId, ...values });

  studentLink.value = boardUrl;
  openBoard.href = boardUrl;
  renderQr(qrCode, boardUrl);
  resultPanel.classList.remove('hidden');
  copyStatus.textContent = '白板連結已產生。';
});

resetBoardIdButton.addEventListener('click', () => {
  boardId = generateId('board');
  copyStatus.textContent = '已重產 board_id，請重新按「產生白板連結」。';
});

copyButton.addEventListener('click', async () => {
  if (!studentLink.value) return;

  try {
    await navigator.clipboard.writeText(studentLink.value);
    copyStatus.textContent = '已複製連結。';
  } catch {
    studentLink.select();
    document.execCommand('copy');
    copyStatus.textContent = '已選取並嘗試複製連結。';
  }
});

function readFormValues() {
  const formData = new FormData(form);
  const values = {
    sheet_id: clean(formData.get('sheet_id')),
    sheet_name: clean(formData.get('sheet_name')),
    gid: clean(formData.get('gid')),
    form_url: normalizeFormUrl(clean(formData.get('form_url'))),
  };

  for (const key of FIELD_KEYS) {
    values[`field_${key}`] = clean(formData.get(`field_${key}`));
  }

  return values;
}

function clean(value) {
  return String(value || '').trim();
}

function normalizeFormUrl(url) {
  if (!url) return '';
  return url.replace('/viewform', '/formResponse').replace('/edit', '/formResponse');
}
