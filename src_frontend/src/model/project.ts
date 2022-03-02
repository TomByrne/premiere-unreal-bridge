import { reactive } from "vue";

export class ProjectModel {
    meta: ProjectMeta | undefined;
}

export default reactive(new ProjectModel());

export interface ProjectMeta {
    path: string;
}
