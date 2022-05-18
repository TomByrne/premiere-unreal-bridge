

namespace SequenceTools {
    var CachedSeqMeta: SequenceMetaBrief | undefined;

    const creatorNS = "http://ns.adobe.com/xap/1.0/";
    const creatorKey = "CreatorTool";

    function findSeq(seq?: Sequence): Sequence | undefined {
        if (!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if (!seq) {
            return undefined;
        } else {
            return seq;
        }
    }

    function selectTrackItemIn(id: string, seq: Sequence, tracks: TrackCollection): boolean {
        let ret = false;
        for (let i = 0; i < tracks.length; i++) {
            let track = tracks[i];
            if (!track) continue;
            for (let j = 0; j < track.clips.length; j++) {
                let clip = track.clips[j];
                if (!clip) continue;
                let selected = clip.nodeId == id;
                clip.setSelected(selected, true);
                if (selected) ret = true;
            }
        }
        return ret;
    }

    function findTrack(tracks: TrackCollection, id: number): Track | undefined {
        for (const track of tracks) if (track.id == id) return track;
    }
    function findEmptyTrack(tracks: TrackCollection): Track | undefined {
        for (const track of tracks) if (track.clips.length == 0) return track;
    }
    function findTrackItem(tracks: Array<Track>, itemId: string): TrackItem | undefined {
        for (const track of tracks) {
            for (const item of track.clips) {
                if (item.nodeId == itemId) return item;
            }
        }
    }
    export function findVideoTrackItem(itemId: string, seq?: Sequence): TrackItem | undefined {
        seq = findSeq(seq);
        if (!seq) return;
        return findTrackItem(seq.videoTracks, itemId);
    }

    export function findProjItemByTrackItem(itemId: string): ProjectItem | undefined {
        const seq = findSeq();
        if (!seq) return undefined;
        const trackItem = findTrackItem(seq.videoTracks, itemId);
        return trackItem?.projectItem;
    }

    function hasById<T>(items: { id: T }[], id: T): boolean {
        for (let item of items) {
            if (item.id == id) return true;
        }
        return false;
    }

    function getTrackItems(tracks: TrackCollection, speaker_items: SpeakerItem[]): { items: Record<string, TrackItemInfo>, selected: TrackItemInfo | undefined } {
        var ret: Record<string, TrackItemInfo> = {};
        let selected = [];
        for (let i = 0; i < tracks.length; i++) {
            let track = tracks[i];
            if (!track) continue;
            for (let j = 0; j < track.clips.length; j++) {
                let clip = track.clips[j];
                if (!clip) continue;

                const trackItem = {
                    id: clip.nodeId,
                    name: clip.name,
                    start: clip.start.seconds,
                    end: clip.end.seconds,
                };

                if (clip.isSelected()) {
                    selected.push(trackItem);
                }

                if (!hasById(speaker_items, clip.nodeId)) continue;

                ret[clip.nodeId] = trackItem;
            }
        }
        return {
            items: ret,
            selected: (selected.length == 1 ? selected[0] : undefined),
        };
    }

    function sortFiles(f1: File | Folder, f2: File | Folder): number {
        const n1 = f1.name;
        const n2 = f2.name;
        return (n1 < n2 ? -1 : (n2 < n1 ? 1 : 0));
    }

    function findNodeIdIndex(collection: Collection<{ nodeId: string }>, id: string): number {
        for (let i = 0; i < collection.length; i++) {
            const item = collection[i];
            if (item.nodeId == id) return i;
        }
        return -1;
    }

    function checkSpeakerRenderItems(seq: Sequence, meta: SequenceMetaBrief, addToSeq = false): boolean {
        const renderTrack = meta.render_track == undefined ? undefined : findTrack(seq.videoTracks, meta.render_track);
        let ret = false;
        const items = meta.speaker_items.concat([]);
        for (const speaker of items) {
            let item: TrackItem | undefined;
            if (speaker.import.render_track_item) {
                if (renderTrack) item = findTrackItem([renderTrack], speaker.import.render_track_item);
                if (!item) item = findTrackItem(seq.videoTracks, speaker.import.render_track_item);
            }

            const origTrackItem = findTrackItem(seq.videoTracks, speaker.id);
            // Orig track item gone, remove speaker item
            if (!origTrackItem) {
                meta.speaker_items.splice(meta.speaker_items.indexOf(speaker), 1);
                ret = true;
                continue;
            }

            // Remove Track rendered track item if invalid
            if (item && (!renderTrack || findNodeIdIndex(renderTrack.clips, item.nodeId) == -1)) {
                console.log("Remove item: " + speaker.import.render_track_item);
                item.remove(false, false);
                speaker.import.render_track_item = undefined;
                ret = true;
                item = undefined;
            }

            if (!item && renderTrack && speaker.import.render_proj_item) {
                const projItem = ProjectItemTools.find(speaker.import.render_proj_item);
                const renderTrackItem = speaker.import.render_track_item ? findTrackItem(seq.videoTracks, speaker.import.render_track_item) : undefined;
                if (!projItem) {
                    // Proj item has been deleted
                    //TODO: clear track item
                    speaker.import.render_proj_item = undefined;
                    speaker.import.render_track_item = undefined;
                    if (renderTrackItem) {
                        renderTrackItem.remove(false, false);
                        speaker.import.render_track_item = undefined;
                        ret = true;
                    }
                    ret = true;
                } else if(renderTrackItem) {
                    // All good

                } else if(addToSeq) {
                    try {
                        item = insertClip(renderTrack, projItem, origTrackItem.start.seconds);
                        if (item) {
                            item.end = origTrackItem.end;
                            speaker.import.render_track_item = item.nodeId || "null";
                            ret = true;
                        }
                    } catch (e) {
                        console.warn("Failed to insert clip", e);
                    }

                } else if(speaker.import.render_track_item) {
                    speaker.import.render_track_item = undefined;
                    ret = true;
                }
            }
        }
        return ret;
    }

    function insertClip(track: Track, projItem: ProjectItem, startSecs: number): TrackItem | undefined {
        const itemIds = [];
        for (const item of track.clips) itemIds.push(item.nodeId);

        if (!track.insertClip(projItem, startSecs)) return;

        for (const item of track.clips) {
            if (itemIds.indexOf(item.nodeId) == -1) return item;
        }
    }

    export function clearMeta(seq?: Sequence): boolean {
        seq = findSeq(seq);
        if (!seq) return false;

        if (CachedSeqMeta && CachedSeqMeta.id == seq.id) {
            CachedSeqMeta = undefined;
        }

        XMP.setValue(seq.projectItem, creatorNS, creatorKey);
        return true;
    }

    export function getMetaBrief(create?: boolean, seq?: Sequence): SequenceMetaBrief | undefined {

        seq = findSeq(seq);
        if (!seq) return undefined;

        let metaBrief: SequenceMetaBrief | undefined;
        // if(CachedSeqMeta) console.log("getMeta: "+ CachedSeqMeta?.speaker_items[0].import.render_proj_item);
        if (CachedSeqMeta) {
            if (CachedSeqMeta.id != seq.id) {
                CachedSeqMeta = undefined;
                // console.log("Clear CachedSeqMeta");
            }
            else metaBrief = CachedSeqMeta;
        }

        if (!metaBrief) {
            // console.log("Parse meta");
            let metaStr = XMP.getString(seq.projectItem, creatorNS, creatorKey);
            if (metaStr) {
                try {
                    metaBrief = JSON.parse(metaStr);
                } catch (e) {
                    console.log("Failed to parse sequence meta");
                }
            }
        }

        if (!metaBrief) {
            if (!create) return undefined;
            metaBrief = {
                id: seq.id,
                name: seq.name,
                render_track: undefined,
                speaker_items: [],
            }
        }
        CachedSeqMeta = metaBrief;

        return metaBrief;
    }

    //Only call from FE, expensive
    export function getMeta(create?: boolean): SequenceMeta | undefined {
        const seq = findSeq();
        if (!seq) return undefined;

        const metaBrief = getMetaBrief(create, seq);
        if (!metaBrief) return undefined;

        let resave = false;

        // Validate render track
        if (metaBrief.render_track == undefined || !findTrack(seq.videoTracks, metaBrief.render_track)) {
            const track = findEmptyTrack(seq.videoTracks);
            metaBrief.render_track = track?.id;
            resave = true;
        }

        // Validate render items
        if (checkSpeakerRenderItems(seq, metaBrief)) {
            resave = true;
        }

        if (resave) saveMeta(metaBrief, seq);

        // let videoTrackInfo = getTracksInfo(seq, seq.videoTracks);
        let trackItems = getTrackItems(seq.videoTracks, metaBrief.speaker_items);

        return {
            ...metaBrief,
            saved: !!XMP.getString(seq.projectItem, creatorNS, creatorKey),
            // selectedItem: videoTrackInfo.selected,
            // videoTracks: videoTrackInfo.tracks,
            selectedItem: trackItems.selected,
            items: trackItems.items,
        };
    }

    export function setMeta(value: SequenceMeta | undefined, seq?: Sequence): boolean {
        seq = findSeq(seq);
        if (!seq) return false;

        let metaBrief: SequenceMetaBrief | undefined;
        if (value) {
            value.saved = true;
            metaBrief = {
                id: seq.id,
                name: seq.name,
                render_track: value.render_track,
                speaker_items: value.speaker_items,
            }
        }

        return saveMeta(metaBrief, seq);
    }

    export function saveMeta(meta: SequenceMetaBrief | undefined, seq?: Sequence): boolean {
        if (!seq) seq = findSeq(seq);
        if (!seq) return false;
        if (!meta) meta = CachedSeqMeta;
        if (!meta) return false;

        if (meta) CachedSeqMeta = meta;

        const xmpValue = meta ? JSON.stringify(meta) : undefined;
        return XMP.setValue(seq.projectItem, creatorNS, creatorKey, xmpValue);
    }

    export function addSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        let meta = getMetaBrief(true, seq);
        if (!meta) return false;

        let index = 0;
        const trackItem1 = findVideoTrackItem(item.id, seq);
        if(!trackItem1) return false;

        for (let speaker of meta.speaker_items) {
            if (speaker.id == item.id) return false;
            const trackItem2 = findVideoTrackItem(speaker.id, seq);
            if(trackItem2 && trackItem2.start.seconds < trackItem1.start.seconds) {
                index++;
            }
        }

        meta.speaker_items.splice(index, 0, item);
        saveMeta(meta, seq);
        return true;
    }


    export function selectTrackItem(id: string, seq?: Sequence): boolean {
        seq = findSeq(seq);
        if (!seq) return false;
        let ret1 = selectTrackItemIn(id, seq, seq.videoTracks);
        let ret2 = selectTrackItemIn(id, seq, seq.audioTracks);
        return ret1 || ret2;
    }

    export function removeSpeakerItem(id: string, seq?: Sequence): boolean {
        let meta = getMetaBrief(true, seq);
        if (!meta) return false;

        for (let i = 0; i < meta.speaker_items.length; i++) {
            if (meta.speaker_items[i].id == id) {
                meta.speaker_items.splice(i, 1);
                saveMeta(meta, seq);
                return true;
            }
        }

        return false;
    }

    export function updateSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        let meta = getMetaBrief(true, seq);
        if (!meta) return false;

        for (let i = 0; i < meta.speaker_items.length; i++) {
            if (meta.speaker_items[i].id == item.id) {
                meta.speaker_items[i] = item;
                saveMeta(meta, seq);
                console.log("saveMeta: ", JSON.stringify(meta.speaker_items[i]));
                console.log("cache: ", JSON.stringify(CachedSeqMeta.speaker_items[i]));
                return true;
            }
        }

        return false;
    }

    export function findSequenceById(id: number): Sequence | undefined {
        for(const seq of app.project.sequences) {
            if(seq.id == id) return seq;
        }
    }

    export function updateSpeakerItems(items: {seq:number, item:SpeakerItem}[]): void {
        console.log("updateSpeakerItems: ", items.length);
        for(const item of items) {
            const seq = findSequenceById(item.seq);
            if(!seq) {
                console.log("Failed to find sequence: " + seq);
                continue;
            }
            updateSpeakerItem(item.item, seq);
            console.log("success: ", seq.id);
        }
    }

    export function findSpeakerItem(id: string, meta?: SequenceMetaBrief): SpeakerItem | undefined {
        if (!meta) meta = getMetaBrief(true);
        if (!meta) return;

        for (const item of meta.speaker_items) {
            if (item.id == id) return item;
        }
    }

    export function importSpeakerRender(id: string, addToSeq = false): boolean {
        // console.log("importSpeakerRender: ", id);
        let seq = findSeq();
        let meta = getMetaBrief(true, seq);
        if (!seq || !meta) return false;

        let speaker = findSpeakerItem(id, meta);
        if (speaker && speaker.import.asset_path) {
            if(speaker.import.render_proj_item) {
                const projItem = ProjectItemTools.find(speaker.import.render_proj_item);
                console.log("Re-importing: " + projItem?.name);
                ProjectItemTools.reimport(projItem);
                if(addToSeq) checkSpeakerRenderItems(seq, meta, addToSeq);
                return true;
            }
            const dir = new Folder(speaker.import.asset_path);
            let files = dir.getFiles();
            if (files.length) {
                // Renders are available, create a project item
                files = files.sort(sortFiles);
                const trackItem = findVideoTrackItem(speaker.id, seq);
                const fps = ProjectItemTools.FPS * (trackItem?.getSpeed() || 1);
                const projItem = ProjectItemTools.importImageSequence(files[0] as File, fps);
                if (projItem) {
                    speaker.import.render_proj_item = projItem.nodeId;
                    saveMeta(meta, seq);
                    if(addToSeq) checkSpeakerRenderItems(seq, meta, addToSeq);
                    speaker.import.invalid = false;
                    updateSpeakerItem(speaker, seq);
                    return true;
                } else {
                    console.warn("Import failed: ", speaker.import.asset_path);
                }
            } else {
                console.warn("No files to import: ", speaker.import.asset_path);
            }
        } else {
            console.warn("Not ready to import: ", id);
        }
        return false;
    }

    export function setActiveRange(seq: Sequence, start: Time, end: Time): void {
        setActiveRangeTracks(seq.videoTracks, start, end);
        setActiveRangeTracks(seq.audioTracks, start, end);
    }
    export function setActiveRangeTracks(tracks: TrackCollection, start: Time, end: Time): void {
        for (const track of tracks) {
            for (const item of track.clips) {
                if (item.end.seconds < start.seconds ||
                    item.start.seconds > end.seconds) {
                    // Remove item if outside range
                    item.remove(false, false);
                } else {
                    console.log("Update: ", item.start.seconds, start.seconds, item.inPoint.seconds);
                    if (item.start.seconds < start.seconds) {
                        const inPoint = new Time();
                        inPoint.seconds = (item.inPoint.seconds + (start.seconds - item.start.seconds));
                        item.inPoint = inPoint;
                        item.move(start);
                        console.log("Start: ", item.start.seconds, item.inPoint.seconds);
                    }
                    if (item.end.seconds > end.seconds) {
                        item.end = end;
                        console.log("End: ", item.end.seconds, end.seconds);
                    }
                }
            }
        }
    }
    
    export function setSeqTracksSpeed(sequence:Sequence, speed: number) {
        for(const track of sequence.videoTracks) {
            for(const trackItem of track.clips) {
                console.log("setSpeed: ", (trackItem as any)["setSpeed"]);
                for(const comp of trackItem.components) {
                    console.log("COMP: ", comp.displayName);
                }
            }
        }
    }
}
