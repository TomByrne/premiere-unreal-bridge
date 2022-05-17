import model from "@/model";
import ImageSlotTools from "./ImageSlotTools";
import PipelineJobUpdater from "./PipelineJobUpdater";
import PipelineJobWatcher from "./PipelineJobWatcher";
import SlotRenderWatcher from "./SlotRenderWatcher";
import SequenceTools from "./SequenceTools";

let awaitingRender = false;
let awaitingSlots = false;

// Stop running if sequence changes
SequenceTools.emitter.on("sequenceChanged", () => stop());

export function run(): void {
    if(model.overview.running_all) return;
    model.overview.running_all = true;
    runNext();
}
export function stop(): void {
    if(!model.overview.running_all) return;
    model.overview.running_all = false;
    awaitingRender = false;
    awaitingSlots = false;
}

SlotRenderWatcher.emitter.on("renderStopped", () => {
    if(awaitingSlots) {
        awaitingSlots = false;
        runNextSoon();
    }
});

PipelineJobWatcher.emitter.on("renderStopped", () => {
    if(awaitingRender) {
        awaitingRender = false;
        runNextSoon();
    }
});

function runNextSoon(secs = 1) {
    if(!model.overview.running_all) return;
    setTimeout(() => runNext(), secs * 1000);
}

function runNext(){
    const overview = model.overview.nextItem;
    if(!overview) {
        console.log("Overview run complete!");
        stop();
        return;
    }

    if(!overview.slots) {
        console.log("Overview rendering slots");
        awaitingSlots = true;
        ImageSlotTools.exportSpeakerItem(overview.id);

    } else if(!overview.render) {
        console.log("Overview rendering unreal");
        awaitingRender = true;
        PipelineJobUpdater.beginJob(overview.id);

    } else if(!overview.import) {
        console.log("Overview importing asset");
        SequenceTools.importSpeakerRender(overview.id, true)
        .finally(() => runNextSoon());
    }
}



export default {
    run,
    stop,
};
