import { call } from "./rest";

export function openFolder(path: string): Promise<boolean> {
    return call("FileSystemTools.openFolder", [path]);
}

export function browseForFolder(prompt: string): Promise<string | undefined> {
    return call("FileSystemTools.browseForFolder", [prompt]);
}


export function browseForFile(prompt: string, filter?:string | string[]): Promise<string | undefined> {
    return call("FileSystemTools.browseForFile", [prompt, filter]);
}

export default {
    openFolder,
    browseForFolder,
    browseForFile,
}