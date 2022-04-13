import { SpeakerItem } from "@/model/sequence";
import { call } from "./rest";
import fs from "fs";
import glob from "glob";
import SequenceTools, { findSpeakerItem } from "./SequenceTools";

export function exportSpeakerItem(id: string): Promise<boolean> {
    const ret = call<boolean>("ImageSlotTools.exportSpeakerItem", [id]);
    ret.then((success) => {
        if(success) SequenceTools.loadMeta();
    });
    return ret;
}

// export function needsSlotRender(id: string): Promise<boolean> {
//     return call("ImageSlotTools.needsSlotRender", [id]);
// }

// This exists in the backend also!!
function speakerItemDest(speaker: SpeakerItem, checkExists = true): string | undefined {
    if (!speaker.config.img_slot) {
        console.error("No image slot selected for this speaker item.");
        return;
    }

    const destPath = `${speaker.config.project}/Content/${speaker.config.img_slot}`;
    if (checkExists && !fs.existsSync(destPath)) {
        console.error("Destination folder doesn't exist: ", destPath);
        return;
    }

    return destPath;
}

export function needsSlotRender(id: string): boolean {
    const speaker = SequenceTools.findSpeakerItem(id);
    if (!speaker?.config.img_slot) return false;

    const dest = speakerItemDest(speaker, false);
    if (!dest) return false;
    else if (!fs.existsSync(dest)) return true;

    const pngs = glob.sync(`${dest}/*.png`, {nodir:true});//dest.getFiles("*.png");
    // TODO: Check files within range match expectations (e.g. dimensions)
    return pngs.length == 0;
}

export default {
    exportSpeakerItem,
    needsSlotRender,
};
