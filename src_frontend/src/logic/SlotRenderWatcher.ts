import { watch } from "vue";
import model from "@/model";
import { SlotRender, SlotRenderState, SpeakerItem } from "@/model/sequence";
import fs from "fs";
import path from "path";
import SequenceTools from "./SequenceTools";
import { PNG } from "pngjs";

class RenderWatcher{
    timer: NodeJS.Timer;
    noFileLimit = 60;
    noFilesCount = 0;
    emptyPng_buffer: Buffer | undefined;
    emptyPng_width = 0;
    emptyPng_height = 0;
    finished = false;

    constructor(private item:SpeakerItem, public slot:SlotRender){
        console.log("Watching slot render: ", item, slot);
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

            this.noFileLimit = 10;
            this.noFilesCount = 0;
    
            for(const file of files) {
                this.checkFile(file, path.join(this.slot.output, file));
            }
    
            if(this.slot.renderDone >= this.slot.duration){
                console.log("Speaker export complete");
                clearInterval(this.timer);
                this.fillImages();
                // this.cleanup(true);
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
            const destPath = this.getPath(frame + this.slot.start);
    
            try {
                // fs.renameSync(file, destPath); // Doesn't handle network drive well
                fs.copyFileSync(file, destPath);
                fs.unlinkSync(file);
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

    private getPath(frame: number): string {
        const frameStr = frame.toString().padStart(6, "0");
        return `${this.slot.dest}/${frameStr}.png`;
    }

    private fillImages(frame = 0): void {
        if(this.slot.state == SlotRenderState.Complete || this.slot.state == SlotRenderState.Failed) return;

        this.slot.state = SlotRenderState.Filling;
        SequenceTools.updateSpeakerItemSoon(this.item);

        if(frame >= this.slot.start) {
            console.log("Finished filling in image sequence start");
            this.cleanup(true);
            return;
        }
        if(frame == 0) console.log("Filling in image sequence start");


        const destPath = this.getPath(frame);
        // console.log("writing empty png: ", frame, this.slot.width, this.slot.height, destPath);
        if(!this.emptyPng_buffer || this.emptyPng_width != this.slot.width || this.emptyPng_height != this.slot.height) {
            const png = new PNG({ width: this.slot.width, height: this.slot.height });
            this.emptyPng_buffer = PNG.sync.write(png);
            this.emptyPng_width = this.slot.width;
            this.emptyPng_height = this.slot.height;
        }
        const stream = fs.createWriteStream(destPath);

        stream.write(this.emptyPng_buffer);

        stream.end();
        stream
        .on("error", (e) => {
            console.error("Failed to write empty png: ", destPath, e);
        })
        .on("close", () => {
            this.slot.fillerDone++;
            SequenceTools.updateSpeakerItemSoon(this.item);
            this.fillImages(frame+1);
        });
    }

    private incrementDone(){
        this.slot.renderDone++;
        SequenceTools.updateSpeakerItemSoon(this.item);
        // ImageSlotTools.addSlotRender(this.slot, true);
    }

    cleanup(success: boolean, save = true){
        this.finished = true;
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
        const watcher = watchers[id];
        if(watcher.finished) delete watchers[id];
        if(!meta.speaker_items.find(x => !!x.slots[id])) {
            watcher.cleanup(false, false);
        }
    }

    for(const item of meta.speaker_items) {
        for(const id in item.slots) {
            const slot = item.slots[id];
            if(!watchers[id]) {
                if(slot.state != SlotRenderState.Failed && slot.state != SlotRenderState.Complete)
                    watchers[id] = new RenderWatcher(item, slot);
            }else{
                watchers[id].slot = slot;
            }
        }
    }
}

export default {
    setup,
};
