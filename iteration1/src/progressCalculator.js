// ProgressCalculator class to calculate and display the build progress
export class ProgressCalculator {
  constructor(totalFiles) {
    this.totalFiles = totalFiles;
    this.completedFiles = 0;
  }

  // Increment the count of completed files and display the progress
  fileCompleted() {
    this.completedFiles++;
    this.displayProgress();
  }

  // Calculate and display the current progress
  displayProgress() {
    const percentage = (this.completedFiles / this.totalFiles) * 100;
    console.log(`Build Progress: ${percentage.toFixed(2)}%`);
  }
}