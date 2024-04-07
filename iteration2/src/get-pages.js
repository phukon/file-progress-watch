import fs from 'fs/promises';
import path from 'path';

export const getPagesDir = async (pagesDir) => {
  const content = await fs.readdir(pagesDir);
  console.log(path.resolve(pagesDir))

  const markdownPages = []
  for (const fileName of content) {
    const filePath = path.join(pagesDir, fileName)
    const fileStat = await fs.stat(filePath)

    if (fileStat.isFile() && path.extname(filePath) === ".md") {
      markdownPages.push(filePath)
    }
  }

  return markdownPages.length
}

getPagesDir('../../../evidence/pages').then(markdownFileCount => {
    console.log('Number of Markdown Files:', markdownFileCount);
  })
  .catch(err => {
    console.error('Error:', err);
  });


  // const markdownPages = content.map(async (n) => {

  //   const page = path.join(pagesDir, n);
  //   const isMarkDown = await fs.stat(page);

  //   if (isMarkDown.isFile()) return 'd';
  //   return 'lol';
  // });