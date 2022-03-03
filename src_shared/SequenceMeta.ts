// What gets stored
declare interface SequenceMetaBrief {
    id: number,
    name: string,
    render_track: string | undefined;
    speaker_items: SpeakerItem[]
}

// What gets decorated dynamically
declare interface SequenceMeta extends SequenceMetaBrief {
    saved: boolean,
    // videoTracks: TrackInfo[],
    selectedItem: TrackItemInfo | undefined,

    items: Record<string, TrackItemInfo>,
}

// export interface TrackInfo {
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

    project?: string | undefined,
    scene?: string | undefined,
    sequence?: string | undefined,

    render_path: string,

    // render_clip: string,
    // render_imgseq_low: string,
    // render_imgseq_high: string
}