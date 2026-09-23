import { readFile, writeFile } from 'node:fs/promises'

const manifestPath = process.argv[2]
const metadataPath = process.argv[3]

if (!manifestPath || !metadataPath) {
  throw new Error('Usage: node scripts/upsert-project-manifest.mjs <manifest> <portfolio.json>')
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const project = JSON.parse(await readFile(metadataPath, 'utf8'))

if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.projects)) {
  throw new Error('Unsupported manifest schema')
}

const next = manifest.projects.filter((item) => item.slug !== project.slug)
next.push(project)
next.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))

const seenOrders = new Map()
for (const item of next) {
  if (seenOrders.has(item.order)) {
    throw new Error(`Duplicate portfolio order ${item.order}: ${seenOrders.get(item.order)} and ${item.slug}`)
  }
  seenOrders.set(item.order, item.slug)
}

manifest.projects = next
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Updated manifest for ${project.slug}`)
