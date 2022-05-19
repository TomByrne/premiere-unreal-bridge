
declare interface SequenceMetaBrief {
    id: number;
    name: string,
    render_track: number | undefined;
    speaker_items: SpeakerItem[];
}

// What gets decorated dynamically
declare interface SequenceMeta extends SequenceMetaBrief {
    saved: boolean;
    // videoTracks: TrackInfo[];
    selectedItem: TrackItemInfo | undefined;

    items: Record<string, TrackItemInfo>;
}

declare interface TrackItemInfo {
    id: string;
    name: string;
    start: number;
    end: number;
}

declare interface SpeakerItem {
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
declare interface SpeakerConfig {
    state: ReadinessState,
    project?: string | undefined,
    scene?: string | undefined,
    sequence?: string | undefined,
    img_slot?: string | undefined,
    ue_time_offset: number,
}


declare interface SpeakerRender {
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


declare interface SpeakerImport {
    invalid: boolean;
    state: SpeakerImportState;
    render_track_item?: string;
    render_proj_item?: string;
    asset_path: string;
}

declare interface SlotRender {
    state: SlotRenderState;
    invalid: boolean;
    id: string;          // id of the track item
    output: string;      // folder that AME is declareing to
    dest: string;        // destination folder that declares should be transferred to
    start: number;       // frame offset of start of render
    duration: number;    // duration of render in frames 
    renderDone: number;  // frames captured and copied into UE project 
    fillerDone: number;  // empty frames created before 'start' 
    width: number;       // width of image sequence 
    height: number;      // height of image sequence 
}

enum SpeakerRenderState {
    Pending = "Pending",
    Rendering = "Rendering",
    Done = "Done",
    Failed = "Failed",
    Cancelled = "Cancelled",
}


enum SlotRenderState {
    Idle = "Idle",
    Rendering = "Rendering",
    Filling = "Filling",
    Complete = "Complete",
    Failed = "Failed",
}


enum SpeakerImportState {
    NotReady = "NotReady",
    Ready = "Ready",
    Done = "Done",
}


enum ReadinessState {
    NotReady = "NotReady",
    Ready = "Ready",
}