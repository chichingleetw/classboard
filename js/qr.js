export function renderQr(container, text) {
  container.replaceChildren();

  if (window.QRCode) {
    new window.QRCode(container, {
      text,
      width: 220,
      height: 220,
      colorDark: '#1f2933',
      colorLight: '#fffdf2',
      correctLevel: window.QRCode.CorrectLevel.M,
    });
    return;
  }

  const image = document.createElement('img');
  image.width = 220;
  image.height = 220;
  image.alt = '白板 QR Code';
  const url = new URL('https://api.qrserver.com/v1/create-qr-code/');
  url.searchParams.set('size', '220x220');
  url.searchParams.set('margin', '12');
  url.searchParams.set('data', text);
  image.src = url.toString();
  container.append(image);
}
