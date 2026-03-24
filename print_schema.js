const fs = require('fs');
const path = require('path');

const baseDir = './sap-o2c-data';
const output = [];

for (const dir of fs.readdirSync(baseDir)) {
  const fullPath = path.join(baseDir, dir);
  if (fs.statSync(fullPath).isDirectory()) {
    const files = fs.readdirSync(fullPath);
    if (files.length > 0) {
      const firstLine = fs.readFileSync(path.join(fullPath, files[0]), 'utf8').split('\n')[0];
      if (firstLine) {
        output.push(`### ${dir}\n\`\`\`json\n${firstLine}\n\`\`\``);
      }
    }
  }
}

fs.writeFileSync('schema.md', output.join('\n\n'));
console.log('Done!');
