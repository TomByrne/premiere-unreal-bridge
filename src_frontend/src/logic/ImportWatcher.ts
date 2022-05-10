import model from "@/model";
import fs from "fs";
import path from "path";
import { ReadinessState, SpeakerItem } from "@/model/sequence";
import SequenceTools from "./SequenceTools";
import glob from "glob";

export function setup(): void {
    setInterval(() => checkJobs(), 500);
}

function updateJob(item: SpeakerItem, updates: Record<string, unknown>) {
    let changes = false;
    for (const i in updates) {
        const val = updates[i];
        if (Reflect.get(item.import, i) != val) {
            Reflect.set(item.import, i, val);
            changes = true;
        }
    }

    if (changes) {
        SequenceTools.updateSpeakerItemSoon(item);
    }
}

function checkJobs() {
    const meta = model.sequence.sequenceMeta;
    if (!meta || !fs.existsSync(model.settings.pipeline_jobFolder)) return;

    const allFiles = fs.readdirSync(model.settings.pipeline_jobFolder);

    for (const i in meta.speaker_items) {
        const item = meta.speaker_items[i];

        if (!fs.existsSync(item.import.asset_path)) {
            updateJob(item, { state: ReadinessState.NotReady });
        } else {
            const files = glob.sync(item.import.asset_path + "/*.jpg", { nodir: true });
            if (files.length == item.render.total) {
                updateJob(item, { state: ReadinessState.Ready });
            } else {
                updateJob(item, { state: ReadinessState.NotReady });
            }
        }

    }

}

export default {
    setup,
};
