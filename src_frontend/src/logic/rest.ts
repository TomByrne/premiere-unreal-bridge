export function call<R>(method: string, args?: unknown[]): Promise<R> {
  return new Promise((resolve, reject) => {
    const argsSer = JSON.stringify(args || []);

    const script = `rest.evalCall('${method}', ${argsSer})`;
    jsx.evalScript(
      script,
      (retStr: string) => {
        let ret: RetValue;
        try {
          ret = JSON.parse(retStr);
        } catch (e) {
          console.error("Error in rest API: ", retStr);
          reject(retStr);
          return;
        }
        if (ret.succeed) resolve(ret.value as unknown as R);
        else reject(ret.value);
      },
      undefined,
      false
    );
  });
}

export function call2<R>(method: string, args?: unknown[]): Promise<Resp<R>> {
  return new Promise((resolve, reject) => {
    const argsSer = JSON.stringify(args || []);

    const script = `rest.evalCall('${method}', ${argsSer})`;
    jsx.evalScript(
      script,
      (retStr: string) => {
        let ret: RetValue;
        try {
          ret = JSON.parse(retStr);
        } catch (e) {
          console.error("Error in rest API: ", retStr);
          reject(retStr);
          return;
        }
        const val: R = ret.value as unknown as R;
        if (ret.succeed) resolve({parsed:val, str:retStr});
        else reject(ret.value);
      },
      undefined,
      false
    );
  });
}

export interface Resp<R> {
  parsed:R,
  str:string,
}

interface RetValue {
  succeed: boolean;
  value: unknown;
}
