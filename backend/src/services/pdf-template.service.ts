import type { Catalog, CatalogProductEntry, CatalogConfig } from '../types/catalog'

// ──────────────────────────────────────────────
// Types (local, not exported from global types)
// ──────────────────────────────────────────────
interface RenderContext {
  catalog:  Catalog
  entries:  CatalogProductEntry[]
  config:   CatalogConfig
  imageMap: Map<string, string>  // relative URL → base64 data URI
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function safe(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function priceLabel(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === '') return ''
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (isNaN(n)) return ''
  return `Q ${n.toFixed(2)}`
}

function getImageSrc(entry: CatalogProductEntry, imageMap: Map<string, string>, baseUrl?: string): string {
  const img = entry.imageOverride ?? entry.product.image ?? null
  const src = img?.thumbnailUrl ?? img?.url ?? ''
  if (!src) return ''
  // Prefer pre-embedded base64 data URI (avoids Puppeteer network fetches)
  if (imageMap.has(src)) return imageMap.get(src)!
  if (baseUrl && src.startsWith('/')) return `${baseUrl}${src}`
  return src
}

function chunked<T>(arr: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size))
  return pages
}

function paperSize(format: string): { width: string; height: string } {
  if (format === 'A4-horizontal') return { width: '297mm', height: '210mm' }
  if (format === 'letter')        return { width: '215.9mm', height: '279.4mm' }
  return { width: '210mm', height: '297mm' } // A4 vertical default
}

function gridCols(layout: string): number {
  if (layout === 'grid6') return 3
  if (layout === 'grid9') return 3
  if (layout === 'list')  return 1
  if (layout === 'sheet') return 4
  return 2  // grid4
}

function gridRows(layout: string): number {
  if (layout === 'grid9') return 3
  return 0 // auto
}

// ──────────────────────────────────────────────
// CSS
// ──────────────────────────────────────────────
function buildCss(paper: { width: string; height: string }, cols: number): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a18;
      background: #fff;
    }
    @page {
      size: ${paper.width} ${paper.height};
      margin: 0;
    }
    .page {
      width: ${paper.width};
      min-height: ${paper.height};
      padding: 14mm 14mm 18mm;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .page:last-child { page-break-after: avoid; }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #1a1a18;
      padding-bottom: 5mm;
      margin-bottom: 7mm;
    }
    .header-brand { font-size: 18pt; font-weight: 800; letter-spacing: -0.5px; }
    .header-meta  { font-size: 9pt; color: #666; text-align: right; line-height: 1.5; }
    .catalog-name { font-size: 13pt; font-weight: 700; }

    /* ── Grid ── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(${cols}, 1fr);
      gap: 5mm;
      flex: 1;
      align-content: start;
    }

    /* ── Product card ── */
    .product-card {
      border: 1px solid #e0dfd8;
      border-radius: 3mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .product-card.list-card {
      flex-direction: row;
      align-items: center;
      gap: 4mm;
      padding: 3mm 4mm;
    }
    .product-img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      background: #f4f3ef;
      display: block;
    }
    .product-img.list-img {
      width: 14mm;
      height: 14mm;
      aspect-ratio: 1;
      flex-shrink: 0;
      border-radius: 1.5mm;
    }
    .product-img-ph {
      width: 100%;
      aspect-ratio: 1;
      background: #f4f3ef;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #bbb;
      font-size: 20pt;
    }
    .product-img-ph.list-ph {
      width: 14mm;
      height: 14mm;
      aspect-ratio: 1;
      flex-shrink: 0;
      border-radius: 1.5mm;
    }
    .product-info {
      padding: 2.5mm 3mm 3mm;
      display: flex;
      flex-direction: column;
      gap: 1mm;
      flex: 1;
    }
    .product-info.list-info { padding: 0; }
    .product-name  { font-size: 9pt; font-weight: 700; line-height: 1.3; }
    .product-code  { font-size: 7.5pt; color: #888; font-family: monospace; }
    .product-desc  { font-size: 7.5pt; color: #555; line-height: 1.3; }
    .product-price { font-size: 10pt; font-weight: 700; color: #1a1a18; margin-top: 1.5mm; }
    .product-prices-extra { font-size: 7pt; color: #888; line-height: 1.5; }
    .product-stock { font-size: 7.5pt; color: #555; }

    /* ── Footer ── */
    .footer {
      margin-top: auto;
      padding-top: 4mm;
      border-top: 1px solid #e0dfd8;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #aaa;
    }
  `
}

// ──────────────────────────────────────────────
// Product card HTML
// ──────────────────────────────────────────────
function productCardHtml(entry: CatalogProductEntry, cfg: CatalogConfig, isList: boolean, imageMap: Map<string, string>, baseUrl?: string): string {
  const p   = entry.product
  const src = getImageSrc(entry, imageMap, baseUrl)
  const imgHtml = src
    ? `<img class="product-img${isList ? ' list-img' : ''}" src="${safe(src)}" alt="${safe(p.name)}" />`
    : `<div class="product-img-ph${isList ? ' list-ph' : ''}">&#9679;</div>`

  const pricesExtra: string[] = []
  if (cfg.showPrices2to6) {
    ;([p.price2, p.price3, p.price4, p.price5, p.price6] as (string | number | null | undefined)[])
      .forEach((pr, i) => {
        const label = priceLabel(pr)
        if (label) pricesExtra.push(`P${i + 2}: ${label}`)
      })
  }

  const info = `
    <div class="product-info${isList ? ' list-info' : ''}">
      <div class="product-name">${safe(p.name)}</div>
      ${cfg.showCode && p.code ? `<div class="product-code">${safe(p.code)}</div>` : ''}
      ${cfg.showDescription && p.description ? `<div class="product-desc">${safe(p.description)}</div>` : ''}
      ${cfg.showPrice1 ? `<div class="product-price">${priceLabel(p.price1 as string | number | null) || '—'}</div>` : ''}
      ${pricesExtra.length ? `<div class="product-prices-extra">${pricesExtra.join(' &nbsp; ')}</div>` : ''}
      ${cfg.showStock && p.stock != null ? `<div class="product-stock">Stock: ${p.stock}</div>` : ''}
    </div>
  `

  return `<div class="product-card${isList ? ' list-card' : ''}">${isList ? imgHtml + info : imgHtml + info}</div>`
}

// ──────────────────────────────────────────────
// Page HTML
// ──────────────────────────────────────────────
function pageHtml(
  entries: CatalogProductEntry[],
  cfg: CatalogConfig,
  ctx: RenderContext,
  pageNum: number,
  totalPages: number,
  baseUrl?: string,
): string {
  const isList   = cfg.layout === 'list' || cfg.layout === 'sheet'
  const showHead = pageNum === 1 || cfg.logoOnEachPage
  const dateStr  = new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })

  const header = showHead ? `
    <div class="header">
      <div>
        <div class="header-brand">Aljaba</div>
        <div class="catalog-name">${safe(ctx.catalog.name)}</div>
      </div>
      <div class="header-meta">
        ${ctx.catalog.description ? `${safe(ctx.catalog.description)}<br/>` : ''}
        ${dateStr}
      </div>
    </div>
  ` : ''

  const cards = entries.map((e) => productCardHtml(e, cfg, isList, ctx.imageMap, baseUrl)).join('')

  return `
    <div class="page">
      ${header}
      <div class="products-grid">${cards}</div>
      <div class="footer">
        <span>Aljaba &mdash; Catálogo ${safe(ctx.catalog.name)}</span>
        <span>Página ${pageNum} de ${totalPages}</span>
      </div>
    </div>
  `
}

// ──────────────────────────────────────────────
// Main: buildHtml
// ──────────────────────────────────────────────
export function buildCatalogHtml(ctx: RenderContext, baseUrl?: string): string {
  const { catalog, entries, config: cfg } = ctx
  const paper = paperSize(cfg.format)
  const cols  = gridCols(cfg.layout)
  const ppp   = cfg.productsPerPage || 12
  const pages = chunked(entries, ppp)
  const total = Math.max(1, pages.length)

  const pagesHtml = pages.length === 0
    ? `<div class="page"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;">Este catálogo no tiene productos.</div></div>`
    : pages.map((chunk, i) => pageHtml(chunk, cfg, ctx, i + 1, total, baseUrl)).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${safe(catalog.name)}</title>
  <style>${buildCss(paper, cols)}</style>
</head>
<body>${pagesHtml}</body>
</html>`
}
