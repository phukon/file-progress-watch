import chokidar from 'chokidar';

const watcher = chokidar.watch('../play', { ignoreInitial: true });

watcher.on('addDir', () => {
  console.log('registered!');
});
