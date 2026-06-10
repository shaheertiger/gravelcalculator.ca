#!/usr/bin/env node
/* Submit all site URLs to IndexNow (Bing, Yandex, etc.) in one batch.
   Usage: node indexnow-submit.js
   Notifies search engines instantly when pages are added or updated. */
const https = require("https");
const fs = require("fs");

const HOST = "www.gravelcalculator.ca";
const KEY = "5388d65ed7ed42d5ac6bb2b63fd1abfb";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Read every URL from sitemap.xml so this stays in sync as pages are added.
const sitemap = fs.readFileSync(__dirname + "/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList
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
console.log(`Submitting ${urlList.length} URLs to IndexNow…`);
