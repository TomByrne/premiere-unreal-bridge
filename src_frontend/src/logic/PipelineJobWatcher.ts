import model from "@/model";
import fs from "fs";
import path from "path";
import { SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";
import Fs from "../utils/Fs";
import mitt from "mitt";


type Events = {
    renderStopped: SpeakerItem;
};
export const emitter = mitt<Events>();

const PROCESSOR_REG = /\[ (.*?) \]/;
// const SECS_REG = / (\d+)s( |$)/;
// const FRAMES_REG = / (\d+)f( |$)/;

/**
 * This class watches running job files and updates the model with
 * progress info.
 */
export function setup(): void {
    checkJobsSoon();
}

function updateJob(item: SpeakerItem, updates: Record<string, unknown>) {
    let changes = false;
    for (const i in updates) {
        const val = updates[i];
        if (Reflect.get(item.render, i) != val) {
            Reflect.set(item.render, i, val);
            changes = true;
        }
    }

    if (changes) {
        SequenceTools.updateSpeakerItemSoon(item);
    }
}

function checkJobsSoon(secs = 2){
    setTimeout(() => checkJobs(), secs * 1000);
}

function checkJobs() {
    const meta = model.sequence.sequenceMeta;
    if (!meta){
        checkJobsSoon();
        return;
    }
    
    Fs.exists(model.settings.pipeline_jobFolder)
    .then((exists: boolean) => {
        if(!exists){
            checkJobsSoon();
            return;
        }
        // Run sequentially
        const starterPromise = Promise.resolve(null);
        meta.speaker_items.reduce(
            (p, item) => p.then(() => checkJob(item).then()),
            starterPromise
        )
        .finally(() => {
            checkJobsSoon();
        });
    });
}

async function checkJob(item:SpeakerItem): Promise<void> {
    if (!item.render.job_path) return;

    // Create destination folder if doesn't exist
    if(!await Fs.exists(item.import.asset_path)) {
        await fs.promises.mkdir(item.import.asset_path, {recursive:true});
    }

    let someFailed = false;

    // Copy render frames from UE project into destination folder
    if(item.render.state == SpeakerRenderState.Rendering) {
        if (item.render.job && item.render.render_path) {
            const start = item.render.job.start_frame || 0;
            const images = await Fs.readdir(item.render.render_path, '.jpeg');
            // console.log("images:", images.length);
            let highestFrame = item.render.frames || 0;
            for (const image of images) {
                const frame = (parseInt(image) - start);
                const frame_str = frame.toString().padStart(6, "0");
                const imgPath = path.join(item.render.render_path, image);
                const destPath = path.join(item.import.asset_path, `frame_${frame_str}.jpg`);

    
                try {
                    await fs.promises.copyFile(imgPath, destPath);
                } catch(e){
                    console.error("Failed to copy file: ", imgPath, destPath, e);
                    someFailed = true;
                    continue;
                }
                try {
                    await fs.promises.unlink(imgPath);
                } catch(e) {
                    console.error("Failed to delete file: ", imgPath, e);
                    someFailed = true;
                    continue;
                }
                highestFrame = Math.max(highestFrame, frame+1); // zero based to one based
            }
    
            if(item.render.frames != highestFrame) {
                item.render.frames = highestFrame;
                SequenceTools.updateSpeakerItemSoon(item);
            }
        }
    }

    item.render.saved = await Fs.exists(item.render.job_path);

    // Check destination folder in case images are missing
    if(item.render.state == SpeakerRenderState.Done) {
        const images = await Fs.readdir(item.import.asset_path, '.jpg');
        const looksDone = images.length == item.render.total;
        if(!looksDone) {
            item.render.state = SpeakerRenderState.Failed;
            SequenceTools.updateSpeakerItemSoon(item);
            return;
        }
    }

    // If finalised , we're done
    if (item.render.state == SpeakerRenderState.Done ||
        item.render.state == SpeakerRenderState.Failed ||
        item.render.state == SpeakerRenderState.Cancelled)  return;

    const name = path.basename(item.render.job_path);

    // Check the pipeline folders for more job info 
    if (!item.render.saved) {

        if(someFailed) return; // Leave in rendering state for now

        if (await Fs.exists(path.join(model.settings.pipeline_jobFolder, model.pipeline.doneFolder, name))) {
            const got_all = (item.render.frames || 0) >= (item.render.total || 0);
            updateJob(item, { state: got_all ? SpeakerRenderState.Done : SpeakerRenderState.Failed, saved: false });

        } else if (await Fs.exists(path.join(model.settings.pipeline_jobFolder, model.pipeline.failedFolder, name))) {
            updateJob(item, { state: SpeakerRenderState.Failed, saved: false });

        } else if (await Fs.exists(path.join(model.settings.pipeline_jobFolder, model.pipeline.cancelledFolder, name))) {
            updateJob(item, { state: SpeakerRenderState.Cancelled, saved: false });

        } else if (item.render.saved) {
            // Lost job file!
            updateJob(item, { state: undefined, saved: false });
        }
        
        if (item) {
            emitter.emit("renderStopped", item);
        }
    } else {

        const name_noext = path.basename(item.render.job_path, "json");

        let processor: string | undefined;

        const jobFiles = await fs.promises.readdir(model.settings.pipeline_jobFolder);
        for (const file of jobFiles) {
            if (file == name || file.indexOf(name_noext) != 0) continue;

            // Found alive file
            const match = file.match(PROCESSOR_REG);
            processor = match ? match[1] : undefined;

            break;
        }

        updateJob(item, { state: SpeakerRenderState.Rendering, processor });

    }
}

export default {
    emitter,
    setup,
};
