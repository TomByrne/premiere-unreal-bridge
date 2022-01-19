
namespace XMP {
	export function setup() {
		if (ExternalObject.AdobeXMPScript === undefined) {
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		}
	}

	export function getString(obj: XMPSubject, namespace: String, property: String): string | undefined {
		setup();

		if (!XMPMeta || !XMPConst) {
			return undefined;
		}
		let xmp = new XMPMeta(obj.getXMPMetadata());
		if (!xmp.doesPropertyExist(namespace, property)) return undefined;
		return xmp.getProperty(namespace, property).toString();
	}

	export function setValue(obj: XMPSubject, namespace: String, property: String, value?: XMPValue): boolean {
		setup();
		if (!XMPMeta || !XMPConst) {
			return false;
		}

		let xmp = new XMPMeta(obj.getXMPMetadata());
		if(value) xmp.setProperty(namespace, property, value);
		else xmp.deleteProperty(namespace, property);

		return obj.setXMPMetadata(xmp.serialize());

	}
}