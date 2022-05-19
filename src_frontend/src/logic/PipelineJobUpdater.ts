import { watch } from "vue";
import model from "@/model";
import PipelineTools from "@/logic/PipelineTools";
import path from "path";
import { PipelineJob, SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";
import Fs from "@/utils/Fs";
import fs from "fs";

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

function clearJobFile(item:SpeakerItem):void {
    if(!item.render.job_path) return;
        PipelineTools.deleteJob(item.render.job_path);
    }
    
export function killJob(id: string, save = true):void {
    const item = model.sequence.findSpeakerItem(id);
    if(!item) return;

    clearJobFile(item);
    item.render.saved = false;
    item.render.state = SpeakerRenderState.Cancelled;

    if(save) SequenceTools.updateSpeakerItem(item);
}

function objEqual<R>(o1:R, o2:R): boolean {
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

    const start = Math.max(0, Math.round((track.start + speaker.config.ue_time_offset) * fps));
    const end = Math.round(start + ((track.end - track.start) * fps));

    const newJob:PipelineJob = {
        cmd: model.settings.pipeline_cmd,
        project: speaker.config.project,
        scene: fileToAsset(speaker.config.scene),
        sequence: fileToAsset(speaker.config.sequence),
        render_settings: model.settings.pipeline_settings,
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
        if(job.output && fs.existsSync(job.output)) {
            // Clear existing output files
            const files = fs.readdirSync(job.output);
            for(const file of files){
                const filepath = path.join(job.output, file);
                try {
                    fs.rmSync(filepath);
                }catch(e) {
                    console.warn("Failed to delete existing render file: ", filepath, e);
                }
            }
        }

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
