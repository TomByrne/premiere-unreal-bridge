import fs from "fs";

export async function exists(path: string): Promise<boolean> {
    try {
        await fs.promises.access(path);
        return true;
    } catch(e){
        return false;
    }
}

export default {
    exists
}