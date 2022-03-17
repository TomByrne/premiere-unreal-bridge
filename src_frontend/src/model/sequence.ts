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
  /*findSlotRender(id: string): SlotRender | undefined {
    const meta = this.sequenceMeta;
    if (!meta) return undefined;
    for (const item of meta.slot_renders) {
      if (item.id == id) return item;
    }
  }*/
}

export default reactive(new SequenceModel());
// What gets stored
export interface SequenceMetaBrief {
  id: number;
  name: string,
  render_track: string | undefined;
  speaker_items: SpeakerItem[];
  // slot_renders: SlotRender[];
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
    id: string,

    config: SpeakerConfig;
    slots: Record<string, SlotRender>;
    render: SpeakerRender;
    import: SpeakerImport;
}
export interface SpeakerConfig {
    state: ReadinessState,
    project?: string | undefined,
    scene?: string | undefined,
    sequence?: string | undefined,
    img_slot?: string | undefined,
}


export interface SpeakerRender {
    state: SpeakerRenderState;
    render_path: string;
    job_path: string | undefined;
    saved: boolean; // Does 'job' have changes that haven't been written to the queue
    job: PipelineJob | undefined;
}

export interface PipelineJob {
  cmd: string,
  project: string,
  scene: string,
  sequence: string,
  render_settings: string,
  output?: string,
  output_format?: string,
  attempts?: number,
  width?: number,
  height?: number,
  scale?: number,
  start_frame?: number,
  end_frame?: number,
}

export enum SpeakerRenderState {
  none = "none",
  pending = "pending",
  doing = "doing",
  done = "done",
  failed = "failed",
  cancelled = "cancelled",
}


export interface SpeakerImport {
  state: ReadinessState;
  render_track_item?: string;
  render_proj_item?: string;
}

export interface SlotRender {
    state: SlotRenderState;
    id: string;          // id of the track item
    output: string;      // folder that AME is exporting to
    dest: string;        // destination folder that exports should be transferred to
    start: number;       // frame offset of start of render
    duration: number;    // duration of render in frames 
    done: number;        // frames captured and copied into UE project 
}


export enum SlotRenderState {
    NotReady = "NotReady",
    Ready = "Ready",
    Rendering = "Rendering",
    Complete = "Complete",
    Failed = "Failed",
}


export enum ReadinessState {
    NotReady = "NotReady",
    Ready = "Ready",
}