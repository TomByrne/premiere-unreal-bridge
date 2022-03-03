import { UnrealProject, UnrealProjectDetail } from "@/UnrealProject";
import { call } from "./rest";
import model from "../model";
import { watch } from "vue";

const type = "UnrealProjectTools";

export function setup(): void{
  loadProjects();

  watch(
      () => [model.sequence.sequenceMeta, model.unreal.loadingProjectDetails],
      () => {
        if(!model.unreal.loadingProjectDetails)
          checkJobs();
      },
      { immediate: true }
    );
}

function checkJobs(): void{
  const meta = model.sequence.sequenceMeta;
  if(!meta) {
      //TODO: clear all
      return;
  }

  for(const speaker of meta.speaker_items) {
    if(!speaker.project) continue;
    const details = model.unreal.findProjectDetails(speaker.project);
    if(details) continue;
    loadProjectDetails(speaker.project); 
    return;
  }
  // All loaded
}

export function loadProjects(): void {
  model.unreal.loadingProjects = true;
  call<UnrealProject[]>(`${type}.listProjects`)
    .then((projects: UnrealProject[]) => {
      model.unreal.loadingProjects = false;
      model.unreal.allProjects = projects;
    })
    .catch((e) => {
      model.unreal.loadingProjects = false;
      console.log("Failed to load Unreal projects: ", e);
    });
}

export function loadProjectDetails(
  dir: string
): Promise<UnrealProjectDetail | undefined> {
  return new Promise((resolve, reject) => {
    if(model.unreal.loadingProjectDetails){
      reject("Already loading details");
      return;
    }
    console.debug(`Loading project details`, dir);
    model.unreal.loadingProjectDetails = true;
    const start = Date.now();
    const prom: Promise<UnrealProjectDetail> = call(
      `${type}.getProjectDetails`,
      [dir, model.unreal.searchProjFolders]
    );
    prom.finally(() => {
      const dur = (Date.now() - start) / 1000;
      if(dur > 2) console.warn(`Loading project details took ${dur.toFixed(1)}s`, dir);
      else console.log(`Loading project details took ${dur.toFixed(1)}s`, dir);
      model.unreal.loadingProjectDetails = false;
    });

    prom.then((details: UnrealProjectDetail) => {
      model.unreal.projectDetails = {
        ...model.unreal.projectDetails,
        [dir]: details
      }
      resolve(details);
    })

    prom.catch(reject);
  })
}

export default {
  setup,
  loadProjects,
  loadProjectDetails,
};
