/**
 * TypeScript definitions for Premiere Pro's ExtendScript API would not have happened 
 * without the efforts of Eric Robinson and Pravdomil Toman. If you find these definitions
 * useful, it's thanks to them. If you find problems with them, they're mine. 
 * 
 * -bbb 
 * 4/15/19
 * 
 */

/**
 * Updated Jan 2022 by Tom Byrne
 * https://ppro-scripting.docsforadobe.dev/
 */


enum CBool {
	false = 0,
	true = 1,
}

enum EventMessageDecorator {
	info = "info",
	warning = "warning",
	error = "error",
}


enum ProjectPropertyType {
	Integer = 0,
	Real = 1,
	String = 2,
	Boolean = 3,
}

enum AudioChannelType {
	Mono = 1,
	Stereo,
	Channel51,
	Multichannel,
	Channel4,
	Channel5,
}

enum KfInterpMode {
	Linear = 0,
	EaseIn_Obsolete = 1,
	EaseOut_Obsolete = 2,
	EaseInEaseOut_Obsolete = 3,
	Hold = 4,
	Bezier = 5,
	Time = 6,
	TimeTransitionStart = 7,
	TimeTransitionEnd = 8,
}

enum WhiteLuminance {
	WL_100 = 100,
	WL_203 = 203,
	WL_300 = 300,
}

enum TimeDisplay {
	TD_24Timecode = 100,
	TD_25Timecode = 101,
	TD_2997DropTimecode = 102,
	TD_2997NonDropTimecode = 103,
	TD_30Timecode = 104,
	TD_50Timecode = 105,
	TD_5994DropTimecode = 106,
	TD_5994NonDropTimecode = 107,
	TD_60Timecode = 108,
	TD_Frames = 109,
	TD_23976Timecode = 110,
	TD_16mmFeetFrames = 111,
	TD_35mmFeetFrames = 112,
	TD_48Timecode = 113,
	TD_AudioSamplesTimecode = 200,
	TD_AudioMsTimecode = 201,
}

enum FieldType {
	FIELDTYPE_DEFAULT = -1,
	FIELDTYPE_PROGRESSIVE = 0,
	ALPHACHANNEL_UPPERFIRST = 1,
	ALPHACHANNEL_LOWERFIRST = 2,
}

enum VrLayout {
	VR_LAYOUT_MONOSCOPIC = 0,
	VR_LAYOUT_STEREO_OVER_UNDER = 1,
	VR_LAYOUT_STEREO_SIDE_BY_SIDE = 2,
}

enum AudioFileFormat {
	AIFF = 0,
	WAV = 1,
}


enum AlphaUsage {
	ALPHACHANNEL_NONE = 0,
	ALPHACHANNEL_STRAIGHT = 1,
	ALPHACHANNEL_PREMULTIPLIED = 2,
	ALPHACHANNEL_IGNORE = 3,
}

enum VrProjection {
	VR_CONFORM_PROJECTION_NONE = 0,
	VR_CONFORM_PROJECTION_EQUIRECTANGULAR = 1,
}


enum ClipTranscoderOption {

	/**
	 * Transcode mode setting: Transcode source media to a specific preset
	 */
	MatchPreset = 'CLIP_TRANSCODE_MATCH_PRESET',

	/**
	 * Transcode mode setting: Transcode source media to match clips
	 */
	MatchClips = 'CLIP_TRANSCODE_MATCH_CLIPS',

	/**
	 * Transcode mode setting: Transcode source media to match sequence settings
	 */
	MatchSequence = 'CLIP_TRANSCODE_MATCH_SEQUENCE',
}

enum ClipTransferOption {

	/**
	 * Transfer mode setting: Copy source media
	 */
	Copy = 'CLIP_TRANSFER_COPY',

	/**
	 * Transfer mode setting: Transcode source media
	 */
	Transcode = 'CLIP_TRANSFER_TRANSCODE',
}