const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 })
const wholeFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export function formatNumber(value: number) {
  return wholeFormat.format(value)
}

export function formatMt(value: number) {
  return `${numberFormat.format(value)} MT`
}

export function formatLakh(value: number) {
  return `₹${numberFormat.format(value)} lakh`
}

export function formatInrFromLakh(lakh: number) {
  if (lakh >= 100) {
    const crore = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(lakh / 100)
    return `₹${crore} cr`
  }
  return formatLakh(lakh)
}

export function formatPercent(value: number) {
  return `${wholeFormat.format(Math.round(value))}%`
}

export function formatDay(isoDate: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${isoDate}T00:00:00+05:30`))
}

export function formatFullDay(isoDate: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${isoDate}T00:00:00+05:30`))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso))
}
