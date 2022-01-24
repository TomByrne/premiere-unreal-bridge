import { call } from "./rest";

export function reimport(): Promise<boolean> {
  return call("ProjectItemTools.reimport");
}

export default {
  reimport,
};
