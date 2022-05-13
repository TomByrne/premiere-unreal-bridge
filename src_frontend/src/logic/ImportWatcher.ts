import model from "@/model";
import fs from "fs";
import { ReadinessState, SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";

export function setup(): void {
    checkJobsSoon();
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

function checkJobsSoon(secs = 2){
    setTimeout(() => checkJobs(), secs * 1000);
}

function checkJobs() {
    const meta = model.sequence.sequenceMeta;
    if (!meta){
        checkJobsSoon();
        return;
    }
    
    // Run sequentially
    const starterPromise = Promise.resolve(null);
    meta.speaker_items.reduce(
        (p, item) => p.then(() => checkJob(item).then()),
        starterPromise
    )
    .finally(() => {
        checkJobsSoon();
    });
}

async function checkJob(item:SpeakerItem): Promise<void> {
    try {
        let files = await fs.promises.readdir(item.import.asset_path);
        files = files.filter((f) => f.lastIndexOf('.jpg') == f.length - 4);

        if (files && (item.render.total && files.length == item.render.total) || (files.length && item.render.state == SpeakerRenderState.Done)) {
            updateJob(item, { state: ReadinessState.Ready });
        } else {
            updateJob(item, { state: ReadinessState.NotReady });
        }

    } catch(e) {
        updateJob(item, { state: ReadinessState.NotReady });
    }
}

export default {
    setup,
};
