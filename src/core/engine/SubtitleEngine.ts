import type { SubtitleEntry } from '../types/subtitles';

export class SubtitleEngine {
  private primaryEntries: SubtitleEntry[] = [];
  private secondaryEntries: SubtitleEntry[] = [];

  setPrimaryEntries(entries: SubtitleEntry[]) {
    this.primaryEntries = entries;
  }

  setSecondaryEntries(entries: SubtitleEntry[]) {
    this.secondaryEntries = entries;
  }

  // Auto-generated (ASR) tracks often contain overlapping entries — as a
  // sentence is transcribed incrementally, several entries can validly
  // contain the same currentTime at once. Picking the FIRST match causes
  // playback to keep re-displaying a stale, earlier-started entry, which
  // shows up as subtitles progressively lagging behind the video. Picking
  // the entry with the latest start time among matches always surfaces the
  // most current cue instead.
  private findFreshestActive(entries: SubtitleEntry[], currentTime: number): SubtitleEntry | null {
    let best: SubtitleEntry | null = null;
    for (const entry of entries) {
      if (currentTime >= entry.start && currentTime <= entry.end) {
        if (!best || entry.start > best.start) best = entry;
      }
    }
    return best;
  }

  getActiveEntries(currentTime: number) {
    const primary = this.findFreshestActive(this.primaryEntries, currentTime);
    const secondary = this.findFreshestActive(this.secondaryEntries, currentTime);

    return {
      primaryText: primary ? primary.text : '',
      secondaryText: secondary ? secondary.text : ''
    };
  }
}