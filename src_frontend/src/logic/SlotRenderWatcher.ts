import { watch } from "vue";
import model from "@/model";
import { SlotRender, SlotRenderState, SpeakerItem } from "@/model/sequence";
import fs from "fs";
import path from "path";
import SequenceTools from "./SequenceTools";

class RenderWatcher{
    timer: NodeJS.Timer;
    noFileLimit = 60;
    noFilesCount = 0;

    constructor(private item:SpeakerItem, private slot:SlotRender){
        this.timer = setInterval(() => this.watch(), 1000);
    }

    private watch(){
        fs.promises.readdir(this.slot.output)
        .then((files) => {
            if(files.length == 0) {
                this.noFilesCount++;
                if(this.noFilesCount >= this.noFileLimit) {
                    console.warn("Speaker export timed out");
                    this.cleanup(false);
                }
                return;
            }

            this.noFileLimit = 5;
            this.noFilesCount = 0;
    
            for(const file of files) {
                this.checkFile(file, path.join(this.slot.output, file));
            }
    
            if(this.slot.done == this.slot.duration){
                console.log("Speaker export complete");
                this.cleanup(true);
            }
        })
        .catch((e) => {
            console.warn("Failed to read output folder: ", this.slot.output, e);
            this.cleanup(false);
        })
    }

    private checkFile(name: string, file: string): boolean {
        try {
            const stat = fs.statSync(file);
            if(stat.isDirectory()) return false;
            if(stat.size == 0) return false; // probs still writing
    
            const frame = parseInt(name.replace(".png", ""));
            // console.log("File: ", frame, file);
            const frameStr = (frame + this.slot.start).toString().padStart(6, "0");
            const destPath = `${this.slot.dest}/${frameStr}.png`;
    
            try {
                fs.renameSync(file, destPath);
                this.incrementDone();
                console.debug("Moved file to", destPath);
                return true;
            } catch(e:unknown){
                if(e instanceof Error && e.message.indexOf("EBUSY:") == 0) {
                    // AME still writing file
                }else {
                    console.warn("Failed to move file: ", file, e);
                }
                return false;
            }
        } catch(e:unknown) {
            console.warn("Failed to check file: ", file, e);
            return false;
        }
    }

    private incrementDone(){
        this.slot.done++;
        SequenceTools.updateSpeakerItem(this.item);
        // ImageSlotTools.addSlotRender(this.slot, true);
    }

    cleanup(success: boolean, save = true){
        this.slot.state = (success ? SlotRenderState.Complete : SlotRenderState.Failed);
        clearInterval(this.timer);
        if(save) SequenceTools.updateSpeakerItem(this.item);
    }
}


/**
 * Monitors renders coming out of AME and moves the images into the UE project.
 */
 export function setup(): void {
    watch(
        () => [model.sequence.sequenceMeta],
        () => {
          checkJobs();
        },
        { immediate: true }
      );
}

const watchers:Record<string, RenderWatcher> = {};

function checkJobs(){
    const meta = model.sequence.sequenceMeta;
    if(!meta) return;
    
    for(const id in watchers) {
        if(!meta.speaker_items.find(x => !!x.slots[id])) {
            watchers[id].cleanup(false, false);
            delete watchers[id];
        }
    }

    for(const item of meta.speaker_items) {
        for(const id in item.slots) {
            if(!watchers[id]) {
                watchers[id] = new RenderWatcher(item, item.slots[id]);
            }
        }
    }
}

export default {
    setup,
};
