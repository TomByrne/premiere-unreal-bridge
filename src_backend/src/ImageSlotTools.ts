

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

    export function exportSpeakerItem(id: string, epr: string): boolean {
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

        // const presetPath = new File(new File($.fileName).path + "/epr/png_export_4k.epr");
        const presetPath = new File(epr);
        if (!presetPath?.exists) {
            console.error("Preset not found:", presetPath?.absoluteURI);
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

        // Need to adjust for trackItems speed factor
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

        app.project.deleteSequence(speakerSeq);
        app.project.activeSequence = mainSequence;

        const fps = ProjectItemTools.FPS;
        
        const start = Math.round(trackItem.start.seconds * fps);
        const duration = Math.round((trackItem.outPoint.seconds - trackItem.inPoint.seconds) * speed * fps);
        
        console.log(`Slot render started: ${duration} frames`);

        speaker.slots[speaker.id] = {
            invalid: false,
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

        speaker.render.invalid = true;
        speaker.import.invalid = true;

        SequenceTools.updateSpeakerItem(speaker);

        return true;

        //return monitorExport(tempPath, dest, startFrame, totalFrame);
    }
}