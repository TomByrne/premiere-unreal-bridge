

namespace SequenceTools {

    let cached:SequenceMetaBrief | undefined;

    const creatorNS = "http://ns.adobe.com/xap/1.0/";
    const creatorKey = "CreatorTool";

    function findSeq(seq?: Sequence) : Sequence | undefined {
        if (!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if (!seq) {
            console.log("No Sequence found");
            return undefined;
        }else {
            return seq;
        }
    }

    function getTracksInfo(seq:Sequence, tracks:TrackCollection): {tracks: TrackInfo[], selected:string|undefined} {
        var ret:TrackInfo[] = [];
        let selected: string[] = [];
        for(let i=0; i<tracks.length; i++) {
            let track = tracks[i];
            if(!track) continue;
            let items:TrackItemInfo[] = [];
            for(let j=0; j<track.clips.length; j++) {
                let clip = track.clips[j];
                if(!clip) continue;

                if(clip.isSelected()) {
                    selected.push(clip.nodeId);
                }

                items.push({
                    id: clip.nodeId,
                    name: clip.name,
                    start: clip.start.seconds,
                    end: clip.end.seconds,
                });
            }

            ret.push({
                id: track.id,
                name: track.name,
                items: items
            })
        }
        return {
            tracks: ret,
            selected: (selected.length == 1 ? selected[0] : undefined),
        };
    }

    export function getMeta(create?:boolean, seq?: Sequence): SequenceMeta | undefined {
        seq = findSeq(seq);
        if(!seq) return undefined;

        let metaBrief: SequenceMetaBrief | undefined;
        if(cached) {
            if(cached.id != seq.id) cached = undefined;
            else metaBrief = cached;
        }

        if(!metaBrief){
            let metaStr = XMP.getString(seq.projectItem, creatorNS, creatorKey);
            if(metaStr){
                try {
                    metaBrief = JSON.parse(metaStr);
                } catch(e){
                    console.log("Failed to parse sequence meta");
                }
            }
        }

        let saved = true;
        if(!metaBrief) {
            if(!create) return undefined;
            saved = false;
            metaBrief = {
                id: seq.id,
                render_track: undefined,
                speaker_items: [],
            }
            cached = metaBrief;
        }

        let videoTrackInfo = getTracksInfo(seq, seq.videoTracks);

        return {
            ...metaBrief,
            saved,
            selectedItem: videoTrackInfo.selected,
            videoTracks: videoTrackInfo.tracks,
        };
    }

    export function setMeta(value: SequenceMeta | undefined, seq?: Sequence): boolean {
        seq = findSeq(seq);
        if(!seq) return false;


        let xmpValue: XMPValue | undefined;
        if (value) {
            value.saved = true;
            let metaBrief: SequenceMetaBrief = {
                id: seq.id,
                render_track: value.render_track,
                speaker_items: value.speaker_items,
            }
            cached = metaBrief;
            xmpValue = JSON.stringify(metaBrief);
        }

        return XMP.setValue(seq.projectItem, creatorNS, creatorKey, xmpValue);
    }

    export function setRenderTrack(id: string | undefined, seq?: Sequence): boolean {
        let meta = getMeta(true, seq);
        if(!meta) return false;
        meta.render_track = id;
        return setMeta(meta, seq);
    }

    export function addSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        let meta = getMeta(true, seq);
        if(!meta) return false;

        for(let speaker of meta.speaker_items) {
            if(speaker.itemId == item.itemId) return false;
        }

        meta.speaker_items.push(item);
        setMeta(meta);
        return true;
    }

    export function removeSpeakerItem(id: string, seq?: Sequence): boolean {
        let meta = getMeta(true, seq);
        if(!meta) return false;

        for(let i=0; i<meta.speaker_items.length; i++) {
            if(meta.speaker_items[i].itemId == id){
                meta.speaker_items.splice(i, 1);
                setMeta(meta);
                return true;
            }
        }

        return false;
    }

    export function updateSpeakerItem(item: SpeakerItem, seq?: Sequence): boolean {
        let meta = getMeta(true, seq);
        if(!meta) return false;

        for(let i=0; i<meta.speaker_items.length; i++) {
            if(meta.speaker_items[i].itemId == item.itemId){
                meta.speaker_items[i] = item;
                setMeta(meta);
                return true;
            }
        }

        return false;
    }
}