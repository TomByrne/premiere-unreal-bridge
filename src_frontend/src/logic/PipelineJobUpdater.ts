import { watch } from "vue";
import model from "@/model";
import PipelineTools from "@/logic/PipelineTools";
import path from "path";
import { PipelineJob, SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";
import Fs from "@/utils/Fs";

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
        killJob(item.id, false);
    });
}

function clearJobFile(item:SpeakerItem){
    if(!item.render.job_path) return;
        PipelineTools.deleteJob(item.render.job_path);
        item.render.job_path = undefined;
    }
    
export function killJob(id: string, save = true) {
    const item = model.sequence.findSpeakerItem(id);
    if(!item) return;

    clearJobFile(item);
    if(item.render.job_path){
        PipelineTools.deleteJob(item.render.job_path);
        item.render.job_path = undefined;
    }
    item.render.saved = false;
    item.render.job = undefined;
    item.render.state = undefined;

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

function lastPart(file:string, ext?:string): string{
    return path.basename(file, ext);
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

export async function checkItem(id:string): Promise<boolean> {
    const speaker = model.sequence.findSpeakerItem(id);
    if(!speaker) return false;

    const track = model.sequence.findTrackItem(speaker.id);
    const projDetails = speaker.config.project ? model.unreal.findProjectDetails(speaker.config.project) : undefined;

    if(!projDetails && speaker.config.project && model.unreal.findProject(speaker.config.project)) {
        return false;
    }

    if( !track ||
        !projDetails ||
        !speaker.config.project ||
        !speaker.config.scene ||
        !speaker.config.sequence) {

        killJob(speaker.id);
        return false;
    }
    
    const fps = 30; // also hard-coded into epr file

    const start = Math.round(track.start * fps);
    const end = Math.round(track.end * fps);

    const newJob:PipelineJob = {
        cmd: "cmd_4.27",
        project: speaker.config.project,
        scene: fileToAsset(speaker.config.scene),
        sequence: fileToAsset(speaker.config.sequence),
        render_settings: "4.27_RenderQueueSettings_rushes_quick_v3",
        output: speaker.config.project + "/Saved/PipelineRenders/" + speaker.id,
        output_format: "{frame_number}",
        start_frame: start,
        end_frame: end,
    }

    let jobPath;
    if(speaker.render.job){
        // Job already started, see if needs updating
        if(objEqual(speaker.render.job, newJob)) {
            // Job hasn't changed, skip
            return false;
        }
        speaker.render.job = newJob;
        speaker.render.saved = false;
        if(speaker.render.job_path && await Fs.exists(speaker.render.job_path)) jobPath = speaker.render.job_path;
    } else{
        // New job
        speaker.render.state = SpeakerRenderState.Pending;
        speaker.render.saved = false;
        speaker.render.job = newJob;
    }
    if(!jobPath){
        const rid = Math.round(Math.random() * 10000)
        jobPath = PipelineTools.resolveJobPath(`${speaker.id}_${rid}_${projDetails.name}_${lastPart(speaker.config.scene, ".umap")}_${lastPart(speaker.config.sequence, ".uasset")}`, true);
    }
    clearJobFile(speaker);
    speaker.render.job_path = jobPath;

    SequenceTools.updateSpeakerItem(speaker);

    return true;
}

export function beginJob(id: string): boolean {
    const item = model.sequence.findSpeakerItem(id);
    if(item && item.render.job_path && item.render.job) {
        item.render.invalid = false;

        const job = item.render.job;
        item.render.saved = true;
        item.render.state = SpeakerRenderState.Pending;
        item.render.render_path = job.output;
        item.render.total = (job.end_frame || 0) - (job.start_frame || 0);
        item.render.frames = 0;
        PipelineTools.writeJob(item.render.job_path, job);
    
        item.import.invalid = true;
        SequenceTools.updateSpeakerItem(item);

        return true;
    }else{
        console.warn("Couldn't start job: ", id, item);
        return false;
    }
}

export default {
    killJob,
    checkItem,
    beginJob,
    setup,
};
