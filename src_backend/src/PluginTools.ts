
namespace PluginTools {
    let extPath: string | undefined;
    export function getExtPath(): string {
        if(extPath) return extPath;

        extPath = new Folder($.includePath.split(";")[0]).parent.fsName;
        return extPath;
    }
    export function getDevMode(): boolean {
        let debugFile = new File(`${getExtPath()}/.debug`);
        return debugFile.exists;
    }
}