import { call } from "./rest";

export function openFolder(path: string): Promise<boolean> {
    return call("FileSystemTools.openFolder", [path]);
}

export default {
    openFolder
}