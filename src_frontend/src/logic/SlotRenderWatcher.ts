import { watch } from "vue";
import model from "@/model";
import { SlotRender } from "@/model/sequence";
import fs from "fs";
import path from "path";
import ImageSlotTools from "./ImageSlotTools";

class RenderWatcher{
    timer: NodeJS.Timer;
    noFileLimit = 60;
    noFilesCount = 0;

    constructor(private slot:SlotRender){
        this.timer = setInterval(() => this.watch(), 1000);
    }

    private watch(){
        fs.promises.readdir(this.slot.output)
        .then((files) => {
            if(files.length == 0) {
                this.noFilesCount++;
                if(this.noFilesCount >= this.noFileLimit) {
                    console.warn("Speaker export timed out");
                    this.cleanup();
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
                this.cleanup();
            }
        })
        .catch((e) => {
            console.warn("Failed to read output folder: ", this.slot.output, e);
            this.cleanup();
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
            } catch(e:any){
                if(e.message.indexOf("EBUSY:") == 0) {
                    // AME still writing file
                }else {
                    console.warn("Failed to move file: ", file, e);
                }
                return false;
            }
        } catch(e:any) {
            console.warn("Failed to check file: ", file, e);
            return false;
        }
    }

    private incrementDone(){
        this.slot.done++;
        ImageSlotTools.addSlotRender(this.slot, true);
    }

    cleanup(){
        clearInterval(this.timer);
        ImageSlotTools.removeSlotRender(this.slot.id);
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
    const slots = model.sequence.sequenceMeta?.slot_renders || [];
    for(const i in watchers) {
        if(!slots.find(x => x.id === i)) {
            watchers[i].cleanup();
            delete watchers[i];
        }
    }

    for(const slot of slots) {
        if(!watchers[slot.id])
            watchers[slot.id] = new RenderWatcher(slot);
    }
}

export default {
    setup,
};
