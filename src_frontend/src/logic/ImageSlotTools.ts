import { SlotRender, SpeakerItem } from "@/model/sequence";
import { call } from "./rest";
import fs from "fs";
import path from "path";
import SequenceTools from "./SequenceTools";


const csInterface = new CSInterface();

function resolveExtFile(file: string): string {
    const root = csInterface.getSystemPath(SystemPath.EXTENSION);
    return path.normalize(root + file);
}

export function exportSpeakerItem(id: string): Promise<boolean> {
    const epr = resolveExtFile("/epr/png_export_4k.epr");
    const ret = call<boolean>("ImageSlotTools.exportSpeakerItem", [id, epr]);
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

export function needsSlotRender(speaker: SpeakerItem, slot:SlotRender): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!speaker.config.img_slot) return false;

        const dest = speakerItemDest(speaker, false);
        if (!dest) return false;
        else if (!fs.existsSync(dest)) return true;

        // const pngs = glob.sync(`${dest}/*.png`, {nodir:true});//dest.getFiles("*.png");
        // TODO: Check files within range match expectations (e.g. dimensions)
        // return pngs.length == 0;
        fs.readdir(dest, (e, files) => {
            if(e){
                reject(e);
            } else {
                const pngs = files.filter((f) => f.indexOf(".png") == f.length - 4);
                resolve(pngs.length == slot.duration);
            }
        });
    });
}

export default {
    exportSpeakerItem,
    needsSlotRender,
};
