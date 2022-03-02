import { call2 } from "./rest";
import model from "../model";
import { ProjectMeta } from "@/model/project";

export function setup(): void {
  loadMeta();
}
let lastRes: string | undefined;
function loadMeta() {
  call2<ProjectMeta>("ProjectTools.getMeta", [])
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

export default {
  setup,
};
