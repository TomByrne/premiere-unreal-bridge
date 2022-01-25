// What gets stored
declare interface SequenceMetaBrief {
    id: number,
    render_track: string | undefined;
    speaker_items: SpeakerItem[]
}

// What gets decorated dynamically
declare interface SequenceMeta extends SequenceMetaBrief {
    saved: boolean,
    videoTracks: TrackInfo[],
    selectedItem: string | undefined,
}

declare interface TrackInfo {
    id: number,
    name: string,

    items:TrackItemInfo[]
}

declare interface TrackItemInfo {
    id: string,
    name: string,
    start: number,
    end: number,
}

declare interface SpeakerItem {
    itemId: string,

    project?: string | undefined,
    scene?: string | undefined,
    sequence?: string | undefined,

    // render_clip: string,
    // render_imgseq_low: string,
    // render_imgseq_high: string
}