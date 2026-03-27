import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }

      const info = await stat(fullPath);
      return [{ path: path.relative(distDir, fullPath), size: info.size }];
    })
  );

  return files.flat();
}

function formatSize(size) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} kB`;
  }

  return `${size} B`;
}

const files = await collectFiles(distDir);
const sortedFiles = files.sort((a, b) => b.size - a.size);
const totalSize = sortedFiles.reduce((sum, file) => sum + file.size, 0);

console.log(`Bundle artifacts in ${distDir}`);
console.log(`Total emitted size: ${formatSize(totalSize)}`);
console.log('');
console.log('Largest files:');

for (const file of sortedFiles.slice(0, 12)) {
  console.log(`${formatSize(file.size).padStart(10)}  ${file.path}`);
}
