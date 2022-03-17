

namespace ImageSlotTools {
    export function speakerItemDest(speaker: SpeakerItem, checkExists = true): Folder | undefined {
        if (!speaker.img_slot) {
            console.error("No image slot selected for this speaker item.");
            return;
        }

        const destPath = new Folder(`${speaker.project}/Content/${speaker.img_slot}`);
        if (checkExists && !destPath.exists) {
            console.error("Destination folder doesn't exist: ", destPath.fsName);
            return;
        }

        return destPath;
    }

    export function needsSlotRender(id: string): boolean {
        const speaker = SequenceTools.findSpeakerItem(id);
        if (!speaker?.img_slot) return false;

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

        if (!speaker.img_slot) {
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

        //TODO: validate / delete files in dest folder
        //TODO: limit in/out points of sequence to overwrite few frames

        speakerSeq.setInPoint(trackItem.inPoint.seconds);
        speakerSeq.setOutPoint(trackItem.outPoint.seconds);

        // speakerSeq.setInPoint(0);
        // const end = new Time();
        // end.ticks = speakerSeq.end;
        // speakerSeq.setOutPoint(end.seconds);
        // SequenceTools.setActiveRange(speakerSeq, trackItem.inPoint, trackItem.outPoint);

        const ret = app.encoder.encodeSequence(
            speakerSeq,
            `${tempPath.fsName}/0.png`,
            presetPath.fsName,
            app.encoder.ENCODE_IN_TO_OUT, // NO WAY TO SET IN OUT ON PROJ ITEM, NEED TO USE epr SETTINGS
            1,
            true
        );

        // const ret = app.encoder.encodeProjectItem(
        //     projItem,
        //     `${tempPath.fsName}/0.png`,
        //     presetPath.fsName,
        //     app.encoder.ENCODE_IN_TO_OUT, // NO WAY TO SET IN OUT ON PROJ ITEM, NEED TO USE epr SETTINGS
        //     1
        // );
        // app.encoder.startBatch();

        // console.log("Export: ", ret, projItem, tempPath, presetPath);
        console.log("Slot render started");

        app.project.deleteSequence(speakerSeq);
        app.project.activeSequence = mainSequence;

        const fps = 30; // also hard-coded into epr file
        
        const start = Math.round(trackItem.inPoint.seconds * fps);
        const duration = Math.round((trackItem.outPoint.seconds - trackItem.inPoint.seconds) * fps);

        return addSlotRender({
            id: id,
            output: tempPath.fsName,
            dest: dest.fsName,
            start,
            duration,
            done: 0
        }, true);

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

    /*function monitorExport(temp:Folder, dest:Folder, start:number, total:number): boolean {
        let noFileLimit = 40; // Initial timeout should be longer to allow AME to start
        let noFilesCount = 0;
        let taken = 0;
        console.log("monitorExport: ", start, total);
        while(true){
            const files = temp.getFiles("*.png");
            if(files.length == 0) {
                noFilesCount++;
                if(noFilesCount >= noFileLimit) {
                    console.log("Speaker export timed out");
                    return false;
                }
                $.sleep(1000);
            }

            noFileLimit = 5;
            noFilesCount = 0;
            
            $.sleep(1500); // wait before renaming to allow AME to finish writing

            for(let file of files) {
                if(file instanceof Folder || file.length == 0) continue; // still writing

                const frame = parseInt(file.name.replace(".png", ""));
                // console.log("File: ", frame, file);
                const destPath = `${dest.fsName}/${frame + start}.png`;
                if(!file.copy(destPath)) {
                    console.log("Copy failed: ", file.fsName, destPath);
                    continue;
                }

                if(!file.remove()) {
                    console.log("Delete failed: ", file.fsName);
                    continue;
                }

                taken++;
            }

            if(taken == total){
                console.log("Speaker export complete");
                return true;
            }
        }
    }*/
}