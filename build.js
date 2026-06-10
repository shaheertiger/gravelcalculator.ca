/* Static page generator for GravelCalculator.ca
   Run: node build.js
   Emits one HTML file per page config below, all sharing header/footer/calculator. */
const fs = require("fs");

const SITE = "https://www.gravelcalculator.ca";
const YEAR = 2026;
const LASTMOD = "2026-06-10";
const ADS_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";

/* ---- density options (value = t/m3) ---- */
const DENSITIES = [
  { v: "1.522", label: "Gravel, loose dry (1.52 t/m³)" },
  { v: "1.682", label: "Gravel, dry 6–50 mm (1.68 t/m³)" },
  { v: "2.0", label: "Gravel, wet 6–50 mm (2.00 t/m³)" },
  { v: "1.788", label: "Pea gravel (1.79 t/m³)" },
  { v: "1.602", label: "Crushed stone / Crusher run (1.60 t/m³)" },
  { v: "1.682c", label: "Limestone, crushed (1.68 t/m³)", real: "1.682" },
  { v: "1.442", label: "River rock (1.44 t/m³)" },
  { v: "custom", label: "Custom density…" }
];

function densityOptions(selected) {
  return DENSITIES.map(d => {
    const val = d.real || d.v;
    const value = d.v === "custom" ? "custom" : val;
    const isSel = d.v === selected || val === selected ? " selected" : "";
    return `              <option value="${value}"${isSel}>${d.label}</option>`;
  }).join("\n");
}

/* ---- shared calculator block ---- */
function calcBlock(cfg) {
  const d = cfg.defaults || {};
  const areaUnitSel = u => (d.areaUnit || "m2") === u ? " selected" : "";
  const depthUnitSel = u => (d.depthUnit || "cm") === u ? " selected" : "";
  return `    <div class="calc-card">
      <div class="calc-bar">${cfg.calcBar || "Enter your measurements and click Calculate"}</div>
      <form id="gravel-form" class="calc-grid">
        <div class="row">
          <span class="label">Area to cover</span>
          <div class="control shape-toggle" role="radiogroup" aria-label="Area shape">
            <label><input type="radio" name="shape" value="area"${(d.shape||"area")==="area"?" checked":""}> Total area</label>
            <label><input type="radio" name="shape" value="rect"${d.shape==="rect"?" checked":""}> Rectangle</label>
            <label><input type="radio" name="shape" value="circle"${d.shape==="circle"?" checked":""}> Circle</label>
          </div>
        </div>
        <div class="row shape-fields${(d.shape||"area")==="area"?"":" hidden"}" data-shape="area">
          <label class="label" for="total-area">Total area</label>
          <div class="control">
            <input type="number" id="total-area" value="${d.area!=null?d.area:200}" min="0" step="any" inputmode="decimal">
            <select id="area-unit" aria-label="Area unit">
              <option value="m2"${areaUnitSel("m2")}>square metres</option>
              <option value="ft2"${areaUnitSel("ft2")}>square feet</option>
              <option value="yd2"${areaUnitSel("yd2")}>square yards</option>
            </select>
          </div>
        </div>
        <div class="row shape-fields${d.shape==="rect"?"":" hidden"}" data-shape="rect">
          <label class="label" for="rect-length">Length &amp; width</label>
          <div class="control">
            <input type="number" id="rect-length" placeholder="Length" min="0" step="any" inputmode="decimal">
            <input type="number" id="rect-width" placeholder="Width" min="0" step="any" inputmode="decimal">
            <select id="length-unit" aria-label="Length unit">
              <option value="m">metres</option>
              <option value="cm">centimetres</option>
              <option value="ft" selected>feet</option>
              <option value="in">inches</option>
              <option value="yd">yards</option>
            </select>
          </div>
        </div>
        <div class="row shape-fields${d.shape==="circle"?"":" hidden"}" data-shape="circle">
          <label class="label" for="circle-d">Diameter</label>
          <div class="control">
            <input type="number" id="circle-d" placeholder="Diameter" min="0" step="any" inputmode="decimal">
            <select id="circle-unit" aria-label="Diameter unit">
              <option value="m">metres</option>
              <option value="cm">centimetres</option>
              <option value="ft" selected>feet</option>
              <option value="in">inches</option>
              <option value="yd">yards</option>
            </select>
          </div>
        </div>
        <div class="row">
          <label class="label" for="depth">Depth of gravel</label>
          <div class="control">
            <input type="number" id="depth" value="${d.depth!=null?d.depth:3}" min="0" step="any" inputmode="decimal">
            <select id="depth-unit" aria-label="Depth unit">
              <option value="cm"${depthUnitSel("cm")}>cm</option>
              <option value="m"${depthUnitSel("m")}>metres</option>
              <option value="in"${depthUnitSel("in")}>inches</option>
              <option value="ft"${depthUnitSel("ft")}>feet</option>
            </select>
          </div>
        </div>
        <div class="row">
          <label class="label" for="density">Gravel density</label>
          <div class="control">
            <select id="density">
${densityOptions(d.density || "1.522")}
            </select>
          </div>
        </div>
        <div class="row hidden" id="custom-density-row">
          <label class="label" for="custom-density">Custom density</label>
          <div class="control">
            <input type="number" id="custom-density" value="1.5" min="0" step="any" inputmode="decimal">
            <span class="suffix">t/m³</span>
          </div>
        </div>
        <div class="row">
          <label class="label" for="price">Price (optional)</label>
          <div class="control">
            <span class="prefix">$</span>
            <input type="number" id="price" placeholder="0.00" min="0" step="any" inputmode="decimal">
            <select id="price-unit" aria-label="Price unit">
              <option value="t"${(d.priceUnit||"t")==="t"?" selected":""}>per tonne</option>
              <option value="kg"${d.priceUnit==="kg"?" selected":""}>per kg</option>
              <option value="m3"${d.priceUnit==="m3"?" selected":""}>per m³</option>
              <option value="yd3"${d.priceUnit==="yd3"?" selected":""}>per cubic yard</option>
            </select>
          </div>
        </div>
        <div class="row actions">
          <span class="label" aria-hidden="true"></span>
          <div class="control">
            <button type="submit" class="btn btn-primary">Calculate</button>
            <button type="reset" class="btn btn-ghost" id="clear-btn">Clear</button>
          </div>
        </div>
      </form>
      <div id="results" class="results hidden" aria-live="polite">
        <h3>Estimated gravel needed</h3>
        <div class="result-grid">
          <div class="result-tile"><span class="rt-value" id="r-volume-yd3">—</span><span class="rt-label">cubic yards (yd³)</span></div>
          <div class="result-tile"><span class="rt-value" id="r-weight-t">—</span><span class="rt-label">tonnes (metric)</span></div>
          <div class="result-tile"><span class="rt-value" id="r-volume-m3">—</span><span class="rt-label">cubic metres (m³)</span></div>
          <div class="result-tile"><span class="rt-value" id="r-volume-ft3">—</span><span class="rt-label">cubic feet (ft³)</span></div>
          <div class="result-tile"><span class="rt-value" id="r-weight-kg">—</span><span class="rt-label">kilograms</span></div>
          <div class="result-tile"><span class="rt-value" id="r-weight-lb">—</span><span class="rt-label">pounds (lb)</span></div>
        </div>
        <p class="result-cost hidden" id="r-cost-wrap">Estimated material cost: <strong id="r-cost">—</strong></p>
        <p class="result-note">Estimates only. Order 5–10% extra for compaction and settling. Costs exclude labour and delivery.</p>
      </div>
    </div>`;
}

/* ---- list of all calculators for nav + grid ---- */
const CALCS = [
  { slug: "", name: "Gravel Calculator" },
  { slug: "cubic-yards-of-gravel.html", name: "Cubic Yards Calculator" },
  { slug: "gravel-tonnage-calculator.html", name: "Gravel Tonnage Calculator" },
  { slug: "gravel-coverage-calculator.html", name: "Gravel Coverage Calculator" },
  { slug: "bulk-bagged-gravel-calculator.html", name: "Bulk &amp; Bagged Gravel Calculator" },
  { slug: "pea-gravel-calculator.html", name: "Pea Gravel Calculator" },
  { slug: "gravel-driveway-calculator.html", name: "Driveway Gravel Calculator" },
  { slug: "crushed-gravel-calculator.html", name: "Crushed Gravel Calculator" },
  { slug: "french-drain-gravel-calculator.html", name: "French Drain Calculator" },
  { slug: "patio-gravel-calculator.html", name: "Patio Gravel Calculator" },
  { slug: "aquarium-gravel-calculator.html", name: "Aquarium Gravel Calculator" },
  { slug: "calculateur-de-gravier.html", name: "Calculateur de Gravier (FR)" }
];

function calcGrid(currentSlug) {
  const cards = CALCS.filter(c => c.slug !== currentSlug).map(c =>
    `      <a class="calc-tile" href="/${c.slug}">${c.name}</a>`).join("\n");
  return `  <section id="calculators" aria-labelledby="more-calcs">
    <h2 id="more-calcs">More gravel calculators</h2>
    <div class="calc-tiles">
${cards}
    </div>
  </section>`;
}

function header(currentSlug) {
  return `<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">▰</span><span class="brand-name">Gravel<span class="brand-accent">Calculator</span>.ca</span></a>
    <nav class="main-nav" aria-label="Primary">
      <a href="/">Calculator</a>
      <a href="/cubic-yards-of-gravel.html">Yards</a>
      <a href="/gravel-driveway-calculator.html">Driveway</a>
      <a href="/pea-gravel-calculator.html">Pea Gravel</a>
      <a href="/calculators.html">All Tools</a>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap footer-inner">
    <p class="footer-brand">Gravel<span class="brand-accent">Calculator</span>.ca</p>
    <p>Free gravel, tonnage and cost estimator for Canadian landscaping and construction projects.</p>
    <nav class="footer-nav" aria-label="Footer">
      <a href="/">Home</a>
      <a href="/cubic-yards-of-gravel.html">Cubic Yards</a>
      <a href="/gravel-tonnage-calculator.html">Tonnage</a>
      <a href="/pea-gravel-calculator.html">Pea Gravel</a>
      <a href="/gravel-driveway-calculator.html">Driveway</a>
      <a href="/crushed-gravel-calculator.html">Crushed Gravel</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
      <a href="/sitemap.xml">Sitemap</a>
    </nav>
    <p class="copyright">© ${YEAR} GravelCalculator.ca · Estimates only.</p>
  </div>
</footer>`;
}

function adSlot(slot) {
  return `  <aside class="ad-slot" aria-label="Advertisement">
    <span class="ad-tag">Advertisement</span>
    <ins class="adsbygoogle" style="display:block" data-ad-client="${ADS_CLIENT}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </aside>`;
}

function faqJsonLd(faqs) {
  return JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
  });
}
function faqHtml(faqs) {
  return `  <section id="faq">
    <h2>Frequently asked questions</h2>
${faqs.map((f, i) => `    <details${i === 0 ? " open" : ""}><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n")}
  </section>`;
}

function page(cfg) {
  const url = `${SITE}/${cfg.slug}`;
  const customCalc = cfg.customCalc || calcBlock(cfg);
  const scriptTag = cfg.script || "/script.js";
  return `<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cfg.title}</title>
<meta name="description" content="${cfg.desc}">
<meta name="keywords" content="${cfg.keywords}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#1f6f43">
<!-- Bing Webmaster Tools: replace with your verification code (or use BingSiteAuth.xml) -->
<meta name="msvalidate.01" content="REPLACE_WITH_BING_VERIFICATION_CODE">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GravelCalculator.ca">
<meta property="og:title" content="${cfg.title}">
<meta property="og:description" content="${cfg.desc}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${cfg.title}">
<meta name="twitter:description" content="${cfg.desc}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"${cfg.appName}","url":"${url}","applicationCategory":"UtilitiesApplication","operatingSystem":"All","browserRequirements":"Requires JavaScript","description":"${cfg.desc}","inLanguage":"en-CA","isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"CAD"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"${cfg.crumb}","item":"${url}"}]}
</script>
<script type="application/ld+json">
${faqJsonLd(cfg.faqs)}
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}" crossorigin="anonymous"></script>
</head>
<body>
${header(cfg.slug)}
<nav class="breadcrumbs wrap" aria-label="Breadcrumb">
  <ol><li><a href="/">Home</a></li><li aria-current="page">${cfg.crumb}</li></ol>
</nav>
<main class="wrap">
  <article>
  <h1>${cfg.h1}</h1>
  <p class="lede">${cfg.lede}</p>

  <section id="calculator" aria-labelledby="calc-heading">
    <h2 id="calc-heading" class="visually-hidden">${cfg.h1} Tool</h2>
${customCalc}
  </section>

${adSlot(cfg.adSlots ? cfg.adSlots[0] : "0000000000")}

${cfg.content}

${adSlot(cfg.adSlots ? cfg.adSlots[1] : "1111111111")}

${faqHtml(cfg.faqs)}

${calcGrid(cfg.slug)}

  <p class="disclaimer"><strong>Disclaimer:</strong> Results are estimates based on the values you enter and typical material densities. Actual quantities vary with gravel type, particle size, moisture and compaction. Cost estimates cover material only and exclude labour, delivery and taxes. Confirm quantities with your supplier.</p>
  </article>
</main>
${footer()}
<script src="${scriptTag}" defer></script>
</body>
</html>
`;
}

/* =================== PAGE CONFIGS =================== */
const pages = [];

/* 1. Cubic yards / yards cluster */
pages.push({
  slug: "cubic-yards-of-gravel.html",
  title: "Gravel Calculator in Yards | Cubic Yards of Gravel Calculator",
  desc: "Calculate cubic yards of gravel fast. Enter area in feet and depth in inches to find how many yards of gravel you need, plus tonnes and cost. Free yardage calculator.",
  keywords: "gravel calculator yards, gravel calculator in yards, calculate yards of gravel, cubic yards of gravel, how to calculate yards of gravel, gravel yardage calculator, yard calculator for gravel, cubic yard calculator gravel",
  appName: "Cubic Yards of Gravel Calculator",
  crumb: "Cubic Yards Calculator",
  h1: "Cubic Yards of Gravel Calculator",
  lede: "Find out <strong>how many cubic yards of gravel</strong> you need. Enter the area in square feet (or use length × width) and the depth in inches — the calculator returns the gravel in <strong>cubic yards</strong>, plus tonnes, cubic metres and an optional cost.",
  calcBar: "Enter area in feet and depth in inches to get cubic yards",
  defaults: { shape: "area", area: 500, areaUnit: "ft2", depth: 3, depthUnit: "in", density: "1.522", priceUnit: "yd3" },
  adSlots: ["2222222201", "2222222202"],
  content: `  <section id="guide">
    <h2>How to calculate cubic yards of gravel</h2>
    <p>Gravel is usually sold and delivered by the <strong>cubic yard</strong> (yd³) in North America. To work out yardage by hand:</p>
    <ol class="steps">
      <li>Measure the <strong>length and width in feet</strong> and multiply them to get square feet.</li>
      <li>Convert the <strong>depth from inches to feet</strong> (inches ÷ 12).</li>
      <li>Multiply area × depth to get <strong>cubic feet</strong>.</li>
      <li>Divide cubic feet by <strong>27</strong> to get <strong>cubic yards</strong>.</li>
    </ol>
    <div class="formula-box">
      <p class="formula"><strong>Cubic yards</strong> = (Length ft × Width ft × Depth ft) ÷ 27</p>
      <p class="formula"><strong>Depth ft</strong> = Depth inches ÷ 12</p>
    </div>
    <h3>Example</h3>
    <p>A 500 ft² area at 3 inches deep: 500 × (3 ÷ 12) = 125 ft³. Then 125 ÷ 27 ≈ <strong>4.6 cubic yards</strong> of gravel.</p>
  </section>
  <section id="coverage">
    <h2>Cubic yards of gravel per area (at common depths)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Area</th><th>2&quot; deep</th><th>3&quot; deep</th><th>4&quot; deep</th><th>6&quot; deep</th></tr></thead>
      <tbody>
        <tr><td>100 ft²</td><td>0.6 yd³</td><td>0.9 yd³</td><td>1.2 yd³</td><td>1.9 yd³</td></tr>
        <tr><td>250 ft²</td><td>1.5 yd³</td><td>2.3 yd³</td><td>3.1 yd³</td><td>4.6 yd³</td></tr>
        <tr><td>500 ft²</td><td>3.1 yd³</td><td>4.6 yd³</td><td>6.2 yd³</td><td>9.3 yd³</td></tr>
        <tr><td>1000 ft²</td><td>6.2 yd³</td><td>9.3 yd³</td><td>12.3 yd³</td><td>18.5 yd³</td></tr>
      </tbody>
    </table></div>
    <p class="result-note">1 cubic yard of typical gravel weighs roughly 1.1–1.4 tonnes (1.2–1.5 US tons).</p>
  </section>`,
  faqs: [
    { q: "How do I calculate yards of gravel?", a: "Multiply length (ft) × width (ft) × depth (ft) to get cubic feet, then divide by 27 to get cubic yards. For depth in inches, divide inches by 12 first. The calculator above does this automatically." },
    { q: "How many square feet does a yard of gravel cover?", a: "One cubic yard covers about 162 ft² at 2 inches deep, 108 ft² at 3 inches, or 81 ft² at 4 inches deep." },
    { q: "How much does a yard of gravel weigh?", a: "A cubic yard of typical gravel weighs about 1.1–1.4 tonnes (roughly 2,400–3,000 lb), depending on the gravel type and moisture." },
    { q: "How many yards of gravel in a tonne?", a: "Roughly 0.7–0.9 cubic yards per tonne for typical gravel. Wet or dense stone gives fewer yards per tonne." }
  ]
});

/* 2. Gravel tonnage */
pages.push({
  slug: "gravel-tonnage-calculator.html",
  title: "Gravel Tonnage Calculator | Calculate Tonnes of Gravel Needed",
  desc: "Calculate gravel tonnage instantly. Enter area, depth and gravel type to find how many tonnes (and kg or pounds) of gravel you need, plus cubic yards and cost.",
  keywords: "calculate gravel tonnage, gravel tonnage calculator, calculate tonnage of gravel, tonnes of gravel, gravel weight calculator, how much does gravel weigh",
  appName: "Gravel Tonnage Calculator",
  crumb: "Tonnage Calculator",
  h1: "Gravel Tonnage Calculator",
  lede: "Work out <strong>how many tonnes of gravel</strong> you need. Enter your area and depth, choose the gravel type, and the calculator converts the volume into <strong>tonnes, kilograms and pounds</strong> using the material density.",
  calcBar: "Enter area, depth and gravel type to get tonnage",
  defaults: { shape: "area", area: 100, areaUnit: "m2", depth: 5, depthUnit: "cm", density: "1.602", priceUnit: "t" },
  adSlots: ["2222222301", "2222222302"],
  content: `  <section id="guide">
    <h2>How to calculate gravel tonnage</h2>
    <p>Gravel is delivered by weight, so converting volume to <strong>tonnes</strong> matters for ordering. The volume is multiplied by the material's <strong>density</strong>:</p>
    <div class="formula-box">
      <p class="formula"><strong>Tonnes</strong> = Volume (m³) × Density (t/m³)</p>
      <p class="formula"><strong>Volume (m³)</strong> = Area (m²) × Depth (m)</p>
    </div>
    <h3>Typical gravel densities</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Material</th><th>Density (t/m³)</th><th>≈ lb/yd³</th></tr></thead>
      <tbody>
        <tr><td>Loose dry gravel</td><td>1.52</td><td>2,565</td></tr>
        <tr><td>Crushed stone / crusher run</td><td>1.60</td><td>2,700</td></tr>
        <tr><td>Pea gravel</td><td>1.79</td><td>3,015</td></tr>
        <tr><td>Wet gravel</td><td>2.00</td><td>3,370</td></tr>
        <tr><td>River rock</td><td>1.44</td><td>2,430</td></tr>
      </tbody>
    </table></div>
    <h3>Example</h3>
    <p>100 m² at 5 cm deep = 5 m³. With crusher run at 1.60 t/m³ that is 5 × 1.60 = <strong>8 tonnes</strong> of gravel.</p>
  </section>`,
  faqs: [
    { q: "How do I calculate gravel tonnage?", a: "Multiply the volume in cubic metres by the gravel density in tonnes per cubic metre. For example, 5 m³ × 1.6 t/m³ = 8 tonnes. The calculator does this for any units." },
    { q: "How much does 1 cubic metre of gravel weigh?", a: "About 1.5 tonnes for typical gravel, ranging from ~1.44 t/m³ for river rock to ~2.0 t/m³ for wet gravel." },
    { q: "How many tonnes of gravel do I need for a driveway?", a: "A typical 50 m² driveway at 10 cm deep needs about 8 tonnes of crushed gravel. Use the calculator with your exact size and depth." },
    { q: "How much area does a tonne of gravel cover?", a: "About 13 m² (140 ft²) at 5 cm (2 in) deep for typical gravel." }
  ]
});

/* 3. Pea gravel */
pages.push({
  slug: "pea-gravel-calculator.html",
  title: "Pea Gravel Calculator | How Much Pea Gravel Do I Need?",
  desc: "Free pea gravel calculator. Estimate how much pea gravel you need for a patio, path or garden in cubic yards, tonnes, bags and cost. Metric and imperial units.",
  keywords: "pea gravel calculator, calculate pea gravel, calculate pea gravel needed, calculator for pea gravel, calculating pea gravel, pea gravel coverage, how much pea gravel do i need",
  appName: "Pea Gravel Calculator",
  crumb: "Pea Gravel Calculator",
  h1: "Pea Gravel Calculator",
  lede: "Estimate <strong>how much pea gravel you need</strong> for a patio, walkway, garden bed or play area. The density is preset to pea gravel — just enter the area and depth to get cubic yards, tonnes, bags and cost.",
  calcBar: "Enter area and depth — density preset to pea gravel",
  defaults: { shape: "area", area: 200, areaUnit: "ft2", depth: 2, depthUnit: "in", density: "1.788", priceUnit: "yd3" },
  adSlots: ["2222222401", "2222222402"],
  content: `  <section id="guide">
    <h2>How much pea gravel do I need?</h2>
    <p><strong>Pea gravel</strong> is small (≈6–10 mm), rounded stone ideal for patios, paths, play areas and drainage. To estimate it, multiply the area by the depth, then convert to weight using a density of about <strong>1.79 t/m³</strong> (≈3,015 lb/yd³).</p>
    <ol class="steps">
      <li>Measure the area to cover.</li>
      <li>Choose a depth — <strong>2 inches (5 cm)</strong> is typical for pea gravel; use 3 inches for a softer, deeper layer.</li>
      <li>Calculate the volume, then the weight and number of bags.</li>
    </ol>
    <h3>Pea gravel coverage</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Depth</th><th>Coverage per tonne</th><th>Coverage per yd³</th></tr></thead>
      <tbody>
        <tr><td>2.5 cm (1 in)</td><td>≈ 22 m² (235 ft²)</td><td>≈ 30 m² (320 ft²)</td></tr>
        <tr><td>5 cm (2 in)</td><td>≈ 11 m² (118 ft²)</td><td>≈ 15 m² (160 ft²)</td></tr>
        <tr><td>7.5 cm (3 in)</td><td>≈ 7.4 m² (79 ft²)</td><td>≈ 10 m² (108 ft²)</td></tr>
      </tbody>
    </table></div>
    <h3>How many bags of pea gravel?</h3>
    <p>Bagged pea gravel is often sold in <strong>0.5 ft³</strong> bags (about 50 lb). There are roughly <strong>54 bags per cubic yard</strong>. For larger jobs, bulk delivery by the tonne or cubic yard is far cheaper.</p>
  </section>`,
  faqs: [
    { q: "How much pea gravel do I need?", a: "Multiply the area by the depth (commonly 2 inches) to get the volume, then multiply by 1.79 t/m³ for the weight. The calculator above does this and shows bags, tonnes and cubic yards." },
    { q: "How deep should pea gravel be?", a: "About 2 inches (5 cm) for paths and decorative areas, or up to 3 inches for a softer surface or play area. Use landscape fabric underneath to limit sinking and weeds." },
    { q: "How many bags of pea gravel in a cubic yard?", a: "Around 54 half-cubic-foot bags per cubic yard. Bulk delivery is cheaper for anything over about one cubic yard." },
    { q: "How much does pea gravel weigh?", a: "Pea gravel weighs about 1.79 tonnes per cubic metre, or roughly 3,000 lb per cubic yard." }
  ]
});

/* 4. Driveway */
pages.push({
  slug: "gravel-driveway-calculator.html",
  title: "Gravel Driveway Calculator | How Much Gravel for a Driveway",
  desc: "Gravel driveway calculator: estimate how much gravel you need for a driveway in cubic yards and tonnes, including base and top layers, plus cost. Free and easy.",
  keywords: "gravel driveway calculator, driveway gravel calculator, gravel calculator for driveway, calculating driveway gravel, calculate gravel needed for driveway, calculator for gravel driveway",
  appName: "Gravel Driveway Calculator",
  crumb: "Driveway Calculator",
  h1: "Gravel Driveway Calculator",
  lede: "Estimate <strong>how much gravel you need for a driveway</strong>. Enter the driveway length and width and a depth — the calculator returns cubic yards, tonnes and cost. Defaults are set for a typical driveway depth.",
  calcBar: "Enter driveway length × width and depth",
  defaults: { shape: "rect", depth: 4, depthUnit: "in", density: "1.602", priceUnit: "t" },
  adSlots: ["2222222501", "2222222502"],
  content: `  <section id="guide">
    <h2>How much gravel for a driveway?</h2>
    <p>A gravel driveway is usually built in layers. A common approach for a residential driveway is a <strong>total depth of 4–6 inches (10–15 cm)</strong>, sometimes split into a coarse base and a finer top:</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Layer</th><th>Material</th><th>Depth</th></tr></thead>
      <tbody>
        <tr><td>Base / sub-base</td><td>Larger crushed stone (e.g. 2&quot;)</td><td>10 cm (4 in)</td></tr>
        <tr><td>Top layer</td><td>3/4&quot; crushed gravel or crusher run</td><td>5 cm (2 in)</td></tr>
      </tbody>
    </table></div>
    <h3>Example</h3>
    <p>A driveway 20 ft × 10 ft (200 ft²) at 4 inches deep: 200 × (4 ÷ 12) = 66.7 ft³ ≈ <strong>2.5 cubic yards</strong>, or about <strong>3.2 tonnes</strong> of crushed gravel. Add 10% extra for compaction.</p>
    <h3>Tips for ordering driveway gravel</h3>
    <ul class="use-list">
      <li>Use <strong>angular crushed gravel</strong> (not round) so it locks together and resists rutting.</li>
      <li>A geotextile fabric under the base helps prevent the gravel sinking into soft ground.</li>
      <li>Compact each layer; order ~10% extra to allow for compaction and edges.</li>
    </ul>
  </section>`,
  faqs: [
    { q: "How much gravel do I need for a driveway?", a: "Multiply the driveway length × width to get the area, then multiply by depth (typically 4–6 inches) for the volume. A 200 ft² driveway at 4 inches needs about 2.5 cubic yards (≈3 tonnes). Use the calculator for your exact size." },
    { q: "How deep should a gravel driveway be?", a: "4–6 inches (10–15 cm) total for a residential driveway, often built as a coarse base layer plus a finer crushed-gravel top layer." },
    { q: "What is the best gravel for a driveway?", a: "Angular crushed stone or crusher run (e.g. 3/4 inch minus) compacts into a firm, stable surface. Avoid smooth round gravel for the driving surface as it shifts underfoot." },
    { q: "How many tonnes of gravel for a driveway?", a: "Roughly 1.3 tonnes per cubic yard of crushed gravel. A typical small driveway needs 3–6 tonnes; the calculator gives an exact figure." }
  ]
});

/* 5. Crushed gravel (Canadian sizes) */
pages.push({
  slug: "crushed-gravel-calculator.html",
  title: "Crushed Gravel Calculator | 3/4&quot;, 20mm &amp; Clear Stone (Canada)",
  desc: "Crushed gravel calculator for 3/4 inch, 20mm, crusher run and 0-3/4 clear stone. Estimate tonnes and cubic yards of crushed stone needed for bases and driveways.",
  keywords: "crushed gravel calculator, 3/4 gravel calculator, 3 4 crushed gravel calculator, 20mm gravel calculator, 0-3/4 gravel calculator, 3 4 clear gravel calculator, crushed stone calculator, aggregate calculator gravel",
  appName: "Crushed Gravel Calculator",
  crumb: "Crushed Gravel Calculator",
  h1: "Crushed Gravel Calculator (3/4&quot;, 20mm &amp; Clear Stone)",
  lede: "Estimate <strong>crushed gravel and crushed stone</strong> for bases, driveways and drainage — including common Canadian sizes like <strong>3/4&quot; (20 mm) crush, crusher run and 0–3/4&quot; clear stone</strong>. Get tonnes and cubic yards instantly.",
  calcBar: "Enter area and depth — density preset to crushed stone",
  defaults: { shape: "area", area: 50, areaUnit: "m2", depth: 10, depthUnit: "cm", density: "1.602", priceUnit: "t" },
  adSlots: ["2222222601", "2222222602"],
  content: `  <section id="guide">
    <h2>Crushed gravel sizes in Canada</h2>
    <p>Crushed gravel is mechanically crushed stone with angular edges that compact into a firm surface. Common Canadian products:</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Product</th><th>Size</th><th>Typical use</th></tr></thead>
      <tbody>
        <tr><td>3/4&quot; (20 mm) crush / crusher run</td><td>20 mm minus + fines</td><td>Driveways, compacted base — packs hard</td></tr>
        <tr><td>0–3/4&quot; clear / clear stone</td><td>20 mm, washed, no fines</td><td>Drainage, French drains, under slabs</td></tr>
        <tr><td>5/8&quot; (16 mm) minus</td><td>16 mm + fines</td><td>Pathways, fine grading layer</td></tr>
        <tr><td>2&quot; (50 mm) crush</td><td>50 mm minus</td><td>Heavy base / sub-base</td></tr>
      </tbody>
    </table></div>
    <h3>Crush vs. clear stone</h3>
    <p><strong>Crush</strong> (crusher run) contains stone dust/fines, so it <em>compacts</em> into a solid surface — best for driveways and bases. <strong>Clear stone</strong> is washed with no fines, so it <em>drains</em> freely — best for French drains and under-slab applications.</p>
    <h3>Density used</h3>
    <p>Crushed stone / crusher run is calculated at about <strong>1.60 t/m³</strong> (≈2,700 lb/yd³). Clear stone is slightly lighter once washed.</p>
  </section>`,
  faqs: [
    { q: "How much 3/4 crushed gravel do I need?", a: "Multiply area × depth for the volume, then multiply by ~1.6 t/m³ for tonnes. For a 50 m² area at 10 cm deep that is 5 m³ ≈ 8 tonnes of 3/4 inch crush. The calculator gives exact figures." },
    { q: "What is the difference between crush and clear stone?", a: "Crush (crusher run) includes stone dust and compacts into a hard surface, ideal for driveways and bases. Clear stone is washed with no fines and drains freely, ideal for French drains and under slabs." },
    { q: "How much does 3/4 crushed gravel weigh?", a: "About 1.6 tonnes per cubic metre, or roughly 1.3 tonnes (1.4 US tons) per cubic yard." },
    { q: "What depth of crushed gravel for a base?", a: "Typically 10 cm (4 in) for a patio or path base and 10–15 cm (4–6 in) for a driveway, compacted in layers." }
  ]
});

/* 6. French drain */
pages.push({
  slug: "french-drain-gravel-calculator.html",
  title: "French Drain Gravel Calculator | Stone for a Trench Drain",
  desc: "French drain gravel calculator. Estimate cubic yards and tonnes of clear/drainage stone for a French drain trench by length, width and depth. Free tool.",
  keywords: "calculate gravel for french drain, french drain gravel calculator, drainage gravel calculator, calculate gravel base, clear stone calculator",
  appName: "French Drain Gravel Calculator",
  crumb: "French Drain Calculator",
  h1: "French Drain Gravel Calculator",
  lede: "Estimate the <strong>drainage gravel for a French drain</strong>. Enter the trench length and width and the gravel depth around the pipe to get cubic yards and tonnes of clear stone.",
  calcBar: "Enter trench length × width and gravel depth",
  defaults: { shape: "rect", depth: 8, depthUnit: "in", density: "1.522", priceUnit: "t" },
  adSlots: ["2222222701", "2222222702"],
  content: `  <section id="guide">
    <h2>How much gravel for a French drain?</h2>
    <p>A French drain is a trench filled with washed <strong>clear stone</strong> around a perforated pipe. To estimate the gravel, treat the trench as a long rectangle:</p>
    <ol class="steps">
      <li>Measure the trench <strong>length</strong> and <strong>width</strong> (often 12 inches / 30 cm wide).</li>
      <li>Set the <strong>depth of gravel</strong> around the pipe (commonly 8–12 inches once the pipe is bedded).</li>
      <li>The calculator returns the volume in cubic yards and tonnes.</li>
    </ol>
    <div class="formula-box">
      <p class="formula"><strong>Gravel volume</strong> = Length × Width × Depth</p>
    </div>
    <h3>Tips</h3>
    <ul class="use-list">
      <li>Use <strong>washed clear stone (0–3/4&quot; clear / 20 mm clear)</strong> with no fines so water drains freely.</li>
      <li>Wrap the trench and stone in <strong>landscape/filter fabric</strong> to keep soil from clogging the drain.</li>
      <li>Subtract the pipe volume if you want a tighter estimate, or just round up — extra stone is useful.</li>
    </ul>
  </section>`,
  faqs: [
    { q: "How much gravel do I need for a French drain?", a: "Multiply the trench length × width × gravel depth. A 30 ft trench, 1 ft wide with 8 inches of stone needs about 20 ft³ ≈ 0.75 cubic yards (about 1 tonne). Use the calculator for your dimensions." },
    { q: "What gravel is best for a French drain?", a: "Washed clear stone (0–3/4 inch / 20 mm clear) with no fines, so water passes through freely. Avoid crusher run, which has fines that compact and reduce drainage." },
    { q: "How deep should a French drain be?", a: "Typically 18–24 inches deep overall, with 8–12 inches of clear stone around a perforated pipe, sloped about 1% to carry water away." },
    { q: "Should I wrap the gravel in fabric?", a: "Yes — line the trench with filter fabric so surrounding soil does not migrate into and clog the stone over time." }
  ]
});

/* 7. Patio */
pages.push({
  slug: "patio-gravel-calculator.html",
  title: "Patio Gravel Calculator | Base Stone for Patios &amp; Pavers",
  desc: "Patio gravel calculator. Estimate the crushed stone base for a paver or gravel patio in cubic yards and tonnes by area and depth. Free and mobile friendly.",
  keywords: "calculate gravel for patio, patio gravel calculator, paver base calculator, gravel base calculator, patio base stone calculator",
  appName: "Patio Gravel Calculator",
  crumb: "Patio Calculator",
  h1: "Patio Gravel Calculator",
  lede: "Estimate the <strong>gravel base for a patio</strong> — whether a loose gravel patio or a compacted crushed-stone base under pavers. Enter the area and depth to get cubic yards and tonnes.",
  calcBar: "Enter patio area and base depth",
  defaults: { shape: "rect", depth: 4, depthUnit: "in", density: "1.602", priceUnit: "t" },
  adSlots: ["2222222801", "2222222802"],
  content: `  <section id="guide">
    <h2>How much gravel for a patio base?</h2>
    <p>A paver or slab patio needs a compacted <strong>crushed-stone base</strong>, usually topped with a thin sand setting layer. A typical base depth is <strong>4 inches (10 cm)</strong> for foot-traffic patios, more for poor soil.</p>
    <ol class="steps">
      <li>Measure the patio <strong>length × width</strong>.</li>
      <li>Set the base depth — <strong>4 inches (10 cm)</strong> is standard; 6 inches for soft or clay soil.</li>
      <li>The calculator returns the crushed stone needed in cubic yards and tonnes.</li>
    </ol>
    <h3>Patio build-up</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Layer</th><th>Material</th><th>Depth</th></tr></thead>
      <tbody>
        <tr><td>Base</td><td>3/4&quot; crushed stone / crusher run</td><td>10 cm (4 in)</td></tr>
        <tr><td>Setting bed</td><td>Coarse sand or stone dust</td><td>2.5 cm (1 in)</td></tr>
        <tr><td>Surface</td><td>Pavers / slabs / loose gravel</td><td>—</td></tr>
      </tbody>
    </table></div>
    <p>Compact the base in layers and order about 10% extra.</p>
  </section>`,
  faqs: [
    { q: "How much gravel do I need for a patio base?", a: "Multiply the patio area by the base depth (usually 4 inches). A 100 ft² patio at 4 inches needs about 1.2 cubic yards (≈1.6 tonnes) of crushed stone. The calculator gives your exact amount." },
    { q: "How deep should a patio gravel base be?", a: "About 4 inches (10 cm) of compacted crushed stone for a standard paver patio, or 6 inches over soft or clay soil." },
    { q: "What gravel is best for a patio base?", a: "Angular 3/4 inch crushed stone or crusher run, because it compacts into a firm, stable base. Top it with a thin sand or stone-dust setting layer before laying pavers." },
    { q: "Do I need sand over the gravel?", a: "For pavers, yes — a 1 inch coarse sand or stone-dust setting bed over the compacted gravel base helps level and seat the pavers." }
  ]
});

/* 9. Coverage calculator */
pages.push({
  slug: "gravel-coverage-calculator.html",
  title: "Gravel Coverage Calculator | How Much Area Gravel Covers",
  desc: "Gravel coverage calculator. Find out how much area gravel covers, or how much gravel you need for a given area, in square feet, square yards and square metres.",
  keywords: "gravel coverage calculator, area calculator for gravel, calculate square yards of gravel, gravel area calculator, how much area does gravel cover, gravel coverage per tonne",
  appName: "Gravel Coverage Calculator",
  crumb: "Coverage Calculator",
  h1: "Gravel Coverage Calculator",
  lede: "Find <strong>how much area your gravel will cover</strong>, or how much gravel a given area needs. Enter the area and depth to see the volume, tonnes and square-foot/square-yard coverage.",
  calcBar: "Enter area and depth to see gravel coverage",
  defaults: { shape: "area", area: 100, areaUnit: "ft2", depth: 2, depthUnit: "in", density: "1.522", priceUnit: "t" },
  adSlots: ["2222223001", "2222223002"],
  content: `  <section id="guide">
    <h2>How much area does gravel cover?</h2>
    <p>Gravel coverage depends on the <strong>depth</strong> of the layer. The deeper the gravel, the less area a given amount covers. As a rule, one tonne of typical gravel (≈1.5 t/m³) provides about <strong>0.67 m³</strong> of material.</p>
    <div class="formula-box">
      <p class="formula"><strong>Coverage area</strong> = Volume ÷ Depth</p>
      <p class="formula"><strong>Square yards</strong> = Square feet ÷ 9</p>
    </div>
    <h3>Coverage per tonne of gravel</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Depth</th><th>Coverage (m²)</th><th>Coverage (ft²)</th><th>Coverage (yd²)</th></tr></thead>
      <tbody>
        <tr><td>2.5 cm (1 in)</td><td>≈ 26 m²</td><td>≈ 280 ft²</td><td>≈ 31 yd²</td></tr>
        <tr><td>5 cm (2 in)</td><td>≈ 13 m²</td><td>≈ 140 ft²</td><td>≈ 16 yd²</td></tr>
        <tr><td>7.5 cm (3 in)</td><td>≈ 8.9 m²</td><td>≈ 96 ft²</td><td>≈ 11 yd²</td></tr>
        <tr><td>10 cm (4 in)</td><td>≈ 6.7 m²</td><td>≈ 72 ft²</td><td>≈ 8 yd²</td></tr>
      </tbody>
    </table></div>
    <h3>Coverage per cubic yard</h3>
    <p>One cubic yard of gravel covers about <strong>162 ft² at 2 inches</strong>, 108 ft² at 3 inches, or 81 ft² at 4 inches deep.</p>
  </section>`,
  faqs: [
    { q: "How much area does a tonne of gravel cover?", a: "About 13 m² (140 ft²) at a 5 cm (2 inch) depth for typical gravel. At 1 inch it covers roughly 26 m² (280 ft²); at 4 inches about 6.7 m² (72 ft²)." },
    { q: "How much area does a yard of gravel cover?", a: "One cubic yard covers about 162 ft² at 2 inches deep, 108 ft² at 3 inches, or 81 ft² at 4 inches deep." },
    { q: "How do I calculate square yards of gravel?", a: "Divide the area in square feet by 9 to get square yards. The calculator accepts square feet, square yards or square metres directly." },
    { q: "How do I work out coverage from a depth?", a: "Divide the gravel volume by the depth. The calculator does this automatically and shows coverage in m², ft² and yd²." }
  ]
});

/* 10. Bulk & bagged */
pages.push({
  slug: "bulk-bagged-gravel-calculator.html",
  title: "Bulk &amp; Bagged Gravel Calculator | How Many Bags of Gravel",
  desc: "Bulk and bagged gravel calculator. Work out how many bags of gravel you need, or how much bulk gravel by the tonne or cubic yard, and compare the cost.",
  keywords: "bagged gravel calculator, bulk gravel calculator, how many bags of gravel, burnco gravel calculator, gravel bag calculator, bulk vs bagged gravel",
  appName: "Bulk and Bagged Gravel Calculator",
  crumb: "Bulk &amp; Bagged Calculator",
  h1: "Bulk &amp; Bagged Gravel Calculator",
  lede: "Work out how much gravel you need and whether to buy it <strong>bagged or in bulk</strong>. Enter your area and depth to get the volume, tonnes, cubic yards and an estimate of the number of bags.",
  calcBar: "Enter area and depth — then compare bags vs bulk",
  defaults: { shape: "area", area: 100, areaUnit: "ft2", depth: 2, depthUnit: "in", density: "1.522", priceUnit: "t" },
  adSlots: ["2222223101", "2222223102"],
  content: `  <section id="guide">
    <h2>How many bags of gravel do I need?</h2>
    <p>Bagged gravel is sold by volume or weight. Common sizes and how many fill a cubic yard:</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Bag size</th><th>Approx. weight</th><th>Bags per cubic yard</th><th>Bags per tonne</th></tr></thead>
      <tbody>
        <tr><td>0.5 ft³</td><td>≈ 50 lb (23 kg)</td><td>≈ 54</td><td>≈ 44</td></tr>
        <tr><td>1.0 ft³</td><td>≈ 100 lb (45 kg)</td><td>≈ 27</td><td>≈ 22</td></tr>
        <tr><td>25 kg bag</td><td>25 kg</td><td>≈ 48</td><td>40</td></tr>
        <tr><td>Bulk bag (tote)</td><td>≈ 1 tonne (0.5–0.7 yd³)</td><td>≈ 1.4</td><td>1</td></tr>
      </tbody>
    </table></div>
    <h3>Bulk vs bagged: which is cheaper?</h3>
    <ul class="use-list">
      <li><strong>Bagged</strong> gravel is convenient for small jobs (under ~1 yd³) and easy to carry, but costs much more per tonne.</li>
      <li><strong>Bulk</strong> (loose or 1-tonne tote bags) is far cheaper per tonne and best for driveways and larger areas, but needs delivery and somewhere to dump it.</li>
      <li>As a rough rule, once you need more than about <strong>1 cubic yard (≈40 bags)</strong>, bulk delivery wins on price.</li>
    </ul>
    <p>Suppliers such as landscape-supply yards and big-box stores (and regional suppliers like BURNCO in Western Canada) sell both — use the calculated tonnage or yardage above to request a quote.</p>
  </section>`,
  faqs: [
    { q: "How many bags of gravel are in a cubic yard?", a: "About 54 half-cubic-foot bags, or 27 one-cubic-foot bags, per cubic yard. For 25 kg bags it is roughly 48 bags per cubic yard." },
    { q: "How many bags of gravel do I need?", a: "Calculate the volume (area × depth), then divide by the bag size. The calculator shows the total volume and weight so you can divide by your chosen bag size." },
    { q: "Is bulk gravel cheaper than bagged?", a: "Yes — bulk gravel is much cheaper per tonne. Bagged gravel only makes sense for small jobs under about one cubic yard where convenience matters more than price." },
    { q: "How much does a bulk bag of gravel weigh?", a: "A bulk 'tote' bag typically holds about 1 tonne, which is roughly 0.5–0.7 cubic yards of gravel." }
  ]
});

/* write standard pages */
pages.forEach(p => {
  fs.writeFileSync(p.slug, page(p));
  console.log("wrote", p.slug);
});

/* 8. Aquarium — custom calculator + script */
const aquariumCalc = `    <div class="calc-card">
      <div class="calc-bar">Enter your tank size to estimate aquarium gravel/substrate</div>
      <form id="aqua-form" class="calc-grid">
        <div class="row">
          <label class="label" for="aq-length">Tank length</label>
          <div class="control">
            <input type="number" id="aq-length" value="24" min="0" step="any" inputmode="decimal">
            <select id="aq-unit" aria-label="Tank unit">
              <option value="in" selected>inches</option>
              <option value="cm">cm</option>
            </select>
          </div>
        </div>
        <div class="row">
          <label class="label" for="aq-width">Tank width (front to back)</label>
          <div class="control"><input type="number" id="aq-width" value="12" min="0" step="any" inputmode="decimal"></div>
        </div>
        <div class="row">
          <label class="label" for="aq-depth">Substrate depth</label>
          <div class="control"><input type="number" id="aq-depth" value="2" min="0" step="any" inputmode="decimal"></div>
        </div>
        <div class="row">
          <label class="label" for="aq-density">Substrate type</label>
          <div class="control">
            <select id="aq-density">
              <option value="1.6" selected>Aquarium gravel (~1.6 g/cm³)</option>
              <option value="1.5">Fine gravel / coarse sand (~1.5 g/cm³)</option>
              <option value="1.4">Aquarium sand (~1.4 g/cm³)</option>
              <option value="0.9">Planted aqua-soil (~0.9 g/cm³)</option>
            </select>
          </div>
        </div>
        <div class="row actions">
          <span class="label" aria-hidden="true"></span>
          <div class="control">
            <button type="submit" class="btn btn-primary">Calculate</button>
            <button type="reset" class="btn btn-ghost" id="aq-clear">Clear</button>
          </div>
        </div>
      </form>
      <div id="aq-results" class="results hidden" aria-live="polite">
        <h3>Estimated aquarium gravel</h3>
        <div class="result-grid">
          <div class="result-tile"><span class="rt-value" id="aq-kg">—</span><span class="rt-label">kilograms</span></div>
          <div class="result-tile"><span class="rt-value" id="aq-lb">—</span><span class="rt-label">pounds (lb)</span></div>
          <div class="result-tile"><span class="rt-value" id="aq-l">—</span><span class="rt-label">litres of substrate</span></div>
        </div>
        <p class="result-note">Rule of thumb: about 1–1.5 lb of gravel per US gallon for a 2 inch bed, or 2 lb/gal for a planted 3 inch bed. Adjust to taste.</p>
      </div>
    </div>`;

const aquariumContent = `  <section id="guide">
    <h2>How much gravel for an aquarium?</h2>
    <p>Aquarium gravel is estimated from the <strong>footprint of the tank</strong> (length × width) and the <strong>substrate depth</strong>, not the water volume. Common depths:</p>
    <ul class="use-list">
      <li><strong>1–2 inches</strong> for a basic gravel bed or non-planted tank.</li>
      <li><strong>2–3 inches</strong> for rooted live plants so roots can anchor.</li>
    </ul>
    <div class="formula-box">
      <p class="formula"><strong>Volume</strong> = Length × Width × Substrate depth</p>
      <p class="formula"><strong>Weight</strong> = Volume × substrate density</p>
    </div>
    <h3>Quick rule of thumb</h3>
    <p>A widely used estimate is about <strong>1 to 1.5 lb of gravel per US gallon</strong> for a roughly 2 inch bed. For a deeper planted substrate, use closer to <strong>2 lb per gallon</strong>. The calculator above uses your actual tank dimensions for a more accurate figure.</p>
    <h3>Common tank sizes</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Tank</th><th>Footprint</th><th>Gravel for 2&quot; bed</th></tr></thead>
      <tbody>
        <tr><td>10 gal</td><td>20 × 10 in</td><td>≈ 10–12 lb</td></tr>
        <tr><td>20 gal</td><td>24 × 12 in</td><td>≈ 15–20 lb</td></tr>
        <tr><td>40 gal</td><td>36 × 18 in</td><td>≈ 35–45 lb</td></tr>
        <tr><td>55 gal</td><td>48 × 13 in</td><td>≈ 35–50 lb</td></tr>
      </tbody>
    </table></div>
  </section>`;

const aquariumFaqs = [
  { q: "How much gravel do I need for a fish tank?", a: "Estimate from the tank's length × width × substrate depth. A common rule is about 1–1.5 lb of gravel per US gallon for a 2 inch bed. Enter your tank size above for an exact figure." },
  { q: "How deep should aquarium gravel be?", a: "1–2 inches for a basic substrate, or 2–3 inches for live rooted plants so the roots can anchor and access nutrients." },
  { q: "How much gravel for a 20 gallon tank?", a: "Roughly 15–20 lb for a standard 20 gallon (24 × 12 in) tank at a 2 inch depth. Use more for a planted tank." },
  { q: "Is aquarium gravel measured by water volume?", a: "No — it is based on the tank's footprint (length × width) and the substrate depth, not the gallons of water. The per-gallon rule is just a quick approximation." }
];

const aquariumPage = `<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aquarium Gravel Calculator | Fish Tank Substrate Calculator</title>
<meta name="description" content="Aquarium gravel calculator for fish tanks. Estimate how much gravel or substrate you need in lb, kg and litres from your tank length, width and depth. Free tool.">
<meta name="keywords" content="aquarium gravel calculator, fish tank gravel calculator, gravel calculator fish tank, gravel calculator for aquarium, how much gravel for a fish tank, aquarium substrate calculator">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${SITE}/aquarium-gravel-calculator.html">
<meta name="theme-color" content="#1f6f43">
<!-- Bing Webmaster Tools: replace with your verification code (or use BingSiteAuth.xml) -->
<meta name="msvalidate.01" content="REPLACE_WITH_BING_VERIFICATION_CODE">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GravelCalculator.ca">
<meta property="og:title" content="Aquarium Gravel Calculator | Fish Tank Substrate">
<meta property="og:description" content="Estimate how much aquarium gravel or substrate you need from your tank dimensions.">
<meta property="og:url" content="${SITE}/aquarium-gravel-calculator.html">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Aquarium Gravel Calculator">
<meta name="twitter:description" content="Estimate aquarium gravel/substrate from tank size.">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"Aquarium Gravel Calculator","url":"${SITE}/aquarium-gravel-calculator.html","applicationCategory":"UtilitiesApplication","operatingSystem":"All","browserRequirements":"Requires JavaScript","description":"Estimate how much aquarium gravel or substrate a fish tank needs from its length, width and substrate depth.","inLanguage":"en-CA","isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"CAD"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"Aquarium Gravel Calculator","item":"${SITE}/aquarium-gravel-calculator.html"}]}
</script>
<script type="application/ld+json">
${faqJsonLd(aquariumFaqs)}
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}" crossorigin="anonymous"></script>
</head>
<body>
${header("aquarium-gravel-calculator.html")}
<nav class="breadcrumbs wrap" aria-label="Breadcrumb">
  <ol><li><a href="/">Home</a></li><li aria-current="page">Aquarium Gravel Calculator</li></ol>
</nav>
<main class="wrap">
  <article>
  <h1>Aquarium Gravel Calculator</h1>
  <p class="lede">Estimate <strong>how much gravel or substrate your fish tank needs</strong>. Enter the tank length, width and substrate depth to get the weight in <strong>pounds and kilograms</strong> and the volume in litres.</p>
  <section id="calculator" aria-labelledby="calc-heading">
    <h2 id="calc-heading" class="visually-hidden">Aquarium Gravel Calculator Tool</h2>
${aquariumCalc}
  </section>
${adSlot("2222222901")}
${aquariumContent}
${adSlot("2222222902")}
${faqHtml(aquariumFaqs)}
${calcGrid("aquarium-gravel-calculator.html")}
  <p class="disclaimer"><strong>Disclaimer:</strong> Aquarium substrate estimates are approximate and depend on grain size and how level the bed is. Round up so you can shape the substrate and slope it toward the back.</p>
  </article>
</main>
${footer()}
<script src="/aquarium.js" defer></script>
</body>
</html>
`;
fs.writeFileSync("aquarium-gravel-calculator.html", aquariumPage);
console.log("wrote aquarium-gravel-calculator.html");

/* 11. French page (Quebec / bilingual Canada) */
const frFaqs = [
  { q: "Combien de gravier ai-je besoin ?", a: "Multipliez la surface à couvrir par la profondeur pour obtenir le volume, puis multipliez par la densité du gravier (environ 1,5 t/m³) pour obtenir le poids. Par exemple, 200 m² sur 3 cm = 6 m³, soit environ 9 tonnes." },
  { q: "Combien pèse un mètre cube de gravier ?", a: "Environ 1,5 tonne pour du gravier ordinaire, variant d'environ 1,44 t/m³ pour la roche de rivière à 2,0 t/m³ pour du gravier humide." },
  { q: "Quelle surface couvre une tonne de gravier ?", a: "Environ 13 m² à une profondeur de 5 cm (2 pouces) pour du gravier ordinaire." },
  { q: "Comment calculer le gravier en vrac ?", a: "Calculez le volume (surface × profondeur), puis convertissez-le en tonnes avec la densité. Le calculateur ci-dessus le fait automatiquement, en unités métriques ou impériales." }
];
const frCalc = calcBlock({ defaults: { shape: "area", area: 200, areaUnit: "m2", depth: 5, depthUnit: "cm", density: "1.522", priceUnit: "t" }, calcBar: "Entrez vos mesures et cliquez sur Calculer" })
  .replace("Area to cover", "Surface à couvrir").replace("Total area", "Surface totale").replace(">Total area<", ">Surface totale<")
  .replace("Rectangle", "Rectangle").replace("Circle", "Cercle")
  .replace(/square metres/g, "mètres carrés").replace(/square feet/g, "pieds carrés").replace(/square yards/g, "verges carrées")
  .replace("Length &amp; width", "Longueur et largeur").replace('placeholder="Length"', 'placeholder="Longueur"').replace('placeholder="Width"', 'placeholder="Largeur"')
  .replace(/>metres</g, ">mètres<").replace(/>centimetres</g, ">centimètres<").replace(/>feet</g, ">pieds<").replace(/>inches</g, ">pouces<").replace(/>yards</g, ">verges<")
  .replace("Diameter", "Diamètre").replace('placeholder="Diameter"', 'placeholder="Diamètre"')
  .replace("Depth of gravel", "Profondeur du gravier")
  .replace("Gravel density", "Densité du gravier").replace("Custom density", "Densité personnalisée").replace("Custom density…", "Densité personnalisée…")
  .replace("Price (optional)", "Prix (optionnel)").replace("per tonne", "par tonne").replace("per kg", "par kg").replace("per cubic yard", "par verge cube")
  .replace(">Calculate<", ">Calculer<").replace(">Clear<", ">Effacer<")
  .replace("Estimated gravel needed", "Gravier estimé requis")
  .replace("cubic yards (yd³)", "verges cubes (vg³)").replace("tonnes (metric)", "tonnes (métriques)").replace("cubic metres (m³)", "mètres cubes (m³)")
  .replace("cubic feet (ft³)", "pieds cubes (pi³)").replace("kilograms", "kilogrammes").replace("pounds (lb)", "livres (lb)")
  .replace("Estimated material cost:", "Coût estimé des matériaux :")
  .replace(/Estimates only.*settling\. Costs exclude labour and delivery\./, "Estimations seulement. Prévoyez 5 à 10 % de plus pour le compactage. Les coûts excluent la main-d'œuvre et la livraison.");

const frPage = `<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Calculateur de Gravier | Estimez le Gravier en Vrac (Canada)</title>
<meta name="description" content="Calculateur de gravier gratuit. Estimez la quantité de gravier en vrac (volume, tonnes, verges cubes) et le coût pour une entrée, un patio ou un aménagement. Unités métriques et impériales.">
<meta name="keywords" content="calculateur de gravier, calculateur de vrac gravel, calcul vrac gravel, calcul gravier, calculateur gravier vrac, combien de gravier">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${SITE}/calculateur-de-gravier.html">
<link rel="alternate" hreflang="en-ca" href="${SITE}/">
<link rel="alternate" hreflang="fr-ca" href="${SITE}/calculateur-de-gravier.html">
<meta name="theme-color" content="#1f6f43">
<meta name="msvalidate.01" content="REPLACE_WITH_BING_VERIFICATION_CODE">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GravelCalculator.ca">
<meta property="og:title" content="Calculateur de Gravier | Estimez le Gravier en Vrac">
<meta property="og:description" content="Estimez la quantité et le coût du gravier en vrac. Unités métriques et impériales.">
<meta property="og:url" content="${SITE}/calculateur-de-gravier.html">
<meta property="og:locale" content="fr_CA">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Calculateur de Gravier">
<meta name="twitter:description" content="Estimez la quantité et le coût du gravier en vrac.">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"Calculateur de Gravier","url":"${SITE}/calculateur-de-gravier.html","applicationCategory":"UtilitiesApplication","operatingSystem":"All","browserRequirements":"Requires JavaScript","description":"Calculateur de gravier pour estimer le volume, le poids en tonnes, les verges cubes et le coût du gravier en vrac.","inLanguage":"fr-CA","isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"CAD"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"Calculateur de Gravier","item":"${SITE}/calculateur-de-gravier.html"}]}
</script>
<script type="application/ld+json">
${faqJsonLd(frFaqs)}
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}" crossorigin="anonymous"></script>
</head>
<body>
${header("calculateur-de-gravier.html")}
<nav class="breadcrumbs wrap" aria-label="Fil d'Ariane">
  <ol><li><a href="/">Accueil</a></li><li aria-current="page">Calculateur de Gravier</li></ol>
</nav>
<main class="wrap">
  <article>
  <h1>Calculateur de Gravier</h1>
  <p class="lede">Estimez <strong>la quantité de gravier en vrac</strong> nécessaire pour une entrée, un patio, un sentier ou un aménagement paysager. Obtenez le <strong>volume, le poids en tonnes, les verges cubes</strong> et une estimation du <strong>coût en dollars canadiens</strong>. <a href="/">English version</a>.</p>
  <section id="calculator" aria-labelledby="calc-heading">
    <h2 id="calc-heading" class="visually-hidden">Outil calculateur de gravier</h2>
${frCalc}
  </section>
${adSlot("2222223201")}
  <section id="guide">
    <h2>Comment calculer la quantité de gravier ?</h2>
    <p>La quantité de gravier dépend de la <strong>surface</strong> à couvrir et de la <strong>profondeur</strong> de la couche.</p>
    <ol class="steps">
      <li>Mesurez la surface (longueur × largeur, ou le diamètre pour un cercle).</li>
      <li>Choisissez une profondeur — 5 à 10 cm (2 à 4 pouces) est courant.</li>
      <li>Multipliez surface × profondeur pour obtenir le volume.</li>
      <li>Multipliez le volume par la densité pour obtenir le poids en tonnes.</li>
    </ol>
    <div class="formula-box">
      <p class="formula"><strong>Volume</strong> = Surface × Profondeur</p>
      <p class="formula"><strong>Poids (tonnes)</strong> = Volume (m³) × Densité (t/m³)</p>
    </div>
    <h3>Exemple</h3>
    <p>200 m² sur 3 cm de profondeur = 6 m³, soit environ <strong>9 tonnes</strong> de gravier ordinaire. Prévoyez 5 à 10 % de plus pour le compactage.</p>
  </section>
${adSlot("2222223202")}
${faqHtml(frFaqs)}
${calcGrid("calculateur-de-gravier.html")}
  <p class="disclaimer"><strong>Avertissement :</strong> Les résultats sont des estimations basées sur les valeurs saisies et des densités typiques. Les quantités réelles varient selon le type de gravier, la granulométrie, l'humidité et le compactage. Les coûts excluent la main-d'œuvre, la livraison et les taxes.</p>
  </article>
</main>
${footer()}
<script src="/script.js" defer></script>
</body>
</html>
`;
fs.writeFileSync("calculateur-de-gravier.html", frPage);
console.log("wrote calculateur-de-gravier.html");

/* 12. Calculators hub page */
const HUB = [
  { slug: "", name: "Gravel Calculator", desc: "The main calculator — estimate gravel volume, weight (tonnes), cubic yards and cost for any area by total area, rectangle or circle." },
  { slug: "cubic-yards-of-gravel.html", name: "Cubic Yards of Gravel Calculator", desc: "Find how many cubic yards (yards) of gravel you need. Enter area in feet and depth in inches to get yardage instantly." },
  { slug: "gravel-tonnage-calculator.html", name: "Gravel Tonnage Calculator", desc: "Convert your gravel volume into tonnes, kilograms and pounds using the density of your chosen gravel type." },
  { slug: "gravel-coverage-calculator.html", name: "Gravel Coverage Calculator", desc: "See how much area a tonne or cubic yard of gravel covers — in square feet, square yards and square metres." },
  { slug: "bulk-bagged-gravel-calculator.html", name: "Bulk &amp; Bagged Gravel Calculator", desc: "Work out how many bags of gravel you need, or how much bulk gravel by the tonne, and compare which is cheaper." },
  { slug: "pea-gravel-calculator.html", name: "Pea Gravel Calculator", desc: "Estimate pea gravel for patios, paths and play areas — density preset to pea gravel, with bag counts and coverage." },
  { slug: "gravel-driveway-calculator.html", name: "Driveway Gravel Calculator", desc: "Calculate how much gravel a driveway needs, including base and top layers, in cubic yards and tonnes." },
  { slug: "crushed-gravel-calculator.html", name: "Crushed Gravel Calculator", desc: "For 3/4&quot;, 20 mm, crusher run and 0–3/4&quot; clear stone — common Canadian crushed sizes for bases and drainage." },
  { slug: "french-drain-gravel-calculator.html", name: "French Drain Gravel Calculator", desc: "Estimate the washed clear stone for a French drain trench by length, width and gravel depth." },
  { slug: "patio-gravel-calculator.html", name: "Patio Gravel Calculator", desc: "Calculate the crushed-stone base for a paver or gravel patio by area and base depth." },
  { slug: "aquarium-gravel-calculator.html", name: "Aquarium Gravel Calculator", desc: "Estimate fish-tank gravel/substrate in pounds, kilograms and litres from your tank's length, width and depth." },
  { slug: "calculateur-de-gravier.html", name: "Calculateur de Gravier (Français)", desc: "Version française : estimez le gravier en vrac (volume, tonnes, verges cubes) et le coût." }
];
const hubFaqs = [
  { q: "Which gravel calculator should I use?", a: "Use the main gravel calculator for any project. For specific jobs, pick the matching tool — driveway, patio, pea gravel, crushed stone, French drain, aquarium — which comes preset with sensible defaults. Use the cubic yards or tonnage calculators if you order by yardage or weight." },
  { q: "Are all the calculators free?", a: "Yes. Every calculator on GravelCalculator.ca is free, works in metric and imperial units, and runs entirely in your browser — nothing is stored." },
  { q: "Do the calculators include cost?", a: "Yes. Each tool has an optional price field so you can estimate the material cost in Canadian dollars per tonne, kilogram, cubic metre or cubic yard." }
];
const hubTiles = HUB.map(h =>
  `      <a class="hub-card" href="/${h.slug}"><span class="hub-name">${h.name}</span><span class="hub-desc">${h.desc}</span></a>`
).join("\n");

const hubPage = `<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>All Gravel Calculators | Free Gravel, Tonnage &amp; Cost Tools</title>
<meta name="description" content="Browse all free gravel calculators: gravel, cubic yards, tonnage, coverage, pea gravel, driveway, crushed stone, French drain, patio and aquarium calculators for Canada.">
<meta name="keywords" content="gravel calculator, gravel calculators, gravel calculator canada, cubic yards of gravel calculator, gravel tonnage calculator, pea gravel calculator, driveway gravel calculator">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${SITE}/calculators.html">
<meta name="theme-color" content="#1f6f43">
<meta name="msvalidate.01" content="REPLACE_WITH_BING_VERIFICATION_CODE">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GravelCalculator.ca">
<meta property="og:title" content="All Gravel Calculators | Free Tools">
<meta property="og:description" content="Browse all free gravel calculators for Canada — gravel, yards, tonnage, coverage, pea gravel, driveway, crushed stone and more.">
<meta property="og:url" content="${SITE}/calculators.html">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="All Gravel Calculators">
<meta name="twitter:description" content="Every free gravel calculator in one place.">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"All Gravel Calculators","url":"${SITE}/calculators.html","inLanguage":"en-CA","description":"A directory of free gravel calculators for volume, tonnage, coverage and cost.","hasPart":[${HUB.map(h => `{"@type":"WebApplication","name":"${h.name.replace(/&amp;/g,'and').replace(/&quot;/g,'in')}","url":"${SITE}/${h.slug}","applicationCategory":"UtilitiesApplication","isAccessibleForFree":true}`).join(",")}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"All Calculators","item":"${SITE}/calculators.html"}]}
</script>
<script type="application/ld+json">
${faqJsonLd(hubFaqs)}
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}" crossorigin="anonymous"></script>
</head>
<body>
${header("calculators.html")}
<nav class="breadcrumbs wrap" aria-label="Breadcrumb">
  <ol><li><a href="/">Home</a></li><li aria-current="page">All Calculators</li></ol>
</nav>
<main class="wrap">
  <article>
  <h1>All Gravel Calculators</h1>
  <p class="lede">Every free <strong>gravel calculator</strong> on GravelCalculator.ca in one place. Pick the tool that matches your project — each estimates volume, weight (tonnes), cubic yards and cost in metric or imperial units.</p>
  <section id="all" aria-labelledby="all-h">
    <h2 id="all-h" class="visually-hidden">List of gravel calculators</h2>
    <div class="hub-grid">
${hubTiles}
    </div>
  </section>
${adSlot("2222223301")}
  <section id="about">
    <h2>How to choose a gravel calculator</h2>
    <p>Start with the <a href="/">main gravel calculator</a> for any project. If you order by the cubic yard, use the <a href="/cubic-yards-of-gravel.html">cubic yards calculator</a>; if you order by weight, use the <a href="/gravel-tonnage-calculator.html">tonnage calculator</a>. For specific jobs, the <a href="/gravel-driveway-calculator.html">driveway</a>, <a href="/patio-gravel-calculator.html">patio</a>, <a href="/pea-gravel-calculator.html">pea gravel</a>, <a href="/crushed-gravel-calculator.html">crushed gravel</a> and <a href="/french-drain-gravel-calculator.html">French drain</a> calculators come preset with the right depth and density. There's also an <a href="/aquarium-gravel-calculator.html">aquarium gravel calculator</a> for fish tanks and a <a href="/calculateur-de-gravier.html">French-language version</a>.</p>
  </section>
${faqHtml(hubFaqs)}
  <p class="disclaimer"><strong>Disclaimer:</strong> All results are estimates. Actual gravel quantities vary with type, particle size, moisture and compaction. Costs cover material only and exclude labour, delivery and taxes.</p>
  </article>
</main>
${footer()}
</body>
</html>
`;
fs.writeFileSync("calculators.html", hubPage);
console.log("wrote calculators.html");

console.log("Done. " + (pages.length + 3) + " pages generated.");
