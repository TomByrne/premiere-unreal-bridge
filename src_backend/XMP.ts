
namespace XMP {
	export function setup(){
		if (ExternalObject.AdobeXMPScript === undefined) {
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
	   }
	}
}