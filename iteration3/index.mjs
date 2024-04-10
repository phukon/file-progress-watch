import fs from 'fs';
import path from 'path';

/**
 * Recursively finds template pages in a given directory and saves their paths to a set.
 * @param {string} directoryPath
 * @returns {Promise<Set<string>>} Set containing paths to template pages
 */
export const findTemplatePagesPaths = async (directoryPath) => {
	const templatePagePaths = new Set();
	const files = await fs.promises.readdir(directoryPath);

	for (const file of files) {
		const filePath = path.join(directoryPath, file);
		const fileStat = await fs.promises.stat(filePath);

		if (fileStat.isDirectory()) {
			// If it's a directory, recursively search inside it
			const nestedTemplatePagePaths = await findTemplatePagesPaths(filePath);
			nestedTemplatePagePaths.forEach((path) => templatePagePaths.add(path));
		} else if (file.match(/^\[(.*?)\]\.md$/)) {
			templatePagePaths.add(filePath);
		}
	}

	return templatePagePaths;
};


// Function to check if targetDir has directories defined in parentDirs and count subdirectories
async function checkAndCountMatchingDirs(targetDir, parentDirs) {
  const targetDirs = await fs.promises.readdir(targetDir);

  for (const dir of targetDirs) {
    const dirPath = path.join(targetDir, dir);
    const dirStat = await fs.promises.stat(dirPath);

    if (dirStat.isDirectory() && parentDirs.has(dirPath)) {
      const subDirsCount = await countSubdirectories(dirPath);
      console.log(`Match found: ${dirPath}, Subdirectories count: ${subDirsCount}`);
    }
  }
}

// Function to count subdirectories in a given directory
async function countSubdirectories(directoryPath) {
  const subdirs = await fs.promises.readdir(directoryPath);
  let count = 0;

  for (const subdir of subdirs) {
    const subdirPath = path.join(directoryPath, subdir);
    const subdirStat = await fs.promises.stat(subdirPath);

    if (subdirStat.isDirectory()) {
      count++;
    }
  }

  return count;
}


async function processTemplatePages() {
  const directoryPath = '../play';
  try {
    const templatePagePaths = await findTemplatePagesPaths(directoryPath);
    console.log('Template page paths found:', templatePagePaths);

    // Extract and process the parent directories of template Markdown files
    const parentDirs = new Set();
    templatePagePaths.forEach((filePath) => {
      const parentDir = path.dirname(filePath);
      parentDirs.add(parentDir);
      // Process parentDir as needed (e.g., store in another data structure, log, etc.)
      // console.log('Parent directory:', parentDir);
    });

    console.log('Parent directories of template pages:', parentDirs);
    
    const targetDir = '../lol'; // Change to the directory you want to check
    await checkAndCountMatchingDirs(targetDir, parentDirs);

  } catch (err) {
    console.error('Error:', err);
  }
}

processTemplatePages();
