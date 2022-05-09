import csInterface from "../utils/CSInt";
import path from "path";
import fs from "fs";

export function getDevUrl(): string {
  return "http://localhost:8080";
}

export function isAtDevUrl(): boolean {
  return location.href.indexOf(getDevUrl()) == 0;
}

export function getDevMode(): Promise<boolean> {
  return new Promise((resolve) => {
    const root = csInterface.getSystemPath(SystemPath.EXTENSION);
    const debugFile = path.normalize(root + '/.debug');
    resolve(fs.existsSync(debugFile));
  });
}

export function loadBackend(): void {
  console.log("loadBackend");
  jsx.evalFile("./dist/backend.jsx", function (res) {
    console.log("loadBackend: ", res);
  });
}

export default {
  getDevUrl,
  getDevMode,
  isAtDevUrl,
  loadBackend,
};
