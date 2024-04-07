import chokidar from 'chokidar';

// FileWatcher class to monitor directory changes
export class FileWatcher {
  constructor(path) {
    this.path = path;
    this.watcher = null;
    this.onFileAdded = () => {};
  }

  // Initialize watching on the specified path
  startWatching() {
    this.watcher = chokidar.watch(this.path, { ignored: /^\./, persistent: true });

    this.watcher
      .on('add', path => this.onFileAdded(path))
      .on('error', error => console.log(`Watcher error: ${error}`));
  }

  // Set callback for file addition
  setOnFileAddedCallback(callback) {
    this.onFileAdded = callback;
  }
}