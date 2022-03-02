import { UnrealProject, UnrealProjectDetail } from "@/UnrealProject";
import { call } from "./rest";
import model from "../model";

const type = "UnrealProjectTools";

export function listProjects(): Promise<UnrealProject[]> {
  return call(`${type}.listProjects`);
}

export function getProjectDetails(
  dir: string
): Promise<UnrealProjectDetail | undefined> {
  console.debug(`Loading project details`, dir);
  model.unreal.loadingProjectDetails.value = true;
  const start = Date.now();
  const ret: Promise<UnrealProjectDetail | undefined> = call(
    `${type}.getProjectDetails`,
    [dir, model.unreal.searchProjFolders.value]
  );
  ret.finally(() => {
    const dur = (Date.now() - start) / 1000;
    if(dur > 2) console.warn(`Loading project details took ${dur.toFixed(1)}s`, dir);
    else console.log(`Loading project details took ${dur.toFixed(1)}s`, dir);
    model.unreal.loadingProjectDetails.value = false;
  });
  return ret;
}

export default {
  listProjects,
  getProjectDetails,
};
