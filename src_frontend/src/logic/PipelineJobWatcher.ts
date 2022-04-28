import model from "@/model";
import fs from "fs";
import path from "path";
import { SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";

const PROCESSOR_REG = /\[ (.*?) \]/;
// const SECS_REG = / (\d+)s( |$)/;
// const FRAMES_REG = / (\d+)f( |$)/;

/**
 * This class watches running job files and updates the model with
 * progress info.
 */
export function setup(): void {
    setInterval(() => checkJobs(), 500);
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

function checkJobs() {
    const meta = model.sequence.sequenceMeta;
    if (!meta || !fs.existsSync(model.settings.pipeline_jobFolder)) return;

    const allFiles = fs.readdirSync(model.settings.pipeline_jobFolder);

    for (const i in meta.speaker_items) {
        const item = meta.speaker_items[i];
        if (!item.render.job_path) continue;

        if (item.render.job && item.render.render_path && fs.existsSync(item.render.render_path)) {
            const start = item.render.job.start_frame || 0;
            const images = fs.readdirSync(item.render.render_path);
            for (const image of images) {
                const frame = (parseInt(image) - start).toString().padStart(6, "0");
                const imgPath = path.join(item.render.render_path, image);
                const destPath = path.join(item.import.asset_path, `frame_${frame}.jpg`);
                fs.copyFileSync(imgPath, destPath);
                fs.unlinkSync(imgPath);
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

}

export default {
    setup,
};
