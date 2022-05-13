import model from "@/model";
import fs from "fs";
import path from "path";
import { SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";
import Fs from "../utils/Fs";

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

    if(!await Fs.exists(item.import.asset_path)) {
        await fs.promises.mkdir(item.import.asset_path, {recursive:true});
    }

    if (item.render.job && item.render.render_path && await Fs.exists(item.render.render_path)) {
        const start = item.render.job.start_frame || 0;
        const images = await fs.promises.readdir(item.render.render_path);
        let succeeded = 0;
        for (const image of images) {
            const frame = (parseInt(image) - start).toString().padStart(6, "0");
            const imgPath = path.join(item.render.render_path, image);
            const destPath = path.join(item.import.asset_path, `frame_${frame}.jpg`);

            try {
                await fs.promises.copyFile(imgPath, destPath);
            } catch(e){
                console.error("Failed to copy file: ", imgPath, destPath, e);
                continue;
            }
            try {
                await fs.promises.unlink(imgPath);
            } catch(e) {
                console.error("Failed to delete file: ", imgPath, e);
                continue;
            }
            succeeded++;
        }

        if(succeeded) {
            item.render.frames = (item.render.frames || 0) + succeeded;
            SequenceTools.updateSpeakerItemSoon(item);
        }
    }

    if (item.render.state == SpeakerRenderState.Done ||
        item.render.state == SpeakerRenderState.Failed ||
        item.render.state == SpeakerRenderState.Cancelled) return;

    const name = path.basename(item.render.job_path);

    if (!await Fs.exists(item.render.job_path)) {
        if (await Fs.exists(path.join(model.settings.pipeline_jobFolder, model.pipeline.doneFolder, name))) {
            updateJob(item, { state: SpeakerRenderState.Done, saved: false });

        } else if (await Fs.exists(path.join(model.settings.pipeline_jobFolder, model.pipeline.failedFolder, name))) {
            updateJob(item, { state: SpeakerRenderState.Failed, saved: false });

        } else if (await Fs.exists(path.join(model.settings.pipeline_jobFolder, model.pipeline.cancelledFolder, name))) {
            updateJob(item, { state: SpeakerRenderState.Cancelled, saved: false });

        } else if (item.render.saved) {
            // Lost job file!
            updateJob(item, { state: undefined, saved: false });
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

/*function checkJobs_old() {
    const meta = model.sequence.sequenceMeta;
    if (!meta || !fs.existsSync(model.settings.pipeline_jobFolder)) return;

    const allFiles = fs.readdirSync(model.settings.pipeline_jobFolder);

    for (const i in meta.speaker_items) {
        const item = meta.speaker_items[i];
        if (!item.render.job_path) continue;

        if(!fs.existsSync(item.import.asset_path)) {
            fs.mkdirSync(item.import.asset_path, {recursive:true});
        }

        if (item.render.job && item.render.render_path && fs.existsSync(item.render.render_path)) {
            const start = item.render.job.start_frame || 0;
            const images = fs.readdirSync(item.render.render_path);
            for (const image of images) {
                const frame = (parseInt(image) - start).toString().padStart(6, "0");
                const imgPath = path.join(item.render.render_path, image);
                const destPath = path.join(item.import.asset_path, `frame_${frame}.jpg`);

                try {
                    fs.copyFileSync(imgPath, destPath);
                } catch(e){
                    console.error("Failed to copy file: ", imgPath, destPath, e);
                    continue;
                }
                try {
                    fs.unlinkSync(imgPath);
                } catch(e) {
                    console.error("Failed to delete file: ", imgPath, e);
                }
            }

            if(images.length) {
                item.render.frames = (item.render.frames || 0) + images.length;
                SequenceTools.updateSpeakerItemSoon(item);
            }
        }

        const exists = fs.existsSync(item.render.job_path);

        if (item.render.state == SpeakerRenderState.Done ||
            item.render.state == SpeakerRenderState.Failed ||
            item.render.state == SpeakerRenderState.Cancelled) continue;

        const name = path.basename(item.render.job_path);

        if (!exists) {
            if (fs.existsSync(path.join(model.settings.pipeline_jobFolder, model.pipeline.doneFolder, name))) {
                updateJob(item, { state: SpeakerRenderState.Done, saved: false });

            } else if (fs.existsSync(path.join(model.settings.pipeline_jobFolder, model.pipeline.failedFolder, name))) {
                updateJob(item, { state: SpeakerRenderState.Failed, saved: false });

            } else if (fs.existsSync(path.join(model.settings.pipeline_jobFolder, model.pipeline.cancelledFolder, name))) {
                updateJob(item, { state: SpeakerRenderState.Cancelled, saved: false });

            } else if (item.render.saved) {
                // Lost job file!
                updateJob(item, { state: undefined, saved: false });
            }
        } else {

            const name_noext = path.basename(item.render.job_path, "json");

            let processor: string | undefined;

            for (const file of allFiles) {
                if (file == name || file.indexOf(name_noext) != 0) continue;

                // Found alive file
                const match = file.match(PROCESSOR_REG);
                processor = match ? match[1] : undefined;

                break;
            }

            updateJob(item, { state: SpeakerRenderState.Rendering, processor });

        }
    }

}*/

export default {
    setup,
};
