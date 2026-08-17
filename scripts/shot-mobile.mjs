import { chromium } from 'playwright'
const [,, outDir, ...urls] = process.argv
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[${page.url()}] ${msg.text()}`) })
page.on('pageerror', (err) => errors.push(`[${page.url()}] ${String(err)}`))
for (const url of urls) {
  const name = url.replace(/[^a-z0-9]/gi, '_').slice(0, 60)
  await page.goto(`http://localhost:5173${url}`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${outDir}/mobile${name}.png`, fullPage: true })
}
console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
await browser.close()
