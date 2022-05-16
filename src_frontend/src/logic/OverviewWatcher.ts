import model from "@/model";
import { SpeakerItemOverview, SpeakerItemStep } from "@/model/overview";
import { SlotRenderState, SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import { UnrealProjectDetail } from "@/UnrealProject";
import { watch } from "vue";

/**
 * This class watches all jobs and populates the overview model
 * with what remains to be done on this sequence.
 */
export function setup(): void {
    watch(
        () => checkJobsSoon(),
        () => [model.sequence.sequenceMeta?.speaker_items],
        {immediate:true}
    );
}

function checkJobsSoon(secs = 1) {
    setTimeout(() => checkJobs(), secs * 1000);
}


function checkJobs() {
    const meta = model.sequence.sequenceMeta;
    if (!meta) return;

    let nextItem:SpeakerItemOverview | undefined;
    let progress = 0;
    let total = 0;
    const items: SpeakerItemOverview[] = [];
    for(const item of meta.speaker_items) {
        
        const hasSlots = getHasSlots(item);

        const needsConfig_project = getNeedsProject(item);
        const needsConfig_scene = getNeedsScene(item);
        const needsConfig_seqeunce = getNeedsSequence(item);
        const needsConfig_slots = hasSlots && getNeedsSlot(item);
        const needsConfig = (needsConfig_project || needsConfig_scene || needsConfig_seqeunce || needsConfig_slots);

        const slotRender = item?.slots[item.id];

        const slotsDone = !needsConfig && slotRender?.state == SlotRenderState.Complete;
        const renderDone = (!hasSlots || slotsDone) && item.render.state == SpeakerRenderState.Done;
        const importDone = renderDone && !!item.import.render_track_item;

        total += 3;
        progress += (slotsDone ? 1 : 0) + (renderDone ? 1 : 0) + (importDone ? 1 : 0);
        

        const overview: SpeakerItemOverview = {
            id: item.id,

            needsConfig,
            needsConfig_project,
            needsConfig_scene,
            needsConfig_seqeunce,
            needsConfig_slots,

            [SpeakerItemStep.SLOTS]: slotsDone,
            [SpeakerItemStep.RENDER]: renderDone,
            [SpeakerItemStep.IMPORT]: importDone,
          
            nextStep: (!slotsDone ? SpeakerItemStep.SLOTS : (!renderDone ? SpeakerItemStep.RENDER : (!importDone ? SpeakerItemStep.IMPORT : undefined))),
        }
        items.push(overview);

        const allDone = (!needsConfig && slotsDone && renderDone && importDone);
        if(!nextItem && !allDone) nextItem = overview;
    }

    model.overview.items = items;
    model.overview.nextItem = nextItem;
    model.overview.progress = progress;
    model.overview.total = total;
}



function getUeProjectDetail(item:SpeakerItem): UnrealProjectDetail | undefined {
    const dir = item?.config.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }

function getHasSlots(item:SpeakerItem): boolean {
    const slots = getUeProjectDetail(item)?.imgSlots;
    return slots ? slots.length > 0 : false;
  }
    
function getNeedsProject(item:SpeakerItem): boolean {
    return !item?.config.project;
}
function getNeedsScene(item:SpeakerItem): boolean {
    return !item?.config.scene;
}
function getNeedsSequence(item:SpeakerItem): boolean {
    return !item?.config.sequence;
}
function getNeedsSlot(item:SpeakerItem): boolean {
    return !item?.config.img_slot;
}

export default {
    setup,
};
