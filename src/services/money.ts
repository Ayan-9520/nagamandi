export function toPaise(rupees: number) {
  if (!Number.isFinite(rupees)) return 0
  const negative = rupees < 0
  const [whole, frac] = Math.abs(rupees).toFixed(2).split('.')
  const paise = Number(whole) * 100 + Number(frac)
  return negative ? -paise : paise
}

export function rupeeTextToPaise(text: string) {
  const trimmed = text.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const [whole, frac = ''] = trimmed.split('.')
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'))
}

export function formatPaise(paise: number) {
  const sign = paise < 0 ? '−' : ''
  const abs = Math.abs(Math.trunc(paise))
  const rupees = Math.trunc(abs / 100)
  const rem = abs % 100
  return `${sign}₹${new Intl.NumberFormat('en-IN').format(rupees)}.${String(rem).padStart(2, '0')}`
}

export function sumPaise(values: number[]) {
  return values.reduce((total, value) => total + Math.trunc(value), 0)
}

export function labelToPaise(label: string) {
  const match = label.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/)
  if (!match) return 0
  return toPaise(Number(match[1]))
}
