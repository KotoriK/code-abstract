import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { open, writeFile } from 'node:fs/promises';
import readline from 'node:readline';
import glob from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @config
const linePerPage = 44; // 每页
// @config
const pageRequired = 60;
const targetLineCount = linePerPage * pageRequired;
const lines = [];

// @config
const srcRoot = path.resolve(__dirname, '../src');
const matches = await new Promise((resolve, reject) => {
  glob(
    // @config
    '/**/*.@(ts|tsx|css|less|sass)',
    { root: srcRoot },
    async (err, matches) => {
      if (!err) {
        resolve(matches);
      } else {
        reject(err);
      }
    },
  );
});

for (const path of matches) {
  const handle = await open(path);
  const stream = handle.createReadStream();
  const rl = readline.createInterface(stream);
  for await (const line of rl) {
/*     if (Array.from(line.matchAll(/\S/g)).length > 0) {
      // 仅插入非空行
      lines.push(line);
    } */
    lines.push(line);

  }
  await handle.close();
  if (lines.length >= targetLineCount) {
    break;
  }
}
writeFile(path.resolve(__dirname, 'out.txt'), lines.join('\n'));
