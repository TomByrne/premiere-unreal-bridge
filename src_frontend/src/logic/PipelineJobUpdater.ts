import { watch } from "vue";
import model from "@/model";
import PipelineTools from "@/logic/PipelineTools";
import { Job, JobInfoState } from "@/model/pipeline";
import path from "path";

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

function lastPart(file:string): string{
    return path.basename(file);
}

export function checkJobs():void {
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
        checkItem(speaker.id);
    }
}

function fileToAsset(file: string): string {
    const ext = path.extname(file);
    file = file.substring(0, file.length - ext.length);
    return "/" + file.replaceAll("\\", "/")
}

export function checkItem(id:string): boolean {
    const speaker = model.sequence.findSpeakerItem(id);
    if(!speaker) return false;

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
        return false;
    }

    const newJob:Job = {
        cmd: "cmd_4.27",
        project: speaker.project,
        scene: fileToAsset(speaker.scene),
        sequence: fileToAsset(speaker.sequence),
        render_settings: "4.27_RenderQueueSettings_rushes_quick_v3",
        output: speaker.render_path,
        output_format: "frame_{frame_number}"
    }

    let jobPath;
    if(job){
        // Job already started, see if needs updating
        if(job.saved && job.state != JobInfoState.failed && objEqual(job.job, newJob)) {
            // Job hasn't changed, skip
            return false;
        }
        job.job = newJob;
        job.saved = false;
        model.pipeline.jobs = {
            ...model.pipeline.jobs, // force updates
        }
        jobPath = job.path;
    } else{
        // New job
        jobPath = PipelineTools.resolveJobPath(`${speaker.id}_${projDetails.name}_${lastPart(speaker.scene)}_${lastPart(speaker.sequence)}`, true);
        job = {
            state: undefined,
            job: newJob,
            path: jobPath,
            saved: false
        }
        model.pipeline.jobs = {
            ...model.pipeline.jobs,
            [speaker.id]: job
        }
    }

    return true;
}

export function beginJob(id: string): boolean {
    const job = model.pipeline.jobs[id];
    if(job && job.path && job.job) {
        job.saved = true;
        job.state = undefined;
        PipelineTools.writeJob(job.path, job.job);
        return true;
    }else{
        console.warn("Couldn't start job: ", id, job);
        return false;
    }
}

export default {
    checkItem,
    beginJob,
    setup,
};
