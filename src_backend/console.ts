
namespace console {
    export function debug(...args:unknown[]): void {
		log.apply(console, args)
	}
    export function log(...args:unknown[]): void {
		app.setSDKEventMessage(stringifyArgs(args), EventMessageDecorator.info);
	}
    export function warn(...args:unknown[]): void {
		app.setSDKEventMessage(stringifyArgs(args), EventMessageDecorator.warning);
	}
    export function error(...args:unknown[]): void {
		app.setSDKEventMessage(stringifyArgs(args), EventMessageDecorator.error);
	}

    function stringifyArgs(...args:unknown[]): string {
        let ret = ""
        for(let arg of args) {
            let argStr;
            switch(typeof(arg)) {
                case "object":
                    argStr = JSON.stringify(arg, null, " ");
                default:
                    argStr = arg + "";
            }
            if(ret.length) ret += " ";
            ret += argStr;
        }
        return ret;
    }
}