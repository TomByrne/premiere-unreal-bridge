import { UnrealProject, UnrealProjectDetail } from "@/UnrealProject";
import { call } from "./rest";

const type = "UnrealProjectTools";

export function listProjects(): Promise<UnrealProject[]> {
  return call(`${type}.listProjects`);
}

export function getProjectDetails(
  dir: string
): Promise<UnrealProjectDetail | undefined> {
  return call(`${type}.getProjectDetails`, [dir]);
}

export default {
  listProjects,
  getProjectDetails,
};
