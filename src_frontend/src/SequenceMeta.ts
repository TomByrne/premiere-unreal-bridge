// What gets stored
export interface SequenceMetaBrief {
  id: number;
  render_track: string | undefined;
  speaker_items: SpeakerItem[];
}

// What gets decorated dynamically
export interface SequenceMeta extends SequenceMetaBrief {
  saved: boolean;
  videoTracks: TrackInfo[];
  selectedItem: string | undefined;
}

export interface TrackInfo {
  id: number;
  name: string;

  items: TrackItemInfo[];
}

export interface TrackItemInfo {
  id: string;
  name: string;
  start: number;
  end: number;
}

export interface SpeakerItem {
  itemId: string;

  project?: string | undefined;
  scene?: string | undefined;
  sequence?: string | undefined;

  // render_clip: string,
  // render_imgseq_low: string,
  // render_imgseq_high: string
}
