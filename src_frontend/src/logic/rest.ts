import { performance } from 'perf_hooks';

const defWarnTime = 500;

export function call<R>(method: string, args?: unknown[], opts?:CallOpts): Promise<R> {
  return new Promise((resolve, reject) => {
    callDetail<R>(method, args, opts)
    .then((resp) => {
      resolve(resp.parsed);
    })
    .catch((e) => {
      reject(e);
    })
  });
}

export function callDetail<R>(method: string, args?: unknown[], opts?:CallOpts): Promise<Resp<R>> {
  return new Promise((resolve, reject) => {
    const argsSer = JSON.stringify(args || []);

    const options:CallOpts = (opts == null ? {} : opts);

    const scriptDbg = `${method}${argsSer}`;

    const start = performance.now();
    const script = `rest.evalCall('${method}', ${argsSer})`;
    if(options.outputScript != false) console.debug("Calling: ", scriptDbg);
    jsx.evalScript(
      script,
      (retStr: string) => {

        const dur = performance.now() - start;
        if(options.warnTime != false && dur > (options.warnTime == undefined ? defWarnTime : options.warnTime)) {
          console.warn(`Call took ${dur}ms: ${scriptDbg}`);
        }

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

export interface CallOpts {
  outputScript?: boolean,
  warnTime?: number | false,
}

interface RetValue {
  succeed: boolean;
  value: unknown;
}
