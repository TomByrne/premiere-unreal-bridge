// A commonly used construct for loading XMPScript into
// ExtendScript contexts.
interface ExternalObjectConstructor {
    AdobeXMPScript: ExternalObject | undefined;
}

interface XMPMetaConstructor {
	/** Creates an empty object. */
	new (): XMPMetaInstance;
	/**
	 * @param packet A String containing an XML file or an XMP packet.
	 */
	new (packet: string): XMPMetaInstance;
	/**
	 * @param buffer The UTF-8 or UTF-16 encoded bytes of an XML file
	 * or an XMP packet. This array is the result of a call to `serializeToArray`
	 * on an `XMPMeta` instance.
	 */
	new (buffer: number[]): XMPMetaInstance;

	// Class stuff.
}

declare type XMPValue = string | boolean | number

declare interface XMPProperty {
	new (): XMPProperty

	path: string
	locale: string
	namespace: string
	options: number
	value: XMPValue
}

interface XMPMetaInstance {
	doesPropertyExist(namespace:String, property:String): boolean
	getProperty(namespace:String, property:String): XMPProperty
	setProperty(namespace:String, property:String, value:XMPValue): boolean
	countArrayItems(namespace:String, property:String): Number
	getArrayItem(namespace:String, property:String, itemIndex:Number): XMPProperty
	deleteProperty(namespace:String, property:String): boolean
	appendArrayItem(namespace:String, property:String, arrayOptions:String, valueToAppend:XMPValue, valueOptions:String): boolean
	dumpObject():String
	serialize(): String
    // Instance stuff.
}

declare const XMPMeta: XMPMetaConstructor | undefined;

interface XMPConstConstructor {
    new (): XMPConstInstance;
    NS_DM: string;
    NS_DC: string;
    NS_XMP: string;
    ARRAY_IS_ORDERED: string;
    // Class stuff.
}

interface XMPConstInstance {
    // Instance stuff.
}

declare const XMPConst: XMPConstConstructor | undefined;
