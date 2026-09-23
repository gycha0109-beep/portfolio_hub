import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const manifest = JSON.parse(await readFile('portfolio.manifest.json', 'utf8'))

if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.projects)) {
  throw new Error('Invalid portfolio manifest')
}

const validator = new URL('./validate-demo-package.mjs', import.meta.url).pathname
const seen = new Set()

for (const project of manifest.projects) {
  if (seen.has(project.slug)) throw new Error(`Duplicate manifest slug: ${project.slug}`)
  seen.add(project.slug)

  const root = join('public', 'demos', project.slug)
  await stat(join(root, 'index.html'))
  await stat(join(root, 'portfolio.json'))

  const result = spawnSync(process.execPath, [validator, root, project.slug], {
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    throw new Error([
      `Public demo verification failed: ${project.slug}`,
      result.stdout,
      result.stderr,
    ].join('\n'))
  }

  const metadata = JSON.parse(await readFile(join(root, 'portfolio.json'), 'utf8'))
  for (const field of ['order', 'title', 'kicker', 'category', 'accent', 'preview']) {
    if (JSON.stringify(metadata[field]) !== JSON.stringify(project[field])) {
      throw new Error(`Manifest drift for ${project.slug}: ${field}`)
    }
  }
}

console.log(`PortfolioDemoRegistry: PASS (${manifest.projects.length} demos)`)
