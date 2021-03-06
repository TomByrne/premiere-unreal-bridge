import { call, callDetail } from "./rest";
import model from "../model";
import { ProjectMeta } from "@/model/project";

export function setup(): void {
  loadMeta();

  // call("ReflectTools.reflectEval", ["app.project.activeSequence.videoTracks[0]", 2]).then((description) => {
  //   console.log("description: ", description);
  // }).catch(() => {
  //   console.error("Describe failed");
  // });
}
let lastRes: string | undefined;
function loadMeta() {
  callDetail<ProjectMeta>("ProjectTools.getMeta", [])
    .then((resp) => {
      if(lastRes != resp.str) {
        lastRes = resp.str;
        console.log("Project Metadata: ", resp.parsed);
        model.project.meta = resp.parsed;
      }
    })
    .catch((e) => {
      console.warn("Failed to load project meta: ", e);
    });
}

export function save(): Promise<boolean> {
  return call("ProjectTools.save");
}

export default {
  save,
  setup,
};
