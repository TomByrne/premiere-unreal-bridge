
namespace FileSystemTools {
    export function openFolder(path: string): boolean {
        var folder = new Folder(path);
        return folder.execute();
    }
}