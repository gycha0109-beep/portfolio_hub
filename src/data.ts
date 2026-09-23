import manifest from '../portfolio.manifest.json'

export type PreviewKind = 'erp' | 'ai' | 'ops' | 'legacy'

export type Project = {
  slug: string
  index: string
  title: string
  kicker: string
  description: string
  category: string
  accent: string
  demoUrl: string
  stack: string[]
  problem: string
  solution: string
  evidence: string[]
  scope: string[]
  preview: PreviewKind
}

type ManifestProject = {
  schemaVersion: number
  slug: string
  order: number
  title: string
  kicker: string
  description: string
  category: string
  accent: string
  stack: string[]
  problem: string
  solution: string
  evidence: string[]
  scope: string[]
  preview: PreviewKind
}

const items = manifest.projects as ManifestProject[]

export const projects: Project[] = [...items]
  .sort((a, b) => a.order - b.order)
  .map((project, position, all) => ({
    ...project,
    index: String(position + 1).padStart(2, '0'),
    demoUrl: `/demo/${project.slug}/index.html`,
  }))

export const projectCount = projects.length

export const projectBySlug = (slug?: string) =>
  projects.find((project) => project.slug === slug)
