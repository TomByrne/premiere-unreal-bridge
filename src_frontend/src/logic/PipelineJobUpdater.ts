import { watch } from "vue";
import model from "@/model";
import PipelineTools from "@/logic/PipelineTools";
import path from "path";
import { PipelineJob, SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";

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

    SequenceTools.emitter.on("removeSpeakerItem", (item) => {
        killJob(item, false);
    });
}

function killJob(item:SpeakerItem, save = true) {
    if(item.render.job_path){
        PipelineTools.deleteJob(item.render.job_path);
        item.render.job_path = undefined;
    }
    item.render.job = undefined;
    item.render.state = SpeakerRenderState.none;

    if(save) SequenceTools.updateSpeakerItem(item);
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
    // for(const id in model.pipeline.jobs) {
    //     const speaker = model.sequence.findSpeakerItem(id);
    //     if(speaker) continue; // Still a valid job

    //     const job = model.pipeline.jobs[id];
    //     delete model.pipeline.jobs[id];
    //     PipelineTools.deleteJob(job.path);
    // }

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

    const track = model.sequence.findTrackItem(speaker.id);
    const projDetails = speaker.config.project ? model.unreal.findProjectDetails(speaker.config.project) : undefined;

    if( !track ||
        !projDetails ||
        !speaker.config.project ||
        !speaker.config.scene ||
        !speaker.config.sequence) {

        killJob(speaker);
        return false;
    }

    const newJob:PipelineJob = {
        cmd: "cmd_4.27",
        project: speaker.config.project,
        scene: fileToAsset(speaker.config.scene),
        sequence: fileToAsset(speaker.config.sequence),
        render_settings: "4.27_RenderQueueSettings_rushes_quick_v3",
        output: speaker.render.render_path,
        output_format: "frame_{frame_number}"
    }

    let jobPath;
    if(speaker.render.job){
        // Job already started, see if needs updating
        if(speaker.render.saved && speaker.render.state != SpeakerRenderState.failed && objEqual(speaker.render.job, newJob)) {
            // Job hasn't changed, skip
            return false;
        }
        speaker.render.job = newJob;
        speaker.render.saved = false;
        jobPath = speaker.render.job_path;
    } else{
        // New job
        jobPath = PipelineTools.resolveJobPath(`${speaker.id}_${projDetails.name}_${lastPart(speaker.config.scene)}_${lastPart(speaker.config.sequence)}`, true);
        speaker.render.state = SpeakerRenderState.pending;
        speaker.render.saved = false;
        speaker.render.job_path = jobPath;
        speaker.render.job = newJob;
    }

    SequenceTools.updateSpeakerItem(speaker);

    return true;
}

export function beginJob(id: string): boolean {
    const item = model.sequence.findSpeakerItem(id);
    if(item && item.render.job_path && item.render.job) {
        item.render.saved = true;
        item.render.state = SpeakerRenderState.pending;
        PipelineTools.writeJob(item.render.job_path, item.render.job);
        return true;
    }else{
        console.warn("Couldn't start job: ", id, item);
        return false;
    }
}

export default {
    checkItem,
    beginJob,
    setup,
};
