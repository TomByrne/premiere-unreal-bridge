import { call } from "./rest";

export function getDevUrl(): string {
  return "http://localhost:8080";
}

export function isAtDevUrl(): boolean {
  return location.href.indexOf(getDevUrl()) == 0;
}

export function getDevMode(): Promise<boolean> {
  return call("PluginTools.getDevMode");
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
