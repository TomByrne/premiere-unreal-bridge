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
  name: string,
  render_track: number | undefined;
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
  id: string,

  // These are used to repair speaker items when sequence is copied
  nodeId: string,
  start: number,
  end: number,

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
  invalid: boolean;
  state: SpeakerRenderState | undefined;
  render_path: string | undefined;
  job_path: string | undefined;
  saved: boolean; // Does 'job' have changes that haven't been written to the queue
  job: PipelineJob | undefined;

  processor?: string | undefined; // Pipeline node processing the job
  frames?: number | undefined; // Frames generated
  total?: number | undefined; // Total frames
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


export interface SpeakerImport {
  invalid: boolean;
  state: SpeakerImportState;
  render_track_item?: string;
  render_proj_item?: string;
  asset_path: string;
}

export interface SlotRender {
  state: SlotRenderState;
  invalid: boolean;
  id: string;          // id of the track item
  output: string;      // folder that AME is exporting to
  dest: string;        // destination folder that exports should be transferred to
  start: number;       // frame offset of start of render
  duration: number;    // duration of render in frames 
  renderDone: number;  // frames captured and copied into UE project 
  fillerDone: number;  // empty frames created before 'start' 
  width: number;       // width of image sequence 
  height: number;      // height of image sequence 
}

export enum SpeakerRenderState {
  Pending = "Pending",
  Rendering = "Rendering",
  Done = "Done",
  Failed = "Failed",
  Cancelled = "Cancelled",
}


export enum SlotRenderState {
  Idle = "Idle",
  Rendering = "Rendering",
  Filling = "Filling",
  Complete = "Complete",
  Failed = "Failed",
}


export enum SpeakerImportState {
  NotReady = "NotReady",
  Ready = "Ready",
  Done = "Done",
}


export enum ReadinessState {
  NotReady = "NotReady",
  Ready = "Ready",
}