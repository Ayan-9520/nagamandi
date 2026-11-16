import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data])
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), 8 + data.length)
  return out
}

function leaf(x, y, size) {
  const nx = (x / size) * 2 - 1
  const ny = (y / size) * 2 - 1
  return nx * nx + (ny + 0.05) * (ny + 0.05) < 0.18 && ny < 0.35
}

function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const index = row + 1 + x * 4
      const mark = leaf(x, y, size)
      raw[index] = mark ? 0xe2 : 0x1f
      raw[index + 1] = mark ? 0xc2 : 0x6b
      raw[index + 2] = mark ? 0x7a : 0x45
      raw[index + 3] = 255
    }
  }
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true })
writeFileSync(new URL('../public/icons/icon-192.png', import.meta.url), png(192))
writeFileSync(new URL('../public/icons/icon-512.png', import.meta.url), png(512))
