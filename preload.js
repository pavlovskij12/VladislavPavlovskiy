// preload.js
const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

contextBridge.exposeInMainWorld('templates', {
  load(file) {
    try {
      // Папка, де лежить index.html, а не де preload.js
      const indexDir = path.dirname(fileURLToPath(window.location.href));
      const full = path.join(indexDir, file);
      console.log('[templates.load] reading:', full);
      return fs.readFileSync(full, 'utf8');
    } catch (e) {
      console.error('[templates.load] ENOENT:', e?.path || file, e.message);
      return `<div style="color:red;white-space:pre-wrap">Failed to load ${file}</div>`;
    }
  }
});
