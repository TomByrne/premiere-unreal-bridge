


// What gets stored
declare interface SequenceMetaBrief {
    id: number,
    name: string,
    render_track?: number;
    speaker_items: SpeakerItem[];
}

// What gets decorated dynamically
declare interface SequenceMeta extends SequenceMetaBrief {
    saved: boolean,
    // videoTracks: TrackInfo[],
    selectedItem: TrackItemInfo | undefined,

    items: Record<string, TrackItemInfo>,
}

// declare interface TrackInfo {
//     id: number,
//     name: string,

//     items: TrackItemInfo[]
// }

declare interface TrackItemInfo {
    id: string,
    name: string,
    start: number,
    end: number,
}

declare interface SpeakerItem {
    id: string,

    config: SpeakerConfig;
    slots: Record<string, SlotRender>;
    render: SpeakerRender;
    import: SpeakerImport;
}
declare interface SpeakerConfig {
    state: ReadinessState,
    project?: string | undefined,
    scene?: string | undefined,
    sequence?: string | undefined,
    img_slot?: string | undefined,
}


declare interface SpeakerRender {
    state: SpeakerRenderState | undefined;
    render_path: string | undefined;
    job_path: string | undefined;
    saved: boolean; // Does 'job' have changes that haven't been written to the queue
    job: PipelineJob | undefined;

    processor?: string | undefined; // Pipeline node processing the job
    frames?: number | undefined; // Frames generated
    total?: number | undefined; // Total frames
}

declare interface PipelineJob {
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

enum SpeakerRenderState {
    // none = "none",
    Pending = "Pending",
    Rendering = "Rendering",
    Done = "Done",
    Failed = "Failed",
    Cancelled = "Cancelled",
}


declare interface SpeakerImport {
    state: ReadinessState;
    render_track_item?: string;
    render_proj_item?: string;
    asset_path: string;
}

declare interface SlotRender {
    state: SlotRenderState;
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


enum SlotRenderState {
    // NotReady = "NotReady",
    // Ready = "Ready",
    Rendering = "Rendering",
    Complete = "Complete",
    Failed = "Failed",
}

enum ReadinessState {
    NotReady = "NotReady",
    Ready = "Ready",
}