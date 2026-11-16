export function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((cells) => cells.some((value) => value.trim() !== ''))
}

export function escapeCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

export function toCsv(rows: string[][]) {
  return rows.map((row) => row.map((cell) => escapeCell(cell)).join(',')).join('\n')
}

export function downloadCsv(filename: string, rows: string[][]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function headerIndex(header: string[], expected: string[]) {
  const missing = expected.filter((name) => !header.map((cell) => cell.trim()).includes(name))
  if (missing.length > 0) return { ok: false as const, message: `Add these columns: ${missing.join(', ')}.` }
  const index = new Map(header.map((cell, position) => [cell.trim(), position]))
  return { ok: true as const, index }
}

export function cell(row: string[], index: Map<string, number>, name: string) {
  const position = index.get(name)
  if (position === undefined) return ''
  return (row[position] ?? '').trim()
}
