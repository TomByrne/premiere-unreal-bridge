
namespace FileSystemTools {
    export function openFolder(path: string): boolean {
        var folder = new Folder(path);
        return folder.execute();
    }
    export function browseForFolder(prompt: string): string | undefined {
        const ret = Folder.selectDialog(prompt);
        return ret ? ret.fsName : undefined;
    }
}