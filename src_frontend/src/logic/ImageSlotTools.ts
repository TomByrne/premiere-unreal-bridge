import { SlotRender, SpeakerItem } from "@/model/sequence";
import { call } from "./rest";
import fs from "fs";
import path from "path";
import SequenceTools from "./SequenceTools";
import csInterface from "../utils/CSInt";


function resolveExtFile(file: string): string {
    const root = csInterface.getSystemPath(SystemPath.EXTENSION);
    return path.normalize(root + file);
}

export function checkSpeakerItem(id: string): Promise<boolean> {
    const ret = call<boolean>("ImageSlotTools.checkSpeakerItem", [id]);
    ret.then((success) => {
        if(success) SequenceTools.loadMeta();
    });
    return ret;
}

export function exportSpeakerItem(id: string): Promise<boolean> {
    const epr = resolveExtFile("/epr/png_export_4k.epr");
    const ret = call<boolean>("ImageSlotTools.exportSpeakerItem", [id, epr]);
    ret.then((success) => {
        if(success) SequenceTools.loadMeta();
    });
    return ret;
}

// This exists in the backend also!!
export function speakerItemDest(speaker: SpeakerItem, slot:SlotRender, checkExists = true): string | undefined {
    const slotPath = slot.dest;
    if (!slotPath) {
        console.error("No image slot selected for this speaker item.");
        return;
    }

    const destPath = `${speaker.config.project}/Content/${slotPath}`;
    if (checkExists && !fs.existsSync(destPath)) {
        console.error("Destination folder doesn't exist: ", destPath);
        return;
    }

    return destPath;
}

export default {
    checkSpeakerItem,
    exportSpeakerItem,
    speakerItemDest,
};
