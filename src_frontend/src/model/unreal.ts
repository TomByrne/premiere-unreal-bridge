import { UnrealProject, UnrealProjectDetail } from "@/UnrealProject";
import { reactive } from "vue";

export class UnrealModel {
  // searchProjFolders = ["AWS"];
  globProject = "/*.uproject"
  globScene = "/AWS/Maps/*.umap"
  globSeqeuence = "/AWS/Sequences/*.uasset"
  globImgSlots = "/AWS/PremiereSequences/*"
  projectRoot = "W:\\2660_AWS_ReINVENT\\4 Motion Design\\3D\\Unreal_Projects";

  loadingProjects = false;
  loadingProjectDetails = false;

  allProjects: UnrealProject[] = [];
  projectDetails: Record<string, UnrealProjectDetail> = {};

  findProject(dir: string): UnrealProject | undefined {
    return this.allProjects.find((p) => p.dir == dir);
  }
  findProjectDetails(dir: string): UnrealProjectDetail | undefined {
    return this.projectDetails[dir];
  }
  setProjectDetails(dir: string, details: UnrealProjectDetail | undefined): void {
    if(details) {
      this.projectDetails = {
        ...this.projectDetails,
        [dir]: details
      }
    } else delete this.projectDetails[dir];
  }
}

export default reactive(new UnrealModel());
