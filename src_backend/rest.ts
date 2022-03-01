
namespace rest {
    // Gets called from frontend
    export function evalCall(f:string, args:Array<unknown>): string {

        const func = eval(f);
        if(!func) return JSON.stringify({
            succeed: false,
            value: "Unable to resolve function: " + f,
        }) as string;

        return callReturn(() => {
            return func.apply(null, args);
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