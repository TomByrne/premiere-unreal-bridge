
namespace ProjectTools {
    export function getMeta(): ProjectMeta {
        return {
            id: app.project.documentID,
            path: app.project.path,
        }
    }
    
    export function save(): boolean {
        app.project.save();
        return true;
    }
}
interface ProjectMeta {
    id: string;
    path: string;
}