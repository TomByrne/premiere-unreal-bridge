import { call, callDetail } from "./rest";
import model from "../model";
import { ReadinessState, SequenceMeta, SpeakerImportState, SpeakerItem } from "@/model/sequence";
import path from "path";
import md5 from "md5";
import mitt from "mitt";

type Events = {
    sequenceChanged: number | undefined;
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
        // const item: SpeakerItem = {
        //     id,
        //     config: {
        //         state: ReadinessState.NotReady,
        //     },
        //     slots: {},
        //     render: {
        //         invalid: false,
        //         state: undefined,
        //         saved: false,
        //         job_path: undefined,
        //         render_path: undefined,
        //         job: undefined,
        //     },
        //     import: {
        //         invalid: false,
        //         state: SpeakerImportState.NotReady,
        //         asset_path,
        //     }
        // }
        const prom = call<boolean>("SequenceTools.addSpeakerItem", [id, asset_path]);
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
let updating: SpeakerItemUpdate[] = [];
export function updateSpeakerItem(item: SpeakerItem): void {
    if(!model.sequence.sequenceMeta) {
        console.error("Failed to schedule item update");
        return;
    }
    if(itemsToSend.length) itemsToSend = itemsToSend.filter((i) => i.item.id != item.id);
    if(updating.length) updating = updating.filter((i) => i.item.id != item.id);
    updating.push({
        seq: model.sequence.sequenceMeta.id,
        item,
    });
    const ret = call<boolean>("SequenceTools.updateSpeakerItem", [item]);
    ret.finally(() => {
        updating = updating.filter((i) => i.item != item);
    });

    return;
}
export function selectTrackItem(id: string): Promise<boolean> {
    return call("SequenceTools.selectTrackItem", [id]);
}
export function importSpeakerRender(id: string, addToSeq = false): Promise<boolean> {
    return call("SequenceTools.importSpeakerRender", [id, addToSeq]);
}
export function clearMeta(): Promise<boolean> {
    return call("SequenceTools.clearMeta", []);
}

interface  SpeakerItemUpdate {
    seq:number,
    item:SpeakerItem
}

let itemTimer: NodeJS.Timeout | undefined;
let itemsToSend: SpeakerItemUpdate[] = [];
export function updateSpeakerItemSoon(item: SpeakerItem): void {
    if(!model.sequence.sequenceMeta) {
        console.error("Failed to schedule item update");
        return;
    }
    itemsToSend = itemsToSend.filter((i) => i.item.id != item.id);
    itemsToSend.push({seq:model.sequence.sequenceMeta.id,  item});
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
            if(updating.length) updating = updating.filter((i) => i.item.id != item.item.id);
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
function updateMetaItems(meta:SequenceMeta, items:SpeakerItemUpdate[]) {
    for(let i=0; i<items.length; i++){
        const item = items[i];
        if(item.seq != meta.id) continue;

        const itemInd = meta.speaker_items.findIndex(i => i.id == item.item.id);
        if(itemInd == -1) meta.speaker_items.push(item.item);
        else meta.speaker_items[itemInd] = item.item;
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
                const diffSeq = (meta?.id != model.sequence.sequenceMeta?.id);

                // Need to update with any pending speaker item changes
                updateMetaItems(meta, updating);
                updateMetaItems(meta, itemsToSend);

                model.sequence.sequenceMeta = meta;

                if(diffSeq){
                    emitter.emit("sequenceChanged", meta?.id);
                }
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
