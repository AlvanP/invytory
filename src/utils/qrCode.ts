/**
 * Builds a real, scannable QR code image URL for the given text/link.
 * Uses goqr.me's free public QR image API — no signup, no API key, and
 * no npm dependency to install. Returns a plain image URL; render it
 * with a normal <img> tag.
 */
export function getQrCodeUrl(data: string, sizePx = 200): string {
  const params = new URLSearchParams({
    size: `${sizePx}x${sizePx}`,
    data,
    margin: '8',
  })
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
}