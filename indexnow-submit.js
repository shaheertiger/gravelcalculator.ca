#!/usr/bin/env node
/* Submit all site URLs to IndexNow (Bing, Yandex, etc.) in one batch.
   Usage: node indexnow-submit.js
   Notifies search engines instantly when pages are added or updated. */
const https = require("https");

const HOST = "www.gravelcalculator.ca";
const KEY = "5388d65ed7ed42d5ac6bb2b63fd1abfb";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const paths = [
  "/", "/calculators.html",
  "/cubic-yards-of-gravel.html", "/gravel-tonnage-calculator.html",
  "/gravel-coverage-calculator.html", "/bulk-bagged-gravel-calculator.html",
  "/pea-gravel-calculator.html", "/gravel-driveway-calculator.html",
  "/crushed-gravel-calculator.html", "/french-drain-gravel-calculator.html",
  "/patio-gravel-calculator.html", "/aquarium-gravel-calculator.html",
  "/calculateur-de-gravier.html", "/privacy.html", "/terms.html"
];

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: paths.map(p => `https://${HOST}${p}`)
});

const req = https.request({
  hostname: "api.indexnow.org",
  path: "/indexnow",
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) }
}, res => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => console.log(`IndexNow responded ${res.statusCode}. ${data || "(200/202 = accepted)"}`));
});
req.on("error", e => console.error("IndexNow error:", e.message));
req.write(body);
req.end();
console.log(`Submitting ${paths.length} URLs to IndexNow…`);
