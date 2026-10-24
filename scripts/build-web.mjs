import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'

const src = readFileSync('slides.md', 'utf8')
let out = src.replace(/<!--[\s\S]*?-->/g, '')

out = out.replace(/^---\n/, '---\npresenter: false\ndownload: false\n')
writeFileSync('slides.web.md', out)
try {
  execSync('npx slidev build slides.web.md --out dist', { stdio: 'inherit' })
} finally {
  rmSync('slides.web.md', { force: true })
}
