
namespace JSX {
    export function evalFile(path: File): void {
		try {
			$.evalFile(path);
		} catch (e) {alert("Exception:" + e);}
	}
    
    export function evalFiles(jsxFolderPath: string) {
		var folder = new Folder(jsxFolderPath);
		if (folder.exists) {
			var jsxFiles = folder.getFiles("*.jsx");
			for (var i = 0; i < jsxFiles.length; i++) {
				var jsxFile = jsxFiles[i];
				if(jsxFile instanceof File)
                    evalFile(jsxFile);
			}
		}
	}

    // interface CallScript {
    //     namespace?: string
    //     scriptName?: string
    //     args?: string
    // }

    // export function callScript(dataStr: string) {
	// 	try {
	// 		var dataObj:CallScript = JSON.parse(decodeURIComponent(dataStr));
	// 		if (
	// 			!dataObj ||
	// 			!dataObj.namespace ||
	// 			!dataObj.scriptName ||
	// 			!dataObj.args
	// 		) {
	// 			throw new Error('Did not provide all needed info to callScript!');
	// 		}
	// 		// call the specified jsx-function
	// 		var result = $[dataObj.namespace][dataObj.scriptName].apply(
	// 			null,
	// 			dataObj.args
	// 		);
	// 		// build the payload-object to return
	// 		var payload = {
	// 			err: 0,
	// 			result: result
	// 		};
	// 		return encodeURIComponent(JSON.stringify(payload));
	// 	} catch (err) {
	// 		var payload = {
	// 			err: err
	// 		};
	// 		return encodeURIComponent(JSON.stringify(payload));
	// 	}
	// }
}