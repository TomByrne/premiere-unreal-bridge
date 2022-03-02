import { reactive } from "vue";

export class SequenceModel {
  sequenceMeta: SequenceMeta | undefined;

  getSelectedItem(): TrackItemInfo | undefined {
    const meta = this.sequenceMeta;
    return meta?.selectedItem || undefined;
  }

  findTrackItem(id: string): TrackItemInfo | undefined {
    const meta = this.sequenceMeta;
    return meta?.items[id] || undefined;
  }
  findSpeakerItem(id: string): SpeakerItem | undefined {
    const meta = this.sequenceMeta;
    if (!meta) return undefined;
    for (const item of meta.speaker_items) {
      if (item.id == id) return item;
    }
  }
}

export default reactive(new SequenceModel());
// What gets stored
export interface SequenceMetaBrief {
  id: number;
  render_track: string | undefined;
  speaker_items: SpeakerItem[];
}

// What gets decorated dynamically
export interface SequenceMeta extends SequenceMetaBrief {
  saved: boolean;
  // videoTracks: TrackInfo[];
  selectedItem: TrackItemInfo | undefined;

  items: Record<string, TrackItemInfo>;
}

// export interface TrackInfo {
//   id: number;
//   name: string;

//   items: TrackItemInfo[];
// }

export interface TrackItemInfo {
  id: string;
  name: string;
  start: number;
  end: number;
}

export interface SpeakerItem {
  id: string;

  project?: string | undefined;
  scene?: string | undefined;
  sequence?: string | undefined;

  // render_clip: string,
  // render_imgseq_low: string,
  // render_imgseq_high: string
}
