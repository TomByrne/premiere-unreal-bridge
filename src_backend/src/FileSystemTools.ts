
namespace FileSystemTools {
    export function openFolder(path: string): boolean {
        var folder = new Folder(path);
        return folder.execute();
    }
    export function browseForFolder(prompt: string): string | undefined {
        const ret = Folder.selectDialog(prompt);
        return ret ? ret.fsName : undefined;
    }

    export function browseForFile(prompt: string, filter?:string | string[]): string | undefined {
        const ret = File.openDialog(prompt, filter);
        return ret instanceof File ? ret.fsName : undefined;
    }
}