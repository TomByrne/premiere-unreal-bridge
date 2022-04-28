import { call } from "./rest";

export function openFolder(path: string): Promise<boolean> {
    return call("FileSystemTools.openFolder", [path]);
}

export function browseForFolder(prompt: string): Promise<string | undefined> {
    return call("FileSystemTools.browseForFolder", [prompt]);
}

export default {
    openFolder,
    browseForFolder,
}