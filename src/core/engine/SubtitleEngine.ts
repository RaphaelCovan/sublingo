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

  getActiveEntries(currentTime: number) {
    const primary = this.primaryEntries.find(
      (e) => currentTime >= e.start && currentTime <= e.end
    );
    const secondary = this.secondaryEntries.find(
      (e) => currentTime >= e.start && currentTime <= e.end
    );

    return {
      primaryText: primary ? primary.text : '',
      secondaryText: secondary ? secondary.text : ''
    };
  }
}