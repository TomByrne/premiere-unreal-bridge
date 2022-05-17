import fs from "fs";

export async function exists(path: string): Promise<boolean> {
    try {
        await fs.promises.access(path);
        return true;
    } catch(e){
        return false;
    }
}

export async function readdir(path: string, ext:string): Promise<string[]> {
    const files = await fs.promises.readdir(path);
    return files.filter((f) => f.lastIndexOf(ext) == f.length - ext.length);
}

export default {
    exists,
    readdir,
}