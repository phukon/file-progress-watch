import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
      const nestedTemplatePagePaths = await findTemplatePagesPaths(filePath);
      nestedTemplatePagePaths.forEach((absolutePath) =>
        templatePagePaths.add(absolutePath)
      );
    } else if (file.match(/^\[(.*?)\]\.md$/)) {
      // Push absolute path to the set
      templatePagePaths.add(filePath);
    }
  }

  return templatePagePaths;
};

/**
 * Check if the given directory contains the parent directories of the template page paths.
 * Logs the matched parent directories.
 * @param {string} targetDirectory
 * @param {Set<string>} templatePagePaths
 * @returns {boolean} True if all parent directories are found, false otherwise
 */
export const checkParentDirectories = async (
  targetDirectory,
  templatePagePaths
) => {
  const dirToWatch = new Set();
  for (const templatePath of templatePagePaths) {
    console.log(targetDirectory + templatePath);
    const fileStat = await fs.promises.stat(targetDirectory + templatePath);
    // if (fileStat.isDirectory()) {
    //   console.log('exists :', targetDirectory + templatePath);
    // }
    if (fs.existsSync(targetDirectory + templatePath)) {
      dirToWatch.add(targetDirectory + templatePath);
    }
  }
  console.log(dirToWatch);
};

async function processTemplatePages() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const tempDir = '../play';
  const targetDirectory = path.resolve(__dirname, '../fgh/play');
  // const targetDirectory = '../fgh/play'
  try {
    const templatePagePaths = await findTemplatePagesPaths(tempDir);
    const pathArrays = Array.from(templatePagePaths).map((path) => {
      const normalizedPath = path.replace(/\\/g, '/');
      const pathArray = normalizedPath.split('/');
      pathArray.pop();
      return pathArray.slice(2);
    });

    console.log(pathArrays);

    // console.log('Template page paths found:', pathArrays.map(p => "\\" + path.join(...p)));
    await checkParentDirectories(
      targetDirectory,
      pathArrays.map((p) => '\\' + path.join(...p))
    );
    // // Extract and process the parent directories of template Markdown files
    // const parentDirs = new Set();
    // templatePagePaths.forEach((filePath) => {
    //   const parentDir = path.dirname(filePath);
    //   parentDirs.add(parentDir);
    //   // Process parentDir as needed (e.g., store in another data structure, log, etc.)
    //   // console.log('Parent directory:', parentDir);
    // });

    // console.log('Parent directories of template pages:', parentDirs);

    // const targetDir = '../fgh/play/'; // Change to the directory you want to check
    // await checkAndCountMatchingDirs(targetDir, parentDirs);
  } catch (err) {
    console.error('Error:', err);
  }
}

processTemplatePages();

// Function to check if targetDir has directories defined in parentDirs and count subdirectories
// async function checkAndCountMatchingDirs(targetDir, parentDirs) {
//   const allDirs = [];

//   async function findDirs(dir) {
//     const files = await fs.promises.readdir(dir);

//     for (const file of files) {
//       const filePath = path.join(dir, file);
//       const stat = await fs.promises.stat(filePath);

//       if (stat.isDirectory()) {
//         allDirs.push(filePath); // Add the directory path to the list
//         await findDirs(filePath); // Continue searching recursively
//       }
//     }
//   }

//   await findDirs(targetDir);

//   for (const dirPath of allDirs) {
//     const dirStat = await fs.promises.stat(dirPath);

//     if (dirStat.isDirectory() && parentDirs.has(dirPath)) {
//       const subDirsCount = await countSubdirectories(dirPath);
//       console.log(
//         `Match found: ${dirPath}, Subdirectories count: ${subDirsCount}`
//       );
//     }
//   }
// }

// async function countSubdirectories(dir) {
//   const subdirs = await fs.promises.readdir(dir);
//   let count = 0;

//   for (const subdir of subdirs) {
//     const subdirPath = path.join(dir, subdir);
//     const stat = await fs.promises.stat(subdirPath);

//     if (stat.isDirectory()) {
//       count++;
//     }
//   }

//   return count;
// }

// Function to count subdirectories in a given directory
// async function countSubdirectories(directoryPath) {
//   const subdirs = await fs.promises.readdir(directoryPath);
//   let count = 0;

//   for (const subdir of subdirs) {
//     const subdirPath = path.join(directoryPath, subdir);
//     const subdirStat = await fs.promises.stat(subdirPath);

//     if (subdirStat.isDirectory()) {
//       count++;
//     }
//   }

//   return count;
// }

// ----------

// function findAllDirs(targetDir) {
//   let allDirs = [];

//   // Function to recursively search for directories
//   function findDirs(dir) {
//     const files = fs.readdirSync(dir); // Get all files and directories in the current directory

//     files.forEach((file) => {
//       // const filePath = path.join(dir, file);
//       const stat = fs.statSync(file);

//       if (stat.isDirectory()) {
//         allDirs.push(file); // Add the directory path to the list
//         findDirs(file); // Continue searching recursively
//       }
//     });
//   }

//   findDirs(targetDir); // Start searching from the target directory
//   return allDirs;
// }
