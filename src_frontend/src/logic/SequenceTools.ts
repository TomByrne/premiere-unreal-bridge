import { call, callDetail } from "./rest";
import model from "../model";
import { ReadinessState, SequenceMeta, SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import path from "path";
import md5 from "md5";
import mitt from "mitt";

type Events = {
    removeSpeakerItem: SpeakerItem;
};
export const emitter = mitt<Events>();

export function addSpeakerItem(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const dir = model.project.getProjectDir();
        if (!dir || !model.project.meta || !model.sequence.sequenceMeta) {
            reject("Project or sequence not found");
            return;
        }
        const itemHash = md5(model.project.meta.id + "_" + model.sequence.sequenceMeta.id + "_" + id).substring(0, 8);
        const render_path = path.join(dir, `ue_renders/item_${itemHash}`);
        const item: SpeakerItem = {
            id,
            config: {
                state: ReadinessState.NotReady,
            },
            slots: {},
            render: {
                state: SpeakerRenderState.none,
                saved: false,
                job_path: undefined,
                render_path: render_path,
                job: undefined,
            },
            import: {
                state: ReadinessState.NotReady,
            }
        }
        const prom = call<boolean>("SequenceTools.addSpeakerItem", [item]);
        prom.catch(reject);
        prom.then(resolve);
    });
}
export function removeSpeakerItem(id: string): Promise<boolean> {
    const item = model.sequence.findSpeakerItem(id);
    if (item) {
        emitter.emit("removeSpeakerItem", item);
    }
    return call("SequenceTools.removeSpeakerItem", [id]);
}
export function updateSpeakerItem(item: SpeakerItem): Promise<boolean> {
    if(itemsToSend.length) itemsToSend = itemsToSend.filter((i) => i.id != item.id);
    return call("SequenceTools.updateSpeakerItem", [item]);
}
export function selectTrackItem(id: string): Promise<boolean> {
    return call("SequenceTools.selectTrackItem", [id]);
}
export function importSpeakerRender(id: string): Promise<boolean> {
    return call("SequenceTools.importSpeakerRender", [id]);
}
export function clearMeta(): Promise<boolean> {
    return call("SequenceTools.clearMeta", []);
}

let itemTimer: NodeJS.Timeout | undefined;
let itemsToSend: SpeakerItem[] = [];
export function updateSpeakerItemSoon(item: SpeakerItem): void {
    itemsToSend = itemsToSend.filter((i) => i.id != item.id);
    itemsToSend.push(item);
    if(!itemTimer) {
        itemTimer = setTimeout(() => sendItemUpdates(), 1000);
    }
}

function sendItemUpdates(){
    if(itemTimer) {
        clearTimeout(itemTimer);
        itemTimer = undefined;
    }

    if(itemsToSend.length) {
        call("SequenceTools.updateSpeakerItems", [itemsToSend]);
        itemsToSend = [];
    }
}

let watching = false;
let timerId: NodeJS.Timeout | undefined;
export function setup(): void {
    if (watching) return;
    watching = true;
    loadMeta();
}
let lastRes: string | undefined;
function loadMeta() {
    callDetail<SequenceMeta>("SequenceTools.getMeta", [true], {outputScript:false})
        .then((resp) => {
            if (lastRes != resp.str) {
                lastRes = resp.str;
                console.log("Sequence Metadata: ", resp.parsed);
                model.sequence.sequenceMeta = resp.parsed;
            }
            timerId = setTimeout(() => loadMeta(), 500);
        })
        .catch((e) => {
            console.warn("Failed to load sequence meta: ", e);
            timerId = setTimeout(() => loadMeta(), 1500);
        });
}
export function stopWatchingMeta(): void {
    if (!watching) return;
    watching = false;
    if (timerId) {
        clearInterval(timerId);
        timerId = undefined;
    }

}

export default {
    emitter,
    setup,
    stopWatchingMeta,
    addSpeakerItem,
    removeSpeakerItem,
    updateSpeakerItem,
    updateSpeakerItemSoon,
    selectTrackItem,
    importSpeakerRender,
    clearMeta,
};
