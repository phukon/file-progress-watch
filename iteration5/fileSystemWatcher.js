import chokidar from 'chokidar';
import { buildDirectoryStructure } from './directoryStructureBuilder.js';

export function watchTargetDirectory(targetDirectory, buildDirectory) {
  const watcher = chokidar.watch(`${targetDirectory}/**/*.[abcxyz].md`, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });

  watcher
    .on('add', path => buildDirectoryStructure(path, buildDirectory))
    .on('unlink', path => buildDirectoryStructure(path, buildDirectory, true));
}