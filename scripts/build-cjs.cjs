const fs = require('fs');
const path = require('path');

function copyFiles(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file.replace('.js', '.cjs'));

    if (fs.statSync(srcPath).isDirectory()) {
      copyFiles(srcPath, path.join(dest, file));
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(srcPath, 'utf8');

      content = content.replace(/require\(['"]\.\.?\/([^'"\/]+)\.js['"]\)/g, (match, p1) => {
        const prefix = match.includes('../') ? '../' : './';
        return `require('${prefix}${p1}.cjs')`;
      });

      content = content.replace(/require\(['"]\.\.?\/([^'"]+)\/index\.js['"]\)/g, (match, p1) => {
        const prefix = match.includes('../') ? '../' : './';
        return `require('${prefix}${p1}/index.cjs')`;
      });

      content = content.replace(/require\(['"]\.\.?\/([^'"\/]+)['"]\)/g, (match, p1) => {
        const prefix = match.includes('../') ? '../' : './';
        try {
          const potentialDir = path.join(path.dirname(srcPath), p1);
          if (fs.existsSync(potentialDir) && fs.statSync(potentialDir).isDirectory()) {
            return `require('${prefix}${p1}/index.cjs')`;
          }
          return `require('${prefix}${p1}.cjs')`;
        } catch {
          return `require('${prefix}${p1}.cjs')`;
        }
      });

      fs.writeFileSync(destPath, content);
    }
  });
}

copyFiles('dist-cjs', 'dist');
fs.rmSync('dist-cjs', { recursive: true, force: true });

console.log('CommonJS build completed');