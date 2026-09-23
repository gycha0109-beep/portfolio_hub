import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = await mkdtemp(join(tmpdir(), 'porthub-gate-'))
const validator = new URL('./validate-demo-package.mjs', import.meta.url).pathname

const meta = {
  schemaVersion: 1,
  slug: 'security-test',
  order: 999,
  title: 'Security Test',
  kicker: 'Gate fixture',
  description: 'Synthetic validation fixture.',
  category: 'TEST',
  accent: '#4f7cff',
  stack: ['Static'],
  problem: 'Validate the publish boundary.',
  solution: 'Reject unsafe exports.',
  evidence: ['Automated gate'],
  scope: ['Static demo'],
  preview: 'erp'
}

function run(expectSuccess, label) {
  const result = spawnSync(process.execPath, [validator, root, 'security-test'], {
    encoding: 'utf8',
  })
  const succeeded = result.status === 0
  if (succeeded !== expectSuccess) {
    throw new Error([
      `Security gate test failed: ${label}`,
      `exit=${result.status}`,
      result.stdout,
      result.stderr,
    ].join('\n'))
  }
}

try {
  await writeFile(
    join(root, 'index.html'),
    '<!doctype html><html><head><meta name="robots" content="noindex, nofollow"></head><body>demo</body></html>'
  )
  await writeFile(join(root, 'portfolio.json'), JSON.stringify(meta))
  await writeFile(join(root, 'app.js'), 'console.log("safe demo")')
  run(true, 'safe static export should pass')

  await mkdir(join(root, 'src'))
  await writeFile(join(root, 'src', 'secret.ts'), 'export const internal = true')
  run(false, 'source directory should be rejected')
  await rm(join(root, 'src'), { recursive: true, force: true })

  await writeFile(join(root, 'app.js'), 'const x = "DATABASE_URL=postgres://secret"')
  run(false, 'secret assignment should be rejected')

  await writeFile(join(root, 'app.js'), '//# sourceMappingURL=app.js.map')
  run(false, 'source map reference should be rejected')

  console.log('PortfolioSecurityGate: PASS')
} finally {
  await rm(root, { recursive: true, force: true })
}
