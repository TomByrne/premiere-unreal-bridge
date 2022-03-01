export function call<R>(method: string, args?: unknown[]): Promise<R> {
  return new Promise<R>((resolve, reject) => {
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

interface RetValue {
  succeed: boolean;
  value: unknown;
}
