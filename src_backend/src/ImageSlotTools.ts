

namespace ImageSlotTools {
    // This exists in the frontend also!!
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

    export function checkSpeakerItem(id: string, save = true): boolean {
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

        const tempPath = new Folder(`${Folder.temp.fsName}/SlotRender/${projItem.nodeId}_${Math.round(Math.random() * 100000)}`);
        if(!tempPath.create()){
            console.error("Failed to create temp folder:", tempPath.fsName);
            return false;
        }
        
        // Need to adjust for trackItems speed factor
        const speed = trackItem.getSpeed();
        const fps = ProjectItemTools.FPS;
        
        const start = Math.max(0, Math.round((trackItem.start.seconds + speaker.config.ue_time_offset) * fps));
        const duration = Math.round((trackItem.outPoint.seconds - trackItem.inPoint.seconds) * speed * fps);

        speaker.slots[speaker.id] = {
            invalid: false,
            state: SlotRenderState.Idle,
            id: id,
            output: tempPath.fsName,
            dest: dest.fsName,
            start,
            duration,
            renderDone: 0,
            fillerDone: 0,
            width: 0,
            height: 0,
        }
        
        // console.log(`Slot render check: ${duration} frames: ` + speaker.slots[speaker.id].output);

        speaker.render.invalid = true;
        speaker.import.invalid = true;

        if(save) SequenceTools.updateSpeakerItem(speaker);

        return true;
    }
    

    export function exportSpeakerItem(id: string, epr: string): boolean {
        if(!checkSpeakerItem(id, false)) {
            return false;
        }
        
        const speaker = SequenceTools.findSpeakerItem(id);
        if (!speaker) {
            console.error("Speaker item not found:", id);
            return false;
        }

        const slotRender = speaker.slots[speaker.id];
        if (!slotRender) {
            console.error("Slot Render not found:", id);
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

        const presetPath = new File(epr);
        if (!presetPath?.exists) {
            console.error("Preset not found:", presetPath?.absoluteURI);
            return false;
        }

        const mainSequence = app.project.activeSequence;
        if (!mainSequence) return false;

        let speakerSeq = app.project.createNewSequenceFromClips("SpeakerSeq_" + id, [projItem], ProjectItemTools.getTempBin());
        if (!speakerSeq) {
            console.error("Failed to create speaker sequence:", id);
            return false;
        }
        slotRender.width = speakerSeq.frameSizeHorizontal;
        slotRender.height = speakerSeq.frameSizeVertical;
        slotRender.state = SlotRenderState.Rendering;

        // Need to adjust for trackItems speed factor
        const speed = trackItem.getSpeed();

        speakerSeq.setInPoint(trackItem.inPoint.seconds * speed);
        speakerSeq.setOutPoint(trackItem.outPoint.seconds * speed);

        // console.log("Begin slot render: " + slotRender.output);

        const ret = app.encoder.encodeSequence(
            speakerSeq,
            `${slotRender.output}/0.png`,
            presetPath.fsName,
            app.encoder.ENCODE_IN_TO_OUT,
            1,
            true
        );

        app.project.deleteSequence(speakerSeq);
        app.project.activeSequence = mainSequence;

        SequenceTools.updateSpeakerItem(speaker);

        return true;
    }
}