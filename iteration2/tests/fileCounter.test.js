import { countFiles } from '../src/fileCounter.js';
import fs from 'fs';

// Mock fs to avoid actual file system operations during tests
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
  },
  statSync: jest.fn(),
}));

describe('countFiles', () => {
  it('counts the number of files in a directory', async () => {
    fs.promises.readdir.mockResolvedValue(['file1.js', 'file2.js', 'directory']);
    fs.statSync.mockImplementation((path) => ({
      isFile: () => !path.includes('directory'),
    }));

    const count = await countFiles('some/path');
    expect(count).toBe(2);
  });
});