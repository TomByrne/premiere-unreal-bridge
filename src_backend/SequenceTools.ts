

namespace SequenceTools {
    var CachedSeqMeta: SequenceMetaBrief | undefined;

    const creatorNS = "http://ns.adobe.com/xap/1.0/";
    const creatorKey = "CreatorTool";

    function findSeq(seq?: Sequence): Sequence | undefined {
        if (!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if (!seq) {
            console.log("No Sequence found");
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

    // function getTracksInfo(seq: Sequence, tracks: TrackCollection): { tracks: TrackInfo[], selected: string | undefined } {
    //     var ret: TrackInfo[] = [];
    //     let selected: string[] = [];
    //     for (let i = 0; i < tracks.length; i++) {
    //         let track = tracks[i];
    //         if (!track) continue;
    //         let items: TrackItemInfo[] = [];
    //         for (let j = 0; j < track.clips.length; j++) {
    //             let clip = track.clips[j];
    //             if (!clip) continue;

    //             if (clip.isSelected()) {
    //                 selected.push(clip.nodeId);
    //             }

    //             items.push({
    //                 id: clip.nodeId,
    //                 name: clip.name,
    //                 start: clip.start.seconds,
    //                 end: clip.end.seconds,
    //             });
    //         }

    //         ret.push({
    //             id: track.id,
    //             name: track.name,
    //             items: items
    //         })
    //     }
    //     return {
    //         tracks: ret,
    //         selected: (selected.length == 1 ? selected[0] : undefined),
    //     };
    // }

    function findTrack(tracks: TrackCollection, id:number): Track | undefined {
        for(const track of tracks) if(track.id == id) return track;
    }
    function findEmptyTrack(tracks: TrackCollection): Track | undefined {
        for(const track of tracks) if(track.clips.length == 0) return track;
    }
    function findTrackItem(tracks: Array<Track>, itemId:string): TrackItem | undefined {
        for(const track of tracks){
            for(const item of track.clips){
                if(item.nodeId == itemId) return item;
            }
        }
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

    function sortFiles(f1:File | Folder, f2:File | Folder): number {
        const n1 = f1.name;
        const n2 = f2.name;
        return (n1 < n2 ? -1 : (n2 < n1 ? 1 : 0));
    }

    function checkSpeakerRenderItems(seq:Sequence, meta:SequenceMetaBrief): boolean {
        const renderTrack = meta.render_track == undefined ? undefined : findTrack(seq.videoTracks, meta.render_track);
        let ret = false;
        for(const speaker of meta.speaker_items){
            let item:TrackItem | undefined;
            if(speaker.render_track_item) {
                if(renderTrack) item = findTrackItem([renderTrack], speaker.render_track_item);
                if(!item) item = findTrackItem(seq.videoTracks, speaker.render_track_item);
            }

            // Remove Track item if invalid
            if(item && (!renderTrack || renderTrack.clips.indexOf(item) == -1)){
                item.remove(false, false);
                speaker.render_track_item = undefined;
                ret = true;
                item = undefined;
            }

            // if(importSpeakerRender(speaker.id)){
            //     ret = true;
            // }

            if(!item && renderTrack && speaker.render_proj_item) {
                const projItem = ProjectItemTools.find(speaker.render_proj_item);
                const origTrackItem = findTrackItem(seq.videoTracks, speaker.id);
                if(!origTrackItem) {
                    // TODO: Orig item removed, should remove spearker item
                    continue;
                }
                const renderTrackItem = speaker.render_track_item ? findTrackItem(seq.videoTracks, speaker.render_track_item)  :undefined;
                if(!projItem) {
                    console.log("Project item was not found");
                    // Proj item has been deleted
                    //TODO: clear track item
                    speaker.render_proj_item = undefined;
                    if(renderTrackItem){
                        renderTrackItem.remove(false, false);
                        speaker.render_track_item = undefined;
                        ret = true;
                    }
                    ret = true;
                }else{
                    try{
                        item = renderTrack.insertClip(projItem, origTrackItem.start.seconds);
                        item.end = origTrackItem.end;
                        speaker.render_track_item = item.nodeId;
                        ret = true;
                    }catch(e){
                        console.warn("Failed to insert clip", e);
                    }
                }
            }
        }
        return ret;
    }
    
    export function getMetaBrief(create?: boolean, seq?: Sequence): SequenceMetaBrief | undefined {

        seq = findSeq(seq);
        if (!seq) return undefined;

        let metaBrief: SequenceMetaBrief | undefined;
        // if(CachedSeqMeta) console.log("getMeta: "+ CachedSeqMeta?.speaker_items[0].render_proj_item);
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
        if(!metaBrief) return undefined;
        
        let resave = false;

        // Validate render track
        if(metaBrief.render_track == undefined || !findTrack(seq.videoTracks, metaBrief.render_track)) {
            const track = findEmptyTrack(seq.videoTracks);
            metaBrief.render_track = track?.id;
            resave = true;
        }
        
        // Validate render items
        if(checkSpeakerRenderItems(seq, metaBrief)){
            resave = true;
        }
        
        if(resave) saveMeta(metaBrief, seq);

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

    function saveMeta(meta:SequenceMetaBrief | undefined, seq?:Sequence): boolean {
        if(!seq) seq = findSeq(seq);
        if(!seq) return false;
        if(!meta) meta = CachedSeqMeta;
        if(!meta) return false;
        
        if(meta) CachedSeqMeta = meta;

        const xmpValue = meta ? JSON.stringify(meta) : undefined;
        return XMP.setValue(seq.projectItem, creatorNS, creatorKey, xmpValue);
    }

    export function addSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        let meta = getMetaBrief(true, seq);
        if (!meta) return false;

        for (let speaker of meta.speaker_items) {
            if (speaker.id == item.id) return false;
        }

        meta.speaker_items.push(item);
        saveMeta(meta);
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
                saveMeta(meta);
                return true;
            }
        }

        return false;
    }

    export function updateSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        console.log("updateSpeakerItem: " + item.id + " " + item.render_proj_item);
        let meta = getMetaBrief(true, seq);
        if (!meta) return false;

        for (let i = 0; i < meta.speaker_items.length; i++) {
            if (meta.speaker_items[i].id == item.id) {
                meta.speaker_items[i] = item;
                saveMeta(meta);
                return true;
            }
        }

        return false;
    }

    function findSpeakerItem(id: string, meta?:SequenceMetaBrief): SpeakerItem | undefined {
        if (!meta) meta = getMetaBrief(true);
        if (!meta) return;

        for(const item of meta.speaker_items) {
            if(item.id == id) return item;
        }
    }

    export function importSpeakerRender(id:string): boolean {
        let meta = getMetaBrief(true);
        if (!meta) return false;

        let speaker = findSpeakerItem(id, meta);
        if(speaker && !speaker.render_proj_item && speaker.render_path) {
            const dir = new Folder(speaker.render_path);
            let files = dir.getFiles();
            if(files.length) {
                // Renders are available, create a project item
                files = files.sort(sortFiles);
                const projItem = ProjectItemTools.importImageSequence(files[0] as File);
                if(projItem) {
                    speaker.render_proj_item = projItem.nodeId;
                    let meta2 = getMetaBrief(true);
                    if(meta2){
                        console.log("hmm: "+(meta2 == meta));
                        console.log("hmm2: "+meta2.speaker_items[0].render_proj_item);
                        console.log("hmm3: "+(meta2.speaker_items[0] == speaker));
                        console.log("hmm4: "+CachedSeqMeta?.speaker_items[0].render_proj_item);
                    }
                    saveMeta(meta);
                    return true;
                } else{
                    console.warn("Import failed: ", speaker.render_path);
                }
            } else{
                console.warn("No files to import: ", speaker.render_path);
            }
        } else{
            console.warn("Not ready to import: ", id);
        }
        return false;
    }
}