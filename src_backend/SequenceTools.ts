namespace SequenceTools {

    let cached: SequenceMetaBrief | undefined;

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

            if(!speaker.render_proj_item && speaker.render_path) {
                const dir = new Folder(speaker.render_path);
                const files = dir.getFiles();
                if(files.length) {
                    // Renders are available, create a project item
                    const projItem = ProjectItemTools.importImageSequence(files[0].path);
                    if(projItem) {
                        speaker.render_proj_item = projItem.nodeId;
                        ret = true;
                    }
                }
            }

            if(!item && renderTrack && speaker.render_proj_item) {
                const projItem = ProjectItemTools.find(speaker.render_proj_item);
                const origTrackItem = findTrackItem(seq.videoTracks, speaker.id);
                if(!origTrackItem) {
                    // TODO: Orig item removed, should remove spearker item
                    continue;
                }
                if(!projItem) {
                    // Proj item has been deleted
                    speaker.render_proj_item = undefined;
                    ret = true;
                }else{
                    item = renderTrack.insertClip(projItem, origTrackItem.start);
                }
            }
        }
        return ret;
    }

    export function getMeta(create?: boolean, seq?: Sequence): SequenceMeta | undefined {
        seq = findSeq(seq);
        if (!seq) return undefined;

        let metaBrief: SequenceMetaBrief | undefined;
        if (cached) {
            if (cached.id != seq.id) cached = undefined;
            else metaBrief = cached;
        }

        if (!metaBrief) {
            let metaStr = XMP.getString(seq.projectItem, creatorNS, creatorKey);
            if (metaStr) {
                try {
                    metaBrief = JSON.parse(metaStr);
                } catch (e) {
                    console.log("Failed to parse sequence meta");
                }
            }
        }

        let saved = true;
        let resave = false;
        if (!metaBrief) {
            if (!create) return undefined;
            saved = false;
            metaBrief = {
                id: seq.id,
                name: seq.name,
                render_track: undefined,
                speaker_items: [],
            }
            cached = metaBrief;
        }

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

        
        if(resave && saved) saveMeta(seq, metaBrief);

        // let videoTrackInfo = getTracksInfo(seq, seq.videoTracks);
        let trackItems = getTrackItems(seq.videoTracks, metaBrief.speaker_items);

        return {
            ...metaBrief,
            saved,
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
            cached = metaBrief;
        }

        return saveMeta(seq, metaBrief);
    }

    function saveMeta(seq:Sequence, meta:SequenceMetaBrief | undefined): boolean {
        const xmpValue = meta ? JSON.stringify(meta) : undefined;
        return XMP.setValue(seq.projectItem, creatorNS, creatorKey, xmpValue);
    }

    export function addSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        let meta = getMeta(true, seq);
        if (!meta) return false;

        for (let speaker of meta.speaker_items) {
            if (speaker.id == item.id) return false;
        }

        meta.speaker_items.push(item);
        setMeta(meta);
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
        let meta = getMeta(true, seq);
        if (!meta) return false;

        for (let i = 0; i < meta.speaker_items.length; i++) {
            if (meta.speaker_items[i].id == id) {
                meta.speaker_items.splice(i, 1);
                setMeta(meta);
                return true;
            }
        }

        return false;
    }

    export function updateSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        let meta = getMeta(true, seq);
        if (!meta) return false;

        for (let i = 0; i < meta.speaker_items.length; i++) {
            if (meta.speaker_items[i].id == item.id) {
                meta.speaker_items[i] = item;
                setMeta(meta);
                return true;
            }
        }

        return false;
    }
}