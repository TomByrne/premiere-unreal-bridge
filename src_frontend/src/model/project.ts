import { reactive } from "vue";
import path from "path";

export class ProjectModel {
    meta: ProjectMeta | undefined;

    getProjectDir(): string | undefined {
        if(!this.meta) return;
        return path.dirname(this.meta.path);
    }
}

export default reactive(new ProjectModel());

export interface ProjectMeta {
    id: string;
    path: string;
}
