import { findTemplatePagesPaths } from './findTemplatePagesPaths.js';
// import { watchDirectory } from './watcher.js';
import { watchAndDisplayDirectoryTable } from './table.js';

/**
 * Crawls the pages dir and checks for the total no. of md files.
 * Then crawls the built pages in .evidence and checks for the dirs
 * Compares and shows percentage complete logs.
 * ->
 */

/** @type {import("vite").Plugin} */
export const verboseLogs = {
	name: 'evidence:verbose-logs',

	buildStart() {
		const directoryPath = '../fgh/play';
		findTemplatePagesPaths('../play')
			.then((dirs) => {

				watchAndDisplayDirectoryTable(
					directoryPath,
					dirs,
					(/** @type {string} */ progress) => {
						console.log(`Build Progress: ${progress}%`);
					},
					() => {
						console.log('\n All the pages have been built.');
					}
				);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
};
