import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';

export function startCounting(buildDirectory) {
  const watcher = chokidar.watch(buildDirectory, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });

  watcher.on('all', async () => {
    const count = await countDirectories(buildDirectory);
    console.log(`Current template directory count: ${count}`);
  });
}

async function countDirectories(startPath) {
  let count = 0;

  async function readDir(dir) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        count++;
        await readDir(fullPath);
      }
    }
  }

  await readDir(startPath);
  return count;
}