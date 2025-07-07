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

      // Fix require paths to point to .cjs files
      content = content.replace(/require\(['"]\.\/([^'"\/]+)['"]\)/g, "require('./$1/index.cjs')");
      content = content.replace(/require\(['"]\.\/([^'"]+)\/index\.js['"]\)/g, "require('./$1/index.cjs')");
      
      fs.writeFileSync(destPath, content);
    }
  });
}

copyFiles('dist-cjs', 'dist');

// Clean up temp directory
fs.rmSync('dist-cjs', { recursive: true, force: true });

console.log('CommonJS build completed');