
namespace rest {
    // Gets called from frontend
    export function evalCall(f:string, args:Array<unknown>): string {

        let func: Function | undefined;
        try {
            func = eval(f);
        } catch(e:any){
            // ignore
        }
         
        if(!func)return JSON.stringify({
            succeed: false,
            value: "Unable to resolve function: " + f,
        }) as string;

        const dfunc:Function = func;

        return callReturn(() => {
            return dfunc.apply(null, args);
        })
    }
    export function callReturn(f:()=>unknown): string {
        let retValue;
        try{
            let ret = f();
            retValue = JSON.stringify({
                succeed: true,
                value: ret,
            });
        } catch(e:unknown) {
            retValue = JSON.stringify({
                succeed: false,
                value: e,
            });
        }
        return retValue ? retValue : "undefined";
    }
}

interface RetValue {
    succeed: boolean,
    value:unknown
}