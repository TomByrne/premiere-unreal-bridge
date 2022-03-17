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
  findSlotRender(id: string): SlotRender | undefined {
    const meta = this.sequenceMeta;
    if (!meta) return undefined;
    for (const item of meta.slot_renders) {
      if (item.id == id) return item;
    }
  }
}

export default reactive(new SequenceModel());
// What gets stored
export interface SequenceMetaBrief {
  id: number;
  name: string,
  render_track: string | undefined;
  speaker_items: SpeakerItem[];
  slot_renders: SlotRender[];
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
  img_slot?: string | undefined;

  render_path: string,
  render_track_item?: string;
  render_proj_item?: string;
  
  // speaker_seq_item?: string;
  // speaker_seq_id?: string;

  // render_clip: string,
  // render_imgseq_low: string,
  // render_imgseq_high: string
}


export interface SlotRender {
  id: string;          // id of the speaker item
  output: string;      // folder that AME is exporting to
  dest: string;        // destination folder that exports should be transferred to
  start: number;       // frame offset of start of render
  duration: number;    // duration of render in frames 
  done: number;        // frames captured and copied into UE project 
}