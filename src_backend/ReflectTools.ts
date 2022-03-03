
namespace ReflectTools {
    export function describeEval(expr:string, depth:number = 1): ObjDescription
    {
        return describe(eval(expr), depth);
    }
    export function describe(obj:any, depth:number = 1): ObjDescription
    {
        var type = typeof(obj);
        var ret:ObjDescription = {
            type: type,
        };
        switch(type) {
            case "boolean":
            case "number":
            case "bigint":
            case "string":
                ret.value = obj;
                break;
                
            case "symbol":
                ret.value = obj + "";

            case "object":
                if(depth > 0){
                    ret.props = {};
                    for(const i in obj) {
                        ret.props[i] = describe(obj[i], depth-1);
                    }
                }

        }
        return ret;
    } 
}

interface ObjDescription {
    type:string;
    value?:string|number|boolean|bigint;
    props?:Record<string, ObjDescription>;
}