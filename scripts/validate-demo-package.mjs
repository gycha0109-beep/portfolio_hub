import { readFile, readdir, stat } from 'node:fs/promises'
import { basename, extname, join, relative } from 'node:path'

const root = process.argv[2]
const expectedSlug = process.argv[3]

if (!root) {
  throw new Error('Usage: node scripts/validate-demo-package.mjs <directory> [expected-slug]')
}

const forbiddenNames = new Set([
  '.git', '.github', 'node_modules', 'src', 'source', 'docs', 'tests', 'test',
  'scripts', 'migrations', 'migration', 'schema', 'schemas',
  'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
  'tsconfig.json', 'vite.config.ts', 'vite.config.js',
  'next.config.ts', 'next.config.js', 'next.config.mjs',
  'Dockerfile', 'docker-compose.yml', 'Makefile',
])

const forbiddenExtensions = new Set([
  '.ts', '.tsx', '.jsx', '.php', '.py', '.java', '.kt', '.go', '.rs',
  '.sql', '.map', '.env', '.pem', '.key', '.crt', '.p12', '.pfx',
])

const textExtensions = new Set([
  '.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.json', '.txt', '.xml',
  '.svg', '.webmanifest',
])

const forbiddenTextPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i, 'private key material'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/, 'GitHub fine-grained token'],
  [/\bghp_[A-Za-z0-9]{20,}\b/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9_-]{20,}\b/, 'API secret key'],
  [/\bAIza[0-9A-Za-z_-]{20,}\b/, 'Google API key'],
  [/\b(?:DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|GEMINI_API_KEY|RESEND_API_KEY)\s*=/i, 'secret environment assignment'],
  [/https?:\/\/(?:www\.)?github\.com\/gycha0109-beep\//i, 'private source repository URL'],
  [/https?:\/\/raw\.githubusercontent\.com\/gycha0109-beep\//i, 'private source raw URL'],
  [/sourceMappingURL\s*=/i, 'source map reference'],
]

const requiredMeta = [
  'schemaVersion', 'slug', 'order', 'title', 'kicker', 'description',
  'category', 'accent', 'stack', 'problem', 'solution', 'evidence', 'scope', 'preview',
]

const allowedPreview = new Set(['erp', 'ai', 'ops', 'legacy', 'ledger'])

const files = []
let totalBytes = 0

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const absolute = join(dir, entry.name)
    const rel = relative(root, absolute).replaceAll('\\\\', '/')
    const parts = rel.split('/')

    for (const part of parts) {
      if (forbiddenNames.has(part)) {
        throw new Error(`Forbidden export path: ${rel}`)
      }
      if (part.startsWith('.env')) {
        throw new Error(`Forbidden environment file: ${rel}`)
      }
    }

    if (entry.isDirectory()) {
      await walk(absolute)
      continue
    }

    if (!entry.isFile()) {
      throw new Error(`Unsupported export entry: ${rel}`)
    }

    const extension = extname(entry.name).toLowerCase()
    if (forbiddenExtensions.has(extension)) {
      throw new Error(`Forbidden source/sensitive extension: ${rel}`)
    }

    const info = await stat(absolute)
    totalBytes += info.size
    files.push({ absolute, rel, size: info.size, extension })
  }
}

await walk(root)

if (files.length === 0) throw new Error('Portfolio export is empty')
if (files.length > 2500) throw new Error(`Portfolio export contains too many files: ${files.length}`)
if (totalBytes > 500 * 1024 * 1024) {
  throw new Error(`Portfolio export exceeds 500 MB: ${totalBytes} bytes`)
}

const indexFile = files.find((file) => file.rel === 'index.html')
const metadataFile = files.find((file) => file.rel === 'portfolio.json')

if (!indexFile) throw new Error('index.html is required at export root')
if (!metadataFile) throw new Error('portfolio.json is required at export root')

for (const file of files) {
  if (!textExtensions.has(file.extension) && basename(file.rel) !== 'portfolio.json') continue
  if (file.size > 5 * 1024 * 1024) continue

  const body = await readFile(file.absolute, 'utf8')
  for (const [pattern, label] of forbiddenTextPatterns) {
    if (pattern.test(body)) {
      throw new Error(`Blocked ${label} in ${file.rel}`)
    }
  }
}

const indexHtml = await readFile(indexFile.absolute, 'utf8')
if (!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(indexHtml) &&
    !/<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(indexHtml)) {
  throw new Error('index.html must include robots noindex')
}

const metadata = JSON.parse(await readFile(metadataFile.absolute, 'utf8'))

for (const field of requiredMeta) {
  if (!(field in metadata)) throw new Error(`portfolio.json missing field: ${field}`)
}

if (metadata.schemaVersion !== 1) throw new Error('portfolio.json schemaVersion must be 1')
if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(metadata.slug)) {
  throw new Error('portfolio.json slug must be lowercase kebab-case')
}
if (expectedSlug && metadata.slug !== expectedSlug) {
  throw new Error(`Slug mismatch: expected ${expectedSlug}, got ${metadata.slug}`)
}
if (!Number.isInteger(metadata.order) || metadata.order < 1 || metadata.order > 999) {
  throw new Error('portfolio.json order must be an integer from 1 to 999')
}
if (!/^#[0-9a-fA-F]{6}$/.test(metadata.accent)) {
  throw new Error('portfolio.json accent must be a 6-digit hex color')
}
if (!allowedPreview.has(metadata.preview)) {
  throw new Error(`Unsupported preview kind: ${metadata.preview}`)
}
for (const field of ['stack', 'evidence', 'scope']) {
  if (!Array.isArray(metadata[field]) || metadata[field].length === 0) {
    throw new Error(`portfolio.json ${field} must be a non-empty array`)
  }
}
for (const field of ['title', 'kicker', 'description', 'category', 'problem', 'solution']) {
  if (typeof metadata[field] !== 'string' || metadata[field].trim().length === 0) {
    throw new Error(`portfolio.json ${field} must be a non-empty string`)
  }
}

console.log(JSON.stringify({
  ok: true,
  slug: metadata.slug,
  files: files.length,
  bytes: totalBytes,
}, null, 2))
