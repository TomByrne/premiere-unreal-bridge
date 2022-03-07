import { watch } from "vue";
import model from "@/model";
import fs from "fs";
import path from "path";
import { JobInfo, JobInfoState } from "@/model/pipeline";

/**
 * This class watches running job files and updates the model with
 * progress info.
 */
export function setup(): void {
    setInterval(() => checkJobs(), 500);
}

function updateJob(job:JobInfo, state:JobInfoState | undefined, saved: boolean | undefined = false) {
    job.state = state;
    if(saved != undefined) job.saved = saved;
}

function checkJobs(){
    for(const id in model.pipeline.jobs) {
        const job = model.pipeline.jobs[id];
        const exists = fs.existsSync(job.path);

        if( job.state == JobInfoState.done ||
            job.state == JobInfoState.failed ||
            job.state == JobInfoState.cancelled) continue;

        if(!exists) {
            const name = path.basename(job.path);
            if(fs.existsSync(path.join(model.pipeline.jobFolder_done, name))) {
                updateJob(job, JobInfoState.done);

            } else if(fs.existsSync(path.join(model.pipeline.jobFolder_failed, name))){
                updateJob(job, JobInfoState.failed);
                
            } else if(fs.existsSync(path.join(model.pipeline.jobFolder_cancelled, name))){
                updateJob(job, JobInfoState.cancelled);
                
            } else if(job.saved) {
                // Lost job file!
                updateJob(job, undefined);
            }
        } else {
            //TODO: check for alive file here
            updateJob(job, JobInfoState.doing, undefined);
        }
    }

}

export default {
    setup,
};
