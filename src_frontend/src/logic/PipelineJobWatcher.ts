import model from "@/model";
import fs from "fs";
import path from "path";
import { SpeakerItem, SpeakerRenderState } from "@/model/sequence";

/**
 * This class watches running job files and updates the model with
 * progress info.
 */
export function setup(): void {
    setInterval(() => checkJobs(), 500);
}

function updateJob(item:SpeakerItem, state:SpeakerRenderState, saved: boolean | undefined = false) {
    item.render.state = state;
    if(saved != undefined) item.render.saved = saved;
}

function checkJobs(){
    const meta = model.sequence.sequenceMeta;
    if(!meta) return;
    for(const i in meta.speaker_items) {
        const item = meta.speaker_items[i];
        if(!item.render.job_path) continue;

        const exists = fs.existsSync(item.render.job_path);

        if( item.render.state == SpeakerRenderState.done ||
            item.render.state == SpeakerRenderState.failed ||
            item.render.state == SpeakerRenderState.cancelled) continue;

        if(!exists) {
            const name = path.basename(item.render.job_path);
            if(fs.existsSync(path.join(model.pipeline.jobFolder_done, name))) {
                updateJob(item, SpeakerRenderState.done);

            } else if(fs.existsSync(path.join(model.pipeline.jobFolder_failed, name))){
                updateJob(item, SpeakerRenderState.failed);
                
            } else if(fs.existsSync(path.join(model.pipeline.jobFolder_cancelled, name))){
                updateJob(item, SpeakerRenderState.cancelled);
                
            } else if(item.render.saved) {
                // Lost job file!
                updateJob(item, SpeakerRenderState.none);
            }
        } else {
            //TODO: check for alive file here
            updateJob(item, SpeakerRenderState.doing, undefined);
        }
    }

}

export default {
    setup,
};
