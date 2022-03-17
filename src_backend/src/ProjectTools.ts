
namespace ProjectTools {
    export function getMeta(): ProjectMeta {
        return {
            id: app.project.documentID,
            path: app.project.path,
        }
    }
}
interface ProjectMeta {
    id: string;
    path: string;
}