import { watch } from "vue";
import model from "@/model";

/**
 * Checks the file system to update slot states.
 * Adds empty PNGs to sequences that need it.
 */
export function setup(): void {
    watch(
        () => [model.sequence.sequenceMeta],
        () => {
          checkJobs();
        },
        { immediate: true }
      );
}


function checkJobs(){
    

}

export default {
    setup,
};
