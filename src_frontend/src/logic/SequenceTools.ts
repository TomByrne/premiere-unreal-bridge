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

export function findSpeakerItem(id: string): SpeakerItem | undefined {
    const meta = model.sequence.sequenceMeta;
    if (!meta) return;

    for (const item of meta.speaker_items) {
        if (item.id == id) return item;
    }
}

export function addSpeakerItem(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const dir = model.project.getProjectDir();
        if (!dir || !model.project.meta || !model.sequence.sequenceMeta) {
            reject("Project or sequence not found");
            return;
        }
        const itemHash = md5(model.project.meta.id + "_" + model.sequence.sequenceMeta.id + "_" + id).substring(0, 8);
        const asset_path = path.join(dir, `ue_renders/item_${itemHash}`);
        const item: SpeakerItem = {
            id,
            config: {
                state: ReadinessState.NotReady,
            },
            slots: {},
            render: {
                state: undefined,
                saved: false,
                job_path: undefined,
                render_path: undefined,
                job: undefined,
            },
            import: {
                state: ReadinessState.NotReady,
                asset_path,
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
let updating: SpeakerItem[] = [];
export function updateSpeakerItem(item: SpeakerItem): Promise<boolean> {
    if(itemsToSend.length) itemsToSend = itemsToSend.filter((i) => i.id != item.id);
    if(updating.length) updating = updating.filter((i) => i.id != item.id);
    updating.push(item);
    const ret = call<boolean>("SequenceTools.updateSpeakerItem", [item]);
    ret.finally(() => {
        updating = updating.filter((i) => i != item);
    });

    return ret;
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
        const items = itemsToSend;
        for(const item of items){
            if(updating.length) updating = updating.filter((i) => i.id != item.id);
            updating.push(item);
        }
        const ret = call("SequenceTools.updateSpeakerItems", [items]);
        ret.finally(() => {
            updating = updating.filter((i) => items.indexOf(i) == -1);
        });
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
function updateMetaItems(meta:SequenceMeta, items:SpeakerItem[]) {
    for(let i=0; i<items.length; i++){
        const item = items[i];
        const itemInd = meta.speaker_items.findIndex(i => i.id == item.id);
        if(itemInd == -1) meta.speaker_items.push(item);
        else meta.speaker_items[itemInd] = item;
    }
}
let lastRes: string | undefined;
export function loadMeta(): void {
    clearMetaTimer();
    callDetail<SequenceMeta>("SequenceTools.getMeta", [true], {outputScript:false})
        .then((resp) => {
            if (lastRes != resp.str) {
                lastRes = resp.str;
                console.log("Sequence Metadata: ", resp.parsed);

                const meta = resp.parsed;
                // Need to update with any pending speaker item changes
                updateMetaItems(meta, updating);
                updateMetaItems(meta, itemsToSend);
                model.sequence.sequenceMeta = meta;
            }
            timerId = setTimeout(() => {
                timerId = undefined;
                loadMeta();
            }, 500);
        })
        .catch((e) => {
            console.warn("Failed to load sequence meta: ", e);
            timerId = setTimeout(() => {
                timerId = undefined;
                loadMeta();
            }, 1500);
        });
}
export function stopWatchingMeta(): void {
    if (!watching) return;
    watching = false;
    clearMetaTimer();
}

function clearMetaTimer(){
    if (timerId) {
        clearInterval(timerId);
        timerId = undefined;
    }
}

export default {
    emitter,
    setup,
    stopWatchingMeta,
    findSpeakerItem,
    addSpeakerItem,
    removeSpeakerItem,
    updateSpeakerItem,
    updateSpeakerItemSoon,
    selectTrackItem,
    importSpeakerRender,
    clearMeta,
    loadMeta,
};
