import { watch } from "vue";
import model from "@/model";
import PipelineTools from "@/logic/PipelineTools";
import { Job, JobInfoState } from "@/model/pipeline";

/**
 * This class CRUDs pipeline jobs based on the configured data
 * in the model.
 */
export function setup(): void {
    watch(
        () => [model.sequence.sequenceMeta, model.unreal.projectDetails],
        () => {
          checkJobs();
        },
        { immediate: true }
      );
}

function objEqual<R>(o1:R, o2:R): boolean{
    let k: keyof typeof o1;
    for(k in o1){
        if(o1[k] !== o2[k]){
            return false;
        }
    }
    return true;
};

function lastPart(path:string): string{
    return path.substring(path.lastIndexOf("/") + 1);
}

function checkJobs(){
    const meta = model.sequence.sequenceMeta;
    if(!meta) {
        //TODO: clear all
        return;
    }

    //Remove any old jobs which no longer have a related speaker item
    for(const id in model.pipeline.jobs) {
        const speaker = model.sequence.findSpeakerItem(id);
        if(speaker) continue; // Still a valid job

        const job = model.pipeline.jobs[id];
        delete model.pipeline.jobs[id];
        PipelineTools.deleteJob(job.path);
    }

    for(const speaker of meta.speaker_items) {
        let job = model.pipeline.jobs[speaker.id];
        const track = model.sequence.findTrackItem(speaker.id);
        const projDetails = speaker.project ? model.unreal.findProjectDetails(speaker.project) : undefined;

        if( !track ||
            !projDetails ||
            !speaker.project ||
            !speaker.scene ||
            !speaker.sequence) {

            if(job){
                PipelineTools.deleteJob(job.path);
                delete model.pipeline.jobs[speaker.id];
            }
            continue;
        }

        const newJob:Job = {
            cmd: "cmd_4.27",
            project: speaker.project,
            scene: speaker.scene,
            sequence: speaker.sequence,
            render_settings: "4.27_RenderQueueSettings_rushes_quick_v3",
        }

        if(job){
            // Job already started, see if needs updating
            if(objEqual(job.job, newJob)) {
                // Job hasn't changed, skip
                continue;
            }
            job.job = newJob;
            job.state = JobInfoState.pending;
            model.pipeline.jobs = {
                ...model.pipeline.jobs, // force updates
            }
            PipelineTools.writeJob(job.path, newJob);
        } else{
            // New job
            const path = PipelineTools.resolveJobPath(`${speaker.id}_${projDetails.name}_${lastPart(speaker.scene)}_${lastPart(speaker.sequence)}`);
            job = {
                state: JobInfoState.pending,
                job: newJob,
                path: path
            }
            model.pipeline.jobs = {
                ...model.pipeline.jobs,
                [speaker.id]: job
            }
            PipelineTools.writeJob(path, newJob);
        }
    }
}

export default {
    setup,
};
