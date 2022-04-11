

namespace ImageSlotTools {
    export function speakerItemDest(speaker: SpeakerItem, checkExists = true): Folder | undefined {
        if (!speaker.config.img_slot) {
            console.error("No image slot selected for this speaker item.");
            return;
        }

        const destPath = new Folder(`${speaker.config.project}/Content/${speaker.config.img_slot}`);
        if (checkExists && !destPath.exists) {
            console.error("Destination folder doesn't exist: ", destPath.fsName);
            return;
        }

        return destPath;
    }

    export function needsSlotRender(id: string): boolean {
        const speaker = SequenceTools.findSpeakerItem(id);
        if (!speaker?.config.img_slot) return false;

        const dest = speakerItemDest(speaker, false);
        if (!dest) return false;
        else if (!dest.exists) return true;

        const pngs = dest.getFiles("*.png");
        // TODO: Check files within range match expectations
        return pngs.length == 0;
    }

    export function exportSpeakerItem(id: string): boolean {
        const speaker = SequenceTools.findSpeakerItem(id);
        if (!speaker) {
            console.error("Speaker item not found:", id);
            return false;
        }

        var projItem = SequenceTools.findProjItemByTrackItem(id);
        if (!projItem) {
            console.error("Project item not found:", id);
            return false;
        }

        var trackItem = SequenceTools.findVideoTrackItem(id);
        if (!trackItem) {
            console.error("Track item not found:", id);
            return false;
        }

        const dest = speakerItemDest(speaker);
        if (!dest) return false;

        if (!speaker.config.img_slot) {
            console.error("No image slot selected:", id);
            return false;
        }

        const presetPath = new File(new File($.fileName).path + "/epr/png_export_4k.epr");
        if (!presetPath.exists) {
            console.error("Preset not found:", presetPath.absoluteURI);
            return false;
        }

        const mainSequence = app.project.activeSequence;
        if (!mainSequence) return false;

        let speakerSeq = app.project.createNewSequenceFromClips("SpeakerSeq_" + speaker.id, [projItem], ProjectItemTools.getTempBin());
        if (!speakerSeq) {
            console.error("Failed to create speaker sequence:", id);
            return false;
        }

        const tempPath = new Folder(`${Folder.temp.fsName}/SlotRender/${projItem.nodeId}_${Math.round(Math.random() * 100000)}`);
        if(!tempPath.create()){
            console.error("Failed to create temp folder:", tempPath.fsName);
            return false;
        }

        // Sometimes the project item has a start time offset that isn't carried into the sequence
        const startOffset = trackItem.projectItem.startTime().seconds;

        const speed = trackItem.getSpeed();

        speakerSeq.setInPoint(trackItem.inPoint.seconds * speed);
        speakerSeq.setOutPoint(trackItem.outPoint.seconds * speed);

        const ret = app.encoder.encodeSequence(
            speakerSeq,
            `${tempPath.fsName}/0.png`,
            presetPath.fsName,
            app.encoder.ENCODE_IN_TO_OUT,
            1,
            true
        );

        //app.project.deleteSequence(speakerSeq);
        app.project.activeSequence = mainSequence;

        const fps = 30; // also hard-coded into epr file
        
        const start = Math.round(trackItem.start.seconds * fps);
        const duration = Math.floor((trackItem.outPoint.seconds - trackItem.inPoint.seconds) * speed * fps);
        
        console.log(`Slot render started: ${duration} frames`);

        speaker.slots[speaker.id] = {
            state: SlotRenderState.Rendering,
            id: id,
            output: tempPath.fsName,
            dest: dest.fsName,
            start,
            duration,
            renderDone: 0,
            fillerDone: 0,
            width: speakerSeq.frameSizeHorizontal,
            height: speakerSeq.frameSizeVertical,
        }

        SequenceTools.updateSpeakerItem(speaker);

        return true;

        //return monitorExport(tempPath, dest, startFrame, totalFrame);
    }

    

    export function getSlotRender(id: string): SlotRender | undefined {
        let meta = SequenceTools.getMetaBrief(true);
        if (!meta) return;

        for (let item of meta.slot_renders) {
            if (item.id == id) return item;
        }
        return;
    }
    export function addSlotRender(item: SlotRender, update = false): boolean {
        let meta = SequenceTools.getMetaBrief(true);
        if (!meta) return false;

        let found = false;
        for (let i=0; i<meta.slot_renders.length; i++) {
            const slot = meta.slot_renders[i];
            if (slot.id == item.id) {
                if(!update) return false;
                else {
                    found = true;
                    meta.slot_renders[i] = item;
                }
            }
        }

        if(!found) meta.slot_renders.push(item);
        SequenceTools.saveMeta(meta);
        return true;
    }
    export function removeSlotRender(id: string): boolean {
        let meta = SequenceTools.getMetaBrief(true);
        if (!meta) return false;

        for (let i=0; i<meta.slot_renders.length; i++) {
            const item = meta.slot_renders[i];
            if (item.id == id){
                meta.slot_renders.splice(i, 1);
                SequenceTools.saveMeta(meta);
                return true;
            }
        }

        return false;
    }
}