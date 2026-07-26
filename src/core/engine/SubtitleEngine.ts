import type { SubtitleEntry } from '../types/subtitles.ts';

export class SubtitleEngine {
  private entries: SubtitleEntry[] = [];

  setEntries(entries: SubtitleEntry[]) {
    this.entries = entries;
  }

  /**
   * Finds the subtitle entry that matches the current time.
   * Optimization: In a real product, we'd use a Binary Search here 
   * for performance, but for the MVP, a simple .find is okay.
   */
  getActiveEntry(currentTime: number): SubtitleEntry | null {
    return this.entries.find(
      (entry) => currentTime >= entry.start && currentTime <= entry.end
    ) || null;
  }
}