const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts')) {
      const c = fs.readFileSync(p, 'utf8');
      const lines = c.split('\n');
      lines.forEach((l, i) => {
        if (l.includes('fireEvent') && !l.trim().startsWith('//') && !l.includes('export function')) {
          console.log(p, i+1, l.trim());
        }
      });
    }
  });
}

walk('src');