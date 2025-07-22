const fs = require('fs');
const path = require('path');

// Copy CJS files to main dist folder and fix imports
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

      // Handle explicit .js file imports first
      content = content.replace(/require\(['"]\.\/([^'"\/]+)\.js['"]\)/g, "require('./$1.cjs')");

      // Handle index imports like './something/index.js' -> './something/index.cjs'
      content = content.replace(/require\(['"]\.\/([^'"]+)\/index\.js['"]\)/g, "require('./$1/index.cjs')");

      // Handle simple relative imports without .js extension
      content = content.replace(/require\(['"]\.\/([^'"\/]+)['"]\)/g, (match, p1) => {
        try {
          // Check if it's a directory import or file import
          const potentialDir = path.join(path.dirname(srcPath), p1);
          if (fs.existsSync(potentialDir) && fs.statSync(potentialDir).isDirectory()) {
            return `require('./${p1}/index.cjs')`;
          } else {
            return `require('./${p1}.cjs')`;
          }
        } catch (err) {
          // Fallback to file import if filesystem check fails
          console.warn(`Warning: Could not determine import type for ${p1}, defaulting to file import`);
          return `require('./${p1}.cjs')`;
        }
      });

      fs.writeFileSync(destPath, content);
    }
  });
}

copyFiles('dist-cjs', 'dist');

// Clean up temp directory
fs.rmSync('dist-cjs', { recursive: true, force: true });

console.log('CommonJS build completed');