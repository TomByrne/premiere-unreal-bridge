
namespace ProjectTools {
    export function getMeta(): ProjectMeta {
        return {
            path: app.project.path
        }
    }
}
interface ProjectMeta {
    path: string;
}