
namespace rest {
    // Gets called from frontend
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