import fs from 'node:fs'

const files = [
  'src/routes/stakeholders.tsx',
  'src/routes/licences.tsx',
  'src/routes/arrivals.tsx',
  'src/routes/trading.tsx',
  'src/routes/finance.tsx',
  'src/routes/warehouse.tsx',
  'src/routes/cold-storage.tsx',
  'src/routes/flp.tsx',
  'src/routes/parking.tsx',
  'src/routes/facilities.tsx',
  'src/routes/compliance.tsx',
  'src/routes/reports.tsx',
  'src/routes/field.tsx',
]

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8')
  if (!text.includes("from '@/routes/load'")) text = "import { loadPage } from '@/routes/load'\n" + text
  text = text.replace(/import \{([^}]+)\} from '(@\/pages\/[^']+)'/g, (_, names, path) => {
    const ids = names.split(',').map((item) => item.trim()).filter(Boolean)
    return ids.map((id) => `const ${id} = loadPage(() => import('${path}'), '${id}')`).join('\n')
  })
  fs.writeFileSync(file, text)
  console.log(file)
}
