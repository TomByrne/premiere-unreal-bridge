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

type NumericalBool = 0 | 1;
type MediaType = "Video" | "Audio" | "any";
type SampleRateOption = 48000 | 96000;
type BitsPerSampleOption = 16 | 24;
type SDKEventType = "warning" | "info" | "error";

/**
 * If equal to zero represents success.
 * Otherwise represents an error.
 */
declare type ResultCode = number

declare type Guid = String;

declare type SequenceId = String;

declare type Timebase = String;

//TODO: fill in
declare type CodecCode = String;

interface $ {
	_PPP_: any;
}
declare class Dispatcher {
	/**
	 *
	 */
	bind(eventName: string, function_: any): void

	/**
	 *
	 */
	setTimeout(eventName: string, function_: any, milliseconds: number): void

	/**
	 *
	 */
	unbind(eventName: string): void
}

declare class XMPSubject extends Dispatcher {
	
	/**
	 * Sets the XMP metadata associated with the project item.
	 * 
	 * @param newXMP A new, serialized XMP metadata.
	 * 
	 * @returns Returns 0 if update was successful.
	 */
	setXMPMetadata(newXMP: String): boolean
	getXMPMetadata(): string
}

/**
 *
 */
declare class ProjectItemType extends Dispatcher {
	/**
	 *
	 */
	static readonly BIN: number

	/**
	 *
	 */
	static readonly CLIP: number

	/**
	 *
	 */
	static readonly FILE: number

	/**
	 *
	 */
	static readonly ROOT: number
}

// TODO: fill in
declare type ColorSpace = string;

// TODO: fill in
declare type Color = unknown;

declare interface FootageInterpretation {
	alphaUsage: AlphaUsage
	fieldType: FieldType
	ignoreAlpha: boolean
	invertAlpha: boolean
	frameRate: number
	pixelAspectRatio: number
	removePulldown: boolean
	vrConformProjectionType: VrProjection
	vrLayoutType: VrLayout
	vrHorizontalView: unknown
	vrVerticalView: unknown
}

/**
 * Structure containing sequence settings.
 */
declare class SequenceSettings {
	audioChannelCount: number
	audioChannelType: AudioChannelType
	audioDisplayFormat: TimeDisplay
	audioSampleRate: number
	compositeLinearColor: CBool
	editingMode: Guid
	maximumBitDepth: CBool
	maximumRenderQuality: CBool
	previewCodec: CodecCode
	previewFileFormat: String
	previewFrameHeight: number
	previewFrameWidth: number
	videoDisplayFormat: TimeDisplay
	FieldType: FieldType
	videoFrameRate: Time
	videoFrameHeight: number
	videoFrameWidth: number
	videoPixelAspectRatio: string
	vrHorzCapturedView: number
	vrVertCapturedView: number
	vrLayout: VrLayout
	vrProjection: VrProjection
	workingColorSpaceList: ColorSpace[]
	workingColorSpace: ColorSpace
}

/**
 * Structure describing audio channel mapping for a projectItem.
 */
declare class AudioChannelMapping {
	audioClipsNumber: number
	audioChannelsType: number
	setMappingForChannel(channelIndex: number, sourceChannelIndex: number): boolean
}

/**
 * A sequence.
 */
declare class Sequence extends Dispatcher {

	/**
	 *
	 */
	sequenceSettings: SequenceSettings

	/**
	* A collection of the sequence's audio tracks.
	*/
	readonly audioTracks: TrackCollection

	/**
	 * Timecode (as a string) of the end of the sequence.
	 */
	readonly end: string

	/**
	 * Width
	 */
	readonly frameSizeHorizontal: number

	/**
	 * Height
	 */
	readonly frameSizeVertical: number

	/**
	 * Sequence ID
	 */
	readonly id: number

	/**
	 * The sequence's markers.
	 */
	readonly markers: MarkerCollection

	/**
	 * The available colorspaces
	 */
	readonly workingColorSpaceList: ColorSpace[]

	/**
	 * The color space in use by the sequence
	 */
	workingColorSpace: ColorSpace

	/**
	 * Name (writable).
	 */
	name: string

	/**
	 * 
	 */
	videoDisplayFormat: number

	/**
	 * The `projectItem` corresponding to the sequence.
	 */
	readonly projectItem: ProjectItem

	/**
	 * Permanent ID of the sequence, within its project.
	 */
	readonly sequenceID: SequenceId

	/**
	 *
	 */
	readonly timebase: Timebase

	/**
	 *
	 */
	readonly videoTracks: TrackCollection

	/**
	 * The starting timecode of the first frame of the sequence, as a string.
	 */
	readonly zeroPoint: string

	/**
	 * Adds a new metadata key to the sequence, and sets its value.
	 * @param propertyID Name of new property
	 * @param propertyValue Value of new property
	 */
	attachCustomProperty(propertyID: string, propertyValue: string): void

	/**
	 * Clones a sequence.
	 * @returns the clone Sequence.
	 */
	clone(): Sequence

	/**
	 * Creates a new sequence from the source sequence's in and out points.
	 * @param ignoreMapping If True the current selection, not track targeting, will determine 
	 * the clips to include in the new sequence. 
	 * 
	 * If there is no selection, track targeting determines which clips are included in the new sequence.
	 */
	createSubsequence(ignoreMapping: Boolean): Sequence

	/**
	 * Exports a new FCP XML file representing this sequence.
	 * @param exportPath The full file path (with file name) to create.
	 * @param suppressUI Optional; quiets any warnings or errors encountered during export.
	 */
	exportAsFinalCutProXML(exportPath: string, suppressUI?: number): boolean

	/**
	 * Premiere Pro exports the sequence immediately.
	 * @param outputFilePath The output file path (with name).
	 * @param presetPath The .epr file to use.
	 * @param workAreaType Optional work area specifier. 
	 */
	exportAsMediaDirect(outputFilePath: string, presetPath: string, workAreaType?: number): string

	/**
	 * Exports the sequence (and its constituent media) as a new PPro project.
	 * @param path Output file path, including file name.
	 */
	exportAsProject(exportPath: string): void

	/**
	 * Retrieves the file extension associated with a given output preset (.epr file).
	 * @param presetFilePath full path to .epr file
	 */
	getExportFileExtension(presetFilePath: string): string

	/**
	 * Retrieves the sequence's in point, as a timecode string.
	 */
	getInPoint(): string

	/**
	 * Retrieves the sequence's out point, as a timecode string.
	 */
	getOutPoint(): string

	/**
	 * Retrieves the sequence's in point, as a `Time` object.
	 */
	getInPointAsTime(): Time

	/**
	 * Retrieves the sequence's out point, as a `Time` object.
	 */
	getOutPointAsTime(): Time


	/**
	 * Retrieves the current player position, as a `Time` object.
	 */
	getPlayerPosition(): Time

	/**
	 * Sets the in point of the sequence.
	 * @param seconds Time of in point.
	 */
	setInPoint(seconds: number): void

	/**
	 * Sets the out point of the sequence.
	 * @param seconds Time of out point.
	 */
	setOutPoint(seconds: number): void

	/**
	 * Sets the current player position.
	 * @param pos The new position, as a string, representing ticks.
	 */
	setPlayerPosition(pos: string): void

	/**
	 * Sets the timecode of the first frame of the sequence.
	 * @param newStartTime The new starting time, in `ticks`.
	 */
	setZeroPoint(newStartTime: string): void

	/**
	 * Links the currently-selected `trackItems` together, if possible.
	 * @returns `True` if successful.
	 */
	linkSelection(): boolean

	/**
	 * Unlinks the currently-selected `trackItems`, if possible.
	 * @returns `True` if successful.
	 */
	unlinkSelection(): boolean

	/**
	 * Imports a Motion Graphics Template (.mogrt) into the sequence
	 * @param pathToMOGRT Complete path to .mogrt
	 * @param timeInTicks Time (in ticks) at which to insert
	 * @param videoTrackOffset The offset from first video track to targeted track
	 * @param audioTrackOffset The offset from first audio track to targeted track
	 * @returns newly-created `trackItem` representing the .mogrt
	 */
	importMGT(pathToMOGRT: String, timeInTicks: String, videoTrackOffset: number, audioTrackOffset: number): TrackItem

	/**
	 * Returns `true` if work area is enabled.
	 */
	isWorkAreaEnabled(): Boolean

	/**
	 * Sets the enabled state of the seqeuence work area.
	 * @param enableState The desired state
	 */
	setWorkAreaEnabled(enableState: Boolean): void

	/**
	 * Returns the work area in point, in seconds.
	 */
	getWorkAreaInPoint(): number

	/**
	 * Specify the work area in point, in seconds.
	 * @param timeInSeconds new in point time.
	 */
	setWorkAreaInPoint(timeInSeconds: number): void

	/**
	 * Returns the work area out point, in seconds.
	 */
	getWorkAreaOutPoint(): number

	/**
	 * Specify the work area out point, in seconds.
	 * @param timeInSeconds new out point time.
	 */
	setWorkAreaOutPoint(timeInSeconds: number): void

	/**
	 * @returns the work area in point, as a `Time` object.
	 */
	getWorkAreaInPointAsTime(): Time

	/**
	 * Specify the work area in point, as `Time`.
	 */
	setWorkAreaInPointAsTime(outPoint: Time): void

	/**
	 * @returns the work area out point, as a `Time` object.
	 */
	getWorkAreaOutPointAsTime(): Time

	/**
	 * Specify the work area out point, as `Time`.
	 */
	setWorkAreaOutPointAsTime(outPoint: Time): void

	/**
	 * Inserts a clip (`trackItem`) into the sequence.
	 * @param projectItem The project item to insert.
	 * @param time Time at which to insert.
	 * @param vidTrackOffset The offset from the first video track to targeted track
	 * @param audTrackOffset The offset from the first audio track to targeted track
	 */
	insertClip(projectItem: ProjectItem, time: Time, vidTrackOffset: number, audTrackOffset: number): TrackItem

	/**
	 * @returns currently-selected clips, as an `Array` of `trackItems`
	 */
	getSelection(): Array<TrackItem>

	/**
	 * Returns the current sequence settings.
	 * @returns SequenceSettings
	 */
	getSettings(): SequenceSettings

	/**
	 * Specifies the sequence settings to use.
	 * @param newSettings New settings
	 */
	setSettings(newSettings: SequenceSettings): void

	/**
	 *  @returns true if effect analysis is complete
	 */

	isDoneAnalyzingForVideoEffects(): Boolean


	/**
	 * Added in v14.0
	 * 
	 * @param numerator Numerator of desired frame aspect ratio
	 * @param denominator Denominator of desired frame aspect ratio
	 * @param motionPreset Either "default", "faster" or "slower"
	 * @param sequenceName Name for created sequence
	 * @param nest Use nested sequences?
	 */


	autoReframeSequence(numerator: Number, denominator: Number, motionPreset: String, sequenceName: String, nest: Boolean): Sequence

	/**
	 * 
	 * @param action Either 'ApplyCuts' or 'CreateMarkers' 
	 * @param applyCutsToLinkedAudio Operate on linked audio too?
	 * @param sensitivity 'LowSensitivity', 'MediumSensitivity', or 'HighSensitivity'
	 */
	performCutDetectionOnSelection(action: String, applyCutsToLinkedAudio: Boolean, sensitivity: String): boolean
}


/**
 * Structure containing all available options for the `ProjectManager`.
 */
declare class ProjectManagerOptions {

	/**
	 * The specified setting for clip transcode.
	 */
	clipTranscoderOption: ClipTranscoderOption

	/**
	 * The specified setting for clip transfer.
	 */
	clipTransferOption: ClipTransferOption

	/**
	 * If `true`, projectItems not used in a sequence are not transferred
	 */
	excludeUnused: boolean

	/**
	 * The number of 'handle' frames to provide, before and after the in/out points of clips in the sequence.
	 */
	handleFrameCount: number

	/**
	 * If `true`, preview files will also be transferred.
	 */
	includePreviews: boolean

	/**
	 * If `true`, conformed audio files will also be transferred.
	 */
	includeConformedAudio: boolean

	/**
	 * If `true`, media files will be renamed to match clip names.
	 */
	renameMedia: boolean

	/**
	 * The containing directory for the consolidation/transfer.
	 */
	destinationPath: String

	/**
	 * If `true`, all sequences in the project will be transferred.
	 */
	includeAllSequences: boolean

	/**
	 * An Array of Sequence objects, to be exported.
	 */
	affectedSequences: Sequence[]

	/**
	 * Path the the encoder preset (.epr file) to be used.
	 */
	encoderPresetFilePath: String

	/**
	 * If `true`, image sequences will be transcoded.
	 */
	convertImageSequencesToClips: boolean

	/**
	 * If `true`, synthetic importer clips will be transcoded.
	 */
	convertSyntheticsToClips: boolean

	/**
	 * If `true`, After Effects compositions will be transcoded.
	 */
	convertAECompsToClips: boolean

	/**
	 * If `true`, source media will be copied not transcoded, if transcoding would have resulted in loss of alpha information.
	 */
	copyToPreventAlphaLoss: boolean
}

declare class ProjectManager extends Dispatcher {

	/**
	 * An array of strings describing errors encountered.
	 */
	//TODO: fix
	errors: unknown[]

	/**
	 * The `ProjectManagerOptions` structure.
	 */
	options: ProjectManagerOptions

	/**
	 * Perform the consolidation and transfer.
	 * @param project the `Project` to consolidate.
	 */
	process(project: Project): number
}
/**
 *
 */
declare class ComponentParamCollection extends Collection<ComponentParam> {
}

/**
 *
 */
declare class SequenceCollection extends Collection<Sequence> {
	/**
	 *
	 */
	readonly numSequences: number
}

/**
 *
 */
declare class Metadata extends Dispatcher {
	/**
	 *
	 */
	readonly getMetadata: string

	/**
	 *
	 */
	addMarker(): void

	/**
	 *
	 */
	deleteMarker(): void

	/**
	 *
	 */
	setMarkerData(): void

	/**
	 *
	 */
	setMetadataValue(): void

	/**
	 *
	 */
	updateMarker(): void
}

/**
 *
 */
declare class Anywhere extends Dispatcher {

	/**
	 *
	 */
	getAuthenticationToken(): string

	/**
	 *
	 */
	getCurrentEditingSessionActiveSequenceURL(): string

	/**
	 *
	 */
	getCurrentEditingSessionSelectionURL(): string

	/**
	 *
	 */
	getCurrentEditingSessionURL(): string

	/**
	 *
	 */
	isProductionOpen(): boolean

	/**
	 * @returns An array of open productions (), or null if no productions are open.
	 */
	listProductions(): RemoteProductionCollection

	/**
	 *
	 */
	openProduction(inProductionURL: string): boolean

	/**
	 *
	 */
	setAuthenticationToken(inAuthToken: string, inEmail: string): boolean
}

/**
 *
 */
declare class CsxsResourceCentral extends Dispatcher {

	/**
	 *
	 */
	getBrightness(): string

	/**
	 *
	 */
	openURL(urlString: string): void

	/**
	 *
	 */
	validateClient(token: string): boolean
}

/**
 *
 */
declare class SourceMonitor extends Dispatcher {
	/**
	 *
	 */
	closeAllClips(): void

	/**
	 *
	 */
	closeClip(): void

	/**
	 *
	 */
	openFilePath(filePath: string): boolean

	/**
	 *
	 */
	play(speed?: number): void

	/**
	 * 
	 */
	getPosition(): Time

	/**
	 * 
	 */
	openProjectItem(itemToOpen: ProjectItem): void

}

/**
 *
 */
declare class Time extends Dispatcher {
	/**
	 *
	 */
	seconds: number

	/**
	 *
	 */
	ticks: string

	/**
	 * Returns the value of the Time passed, as a string, formatted in the specified display format.
	 * 
	 * @param frameRate The frame rate to be used, for the String-based time value.
	 */
	getFormatted(frameRate: string, whichFormat: TimeDisplay): string

	/**
	 * Sets the Time object to the result of dividing the numerator by the denominator.
	 * Both the numerator and the denominator are ints.
	 * 
	 * @returns Boolean; true if successful.
	 */
	setSecondsAsFraction(numerator: number, denominator: number): boolean
}

/**
 *
 */
declare class Project extends Dispatcher {
	/**
	 * The currently active Sequence object, within the project.
	 */
	activeSequence: Sequence | 0

	/**
	 * A unique identifier for this project, in format of xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
	 */
	readonly documentID: string

	/**
	 * The ID of cloud project.
	 */
	readonly cloudProjectlocalID: string

	/**
	 * Check whether the project is cloud project.
	 */
	readonly isCloudProject: boolean

	/**
	 * The name of the project.
	 */
	readonly name: string

	/**
	 * The file path of the project.
	 */
	readonly path: string

	/**
	 * A ProjectItem object representing the “root” of the project.
	 */
	readonly rootItem: ProjectItem

	/**
	 * The sequences within the project.
	 */
	readonly sequences: SequenceCollection

	/**
	 * Adds a new field of the specified type to Premiere Pro’s private project metadata schema.
	 */
	addPropertyToProjectMetadataSchema(name: string, label: string, type: ProjectPropertyType): true | undefined

	/**
	 * Closes this project.
	 * 
	 * @param saveBeforeClosing: boolean, indicating whether to save the project before closing
	 * @param promptUserIfDirty: boolean, indicating whether to prompt the user to save before closing
	 * 
	 * @returns Returns 0 if successful.
	 */
	closeDocument(saveBeforeClosing?: CBool, promptUserIfDirty?: CBool): ResultCode

	/**
	 * Creates a new Sequence object with the specified ID.
	 * 
	 * @param sequenceName A name of a sequence.
	 * @param sequenceID An uniquely identifying ID for a new sequence.
	 * 
	 * @returns Returns a Sequence object if creation was successful, or 0 if unsuccessful.
	 */
	createNewSequence(sequenceName: string, sequenceID: SequenceId): Sequence | 0

	/**
	 *
	 */
	deleteAsset(): void

	/**
	 * Deletes the specified Sequence object from the project.
	 * 
	 * @returns Returns 0 if successful.
	 */
	deleteSequence(sequence: Sequence): ResultCode

	/**
	 * Exports an AAF file of the specified Sequence object, using the specified settings.
	 * @returns Returns 0 if successful.
	 */
	exportAAF(
		sequence: Sequence,
		filePath: string,
		mixdownVideo: CBool,
		explodeToMono: CBool,
		sampleRate: number,
		bitsPerSample: number,
		embedAudio: CBool,
		audioFileFormat: AudioFileFormat,
		trimSources: CBool,
		handleFrames: number,
		presetPath: string | undefined,
		renderAudioEffects: CBool,
		includeClipCopies: CBool,
		preserveParentFolder: CBool,
	): ResultCode

	/**
	 * Exports an FCP XML representation of the entire project, to the specified output path.
	 * 
	 * @returns Returns 0 if successful.
	 */
	exportFinalCutProXML(exportPath: string, suppressUI: CBool): ResultCode

	/**
	 * Invokes Premiere Pro’s “Consolidate Duplicate Footage” functionality, as available from the UI.
	 * 
	 * @returns Returns 0 if successful.
	 */
	consolidateDuplicates(): ResultCode

	/**
	 * Exports an OMF file of the specified Sequence object, using the specified settings.
	 * 
	 * @returns Returns 0 if successful.
	 */
	exportOMF(
		sequence: Sequence,
		filePath: string,
		OMFTitle: string,
		sampleRate: number,
		bitsPerSample: number,
		audioEncapsulated: CBool,
		audioFileFormat: AudioFileFormat,
		trimAudioFiles: number,
		handleFrames: number, //TODO: replace with 0 - 1000 Interval type (when available in TS)
		includePan: CBool,
	): ResultCode

	/**
	 * Exports the currently active Sequence object, using an Export Controller plug-in with the specified name.
	 * 
	 * @param exportControllerName The name of the Export Controller plug-in to be used. To use the Premiere Pro SDK example Export Controller, the value would be “SDK Export Controller”.
	 * 
	 * @returns Returns 0 if successful, or an error code if not.
	 */
	exportTimeline(exportControllerName: string): number

	/**
	 * Returns a ProjectItem object referencing the bin into which import will occur.
	 */
	getInsertionBin(): ProjectItem | 0

	/**
	 * Returns the current layout of the Project panel.
	 * 
	 * @returns Returns a String representing the current Project panel layout, or 0 if unsuccessful.
	 */
	getProjectPanelMetadata(): string | 0

	/**
	 * Returns the path to the location to which shared files are to be copied.
	 */
	getSharedLocation(): string

	/**
	 * Imports specified Compositions (by name) from the containing After Effects .aep project file.
	 * You can specify a target bin within the containing project; otherwise, the Compositions will
	 * appear in the most recently targeted bin, within this project.
	 */
	importAEComps(aepPath: String, compsToImport: string[], projectBin?: ProjectItem): ResultCode

	/**
	 *
	 */
	importAllAEComps(aepPath: String, projectBin: ProjectItem): boolean

	/**
	 * Imports files into the project. 
	 * @param arrayOfFilePathsToImport An array of paths to files to import
	 * @param suppressUI optional; if true, suppress any warnings, translation reports, or errors.
	 * @param projectBin optional; if present, the bin into which to import the new media.
	 * @param importAsNumberedStill optiona; if present, interprets the file paths as a series of numbered stills.
	 */
	importFiles(arrayOfFilePathsToImport: string[], suppressUI?: boolean, projectBin?: ProjectItem, importAsNumberedStill?: boolean): boolean

	/**
	 * Imports an array of sequence objects (with specified sequenceIDs), from the specified project, into the current project.
	 * 
	 * @param projectPath Path to project from which to import sequences.
	 * @param sequences An array of sequence IDs to import, from the project.
	 * 
	 * @returns Returns 0 if successful.
	 */
	importSequences(projectPath: String, sequencesToImport: SequenceId[]): ResultCode

	/**
	 * Determines whether copying to a shared location is enabled, for this project.
	 */
	isSharedLocationCopyEnabled(): boolean

	/**
	 * Creates a new Sequence object with the given name, based on the specified preset (.sqpreset file).
	 */
	newBarsAndTone(width: number, height: number, timeBase: Timebase, PARNum: number, PARDen: number, audioSampleRate: number, name: string): ProjectItem | 0

	/**
	 *
	 */
	openSequence(sequenceID: SequenceId): boolean

	/**
	 *
	 */
	pauseGrowing(pausedOrNot: number): boolean

	/**
	 *
	 */
	placeAsset(arg1: any): boolean

	/**
	 *
	 */
	save(): void

	/**
	 *
	 */
	saveAs(saveAsPath: string): boolean

	/**
	 *
	 */
	setProjectPanelMetadata(newMetadata: string): void

	/**
	 * Creates a new Sequence object with the given name, in the specified destination bin, and sequentially inserts project items into it.
	 * 
	 * @param newSequenceName 	Name for newly-created sequence
	 * @param projectItems 		Array of project items to be added to sequence
	 * @param targetBin 		Bin in which new sequence should be created
	 * 
	 * @returns Returns the newly-created Sequence object if successful; 0 if unsuccessful.
	 */

	createNewSequenceFromClips(newSequenceName: string, projectItems: ProjectItem[], destinationBin?: ProjectItem): Sequence | 0

	/**
	 * Retrieves the supported graphics white luminance values, for this project.
	 * 
	 * @returns Returns an array of graphics white settings supported by the project; Currently it returns (100, 203, 300)
	 */
	getSupportedGraphicsWhiteLuminances(): [WhiteLuminance.WL_100, WhiteLuminance.WL_203, WhiteLuminance.WL_300]

	/**
	 * Retrieves the current graphics white luminance value, for this project.
	 */
	getGraphicsWhiteLuminance(): WhiteLuminance

	/**
	 * 
	 * @param newGWL  
	 */
	setGraphicsWhiteLuminance(newGWL: WhiteLuminance): boolean
}

/**
 *
 */
declare class Track extends Dispatcher {
	/**
	 *
	 */
	name: string

	/**
	 *
	 */
	readonly clips: TrackItemCollection

	/**
	 *
	 */
	readonly id: number

	/**
	 *
	 */
	readonly mediaType: string

	/**
	 *
	 */
	readonly transitions: TrackItemCollection

	/**
	 *
	 */
	insertClip(clipProjectItem: ProjectItem, time: number): boolean

	/**
	 *
	 */
	isLocked(): boolean

	/**
	 *
	 */
	isMuted(): boolean

	/**
	 *
	 */
	overwriteClip(clipProjectItem: ProjectItem, time: number): TrackItem

	/**
	 *
	 */
	setLocked(arg1?: number): void

	/**
	 *
	 */
	setMute(arg1?: number): void

	/**
	 *
	 */
	isTargeted(): Boolean

	/**
	 *
	 */
	setTargeted(isTargeted: Boolean, shouldBroadcast: Boolean): Boolean
}

/**
 *
 */
declare class TrackItem extends Dispatcher {
	/**
	 *
	 */
	readonly components: ComponentCollection

	/**
	 *
	 */
	readonly duration: Time

	
	readonly nodeId: string

	/**
	 *
	 */
	end: Time

	/**
	 *
	 */
	inPoint: Time

	/**
	 * 
	 */
	outPoint: Time

	/**
	 *
	 */
	readonly mediaType: string

	/**
	 *
	 */
	name: string

	/**
	 *
	 */
	projectItem: ProjectItem

	/**
	 * Added in v15.4
	 */
	disabled: boolean
	/**
	 *
	 */
	readonly start: Time

	/**
	 *
	 */
	readonly type: number

	/**
	 *
	 */
	getLinkedItems(): TrackItemCollection

	/**
	 *
	 */
	isSelected(): boolean

	/**
	 *
	 */
	isSpeedReversed(): boolean

	/**
	 *
	 */
	setSelected(isSelected: boolean, updateUI?: boolean): void

	/**
	 *
	 */
	isAdjustmentLayer(): boolean

	/**
	 *
	 */
	remove(rippleEdit: boolean, alignToVideo: boolean): boolean

	/**
	 *
	 */
	getSpeed(): number

	/**
	 *
	 */
	getMGTComponent(): any

	/**
	 * 
	 */
	getColorSpace(): ColorSpace

	/**
	 * Added in v15.4
	 */
	move(newInPoint: Time): void
}
/**
 * The component object represents something which has been added or applied to a trackItem.
 */
declare class Component {
	/**
	 * The name of the component, as it is displayed to the user. Localized.
	 */
	readonly displayName: string

	/**
	 * The name of the component, as it is loaded from disk; used to uniquely identify effect plug-ins.
	 */
	readonly matchName: string

	/**
	 * The properties of the component in question; typically, these are effect parameters.
	 */
	readonly properties: ComponentParamCollection
}

/**
 * The component parameter object represents a parameter associated with a component, applied to a TrackItem object.
 */
declare class ComponentParam {
	/**
	 * The name of the component parameter, as it is displayed to the user. Localized.
	 */
	readonly displayName: string

	/**
	 * Adds a keyframe to the component parameter stream, at the specified time.
	 * Note: This can only be set on parameters which support keyframing.
	 * 
	 * @param time When the keyframe should be added.
	 */
	addKey(time: Time): ResultCode

	/**
	 * Retrieves whether keyframes are supported, for this component parameter.
	 */
	areKeyframesSupported(): boolean

	/**
	 * @returns Returns a Time value, indicating when the closest keyframe is.
	 */
	findNearestKey(timeToCheck: Time, threshold: number): Time

	/**
	 * Returns the keyframe temporally subsequent to the provided timeToCheck.
	 * Note: This can only be set on parameters which support keyframing.
	 * 
	 * @returns Returns a Time value, indicating when the closest keyframe is,
	 * or 0 if there is no available subsequent keyframe.
	 */
	findNextKey(timeToCheck: Time): Time | 0

	/**
	 * Returns the keyframe temporally previous to the provided timeToCheck.
	 * Note: This can only be set on parameters which support keyframing.
	 * 
	 * @returns Returns a Time value, indicating when the closest keyframe is,
	 * or 0 if there is no available previous keyframe.
	 */
	findPreviousKey(timeToCheck: Time): Time | 0

	/**
	 * Obtains the value of the component parameter stream.
	 * Note: This can only work on parameters which are not time-variant.
	 */
	getColorValue(): Color | 0

	/**
	 * Returns an array of all keyframes on the timeToCheck component parameter.
	 * Note: This can only be set on parameters which support keyframing.
	 */
	getKeys(): Time[] | 0

	/**
	 * Obtains the value of the component parameter stream.
	 * Note: This can only work on parameters which are not time-variant.
	 */
	getValue(): unknown

	/**
	 * Retrieves the value of the component parameter stream, at the specified keyframe time.
	 * Note: Can only be used with keyframeable parameter streams.
	 * 
	 * @returns Returns the value of the component parameter stream at time, or 0 if unsuccessful.
	 */
	getValueAtKey(time: Time): unknown | 0

	/**
	 * Retrieves the value of the component parameter stream, at the specified time.
	 * If the value is between two keyframes then interpolation takes place.
	 * 
	 * @returns Returns the value of the component parameter stream at time, or 0 if unsuccessful.
	 */
	getValueAtTime(time: Time): unknown | 0

	/**
	 * Retrieves whether the component parameter varies, over time.
	 */
	isTimeVarying(): boolean

	/**
	 * Removes a keyframe on the component parameter stream, at the specified time.
	 * Note: This can only be set on parameters which support keyframing.
	 * 
	 * @param time A time value, indicating when the keyframe should be removed.
	 * 
	 * @returns Returns 0 if successful.
	 */
	removeKey(time: Time): ResultCode

	/**
	 * Removes all keyframes from the component parameter stream, between the specified times.
	 * Note: This can only be set on parameters which support keyframing.
	 * 
	 * @param time At what times (inclusive) to begin the removal of keyframes.
	 * @param end at what times to end the removal of keyframes.
	 * 
	 * @returns Returns 0 if successful.
	 */
	removeKeyRange(time: Time, end: Time): ResultCode

	/**
	 * Sets the values within a component parameter stream, representing a Color.
	 * 
	 * @param updateUI Force to update UI after updating the value of the stream.
	 * 
	 * @returns Returns 0 if successful.
	 */
	setColorValue(alpha: number, red: number, green: number, blue: number, updateUI?: CBool): ResultCode

	/**
	 * Specifies the interpolation type to be assigned to the keyframe, at the specified time.
	 * Note: Can only be used with keyframeable parameter streams.
	 * 
	 * @param time A time of keyframe to modify.
	 * @param interpretationType Interpolation method.
	 * @param updateUI Whether to update UI afterward.
	 * 
	 * @returns Returns 0 if successful.
	 */
	setInterpolationTypeAtKey(time: Time, interpretationType: KfInterpMode, updateUI?: CBool): ResultCode

	/**
	* Sets whether the component parameter varies, over time.
	* Note: This can only be set on parameters which support keyframing.
	* 
	* @param varying If true, component parameter will vary over time; if false, it won’t.
	* 
	* @returns Returns 0 if successful.
	*/
	setTimeVarying(varying: boolean): ResultCode

	/**
	 * Obtains the value of the component parameter stream.
	 * Note: This can only work on parameters which are not time-variant.
	 * 
	 * @param value Must be of the appropriate type for the component parameter stream.
	 * @param updateUI Whether to update UI afterward.
	 * 
	 * @returns Returns 0 if successful.
	 */
	setValue(value: unknown, updateUI?: CBool): ResultCode

	/**
	 * Sets the value of the component parameter stream, at the specified keyframe time.
	 * Note: Can only be used with keyframeable parameter streams.
	 * 
	 * @param time A time at which the keyframe value should be set.
	 * @param value A value to be set.
	 * @param updateUI If 1, will force Premiere Pro to update UI, after updating the value of the stream.
	 * 
	 * @returns Returns 0 if successful.
	 */
	setValueAtKey(time: Time, value: unknown, updateUI?: CBool): ResultCode
}

/**
 *
 */
declare class ProjectItem extends XMPSubject {
	/**
	 *
	 */
	readonly children: ProjectItemCollection

	/**
	 *
	 */
	name: string

	/**
	 *
	 */
	readonly nodeId: string

	/**
	 *
	 */
	readonly treePath: string

	/**
	 *
	 */
	readonly type: number

	/**
	 * Video components for the ‘Master Clip’ of this project item.
	 */
	readonly videoComponents: ComponentCollection

	/**
	 *
	 */
	attachProxy(mediaPath: string, isHiRes: number): boolean

	/**
	 * 
	 */
	detachProxy(): boolean

	/**
	 *
	 */
	canChangeMediaPath(): boolean

	/**
	 *
	 */
	canProxy(): boolean

	/**
	 * Updates the project item to point to a new media path.
	 * 
	 * @param newPath A new path to the media file.
	 * @param overrideChecks Override any safety concerns.
	 */
	changeMediaPath(newPath: string, overrideChecks?: boolean): ResultCode

	/**
	 *
	 */
	createBin(name: string): ProjectItem

	/**
	 *
	 */
	createSmartBin(name: string, query: string): void

	/**
		 * 	Returns whether the projectItem represents a sequence.
			  @returns true, if projectItem is a sequence.
		*/
	isSequence(): boolean

	/**
	 *
	 */
	createSubClip(
		name: string,
		startTime: object,
		endTime: object,
		hasHardBoundaries: number,
		takeVideo?: number,
		takeAudio?: number,
	): ProjectItem

	/**
	 *
	 */
	deleteBin(): void

	/**
	 *
	 */
	findItemsMatchingMediaPath(matchString: string, ignoreSubclips?: number): void

	/**
	 *
	 */
	getColorLabel(): number

	/**
	 *
	 */
	getMarkers(): MarkerCollection

	/**
	 *
	 */
	getMediaPath(): string

	/**
	 *
	 */
	getProjectMetadata(): string

	/**
	 *
	 */
	getProxyPath(): string

	/**
	 *
	 */
	hasProxy(): boolean

	/**
	 *
	 */
	moveBin(destination: ProjectItem): void

	/**
	 *
	 */
	refreshMedia(): string

	/**
	 *
	 */
	renameBin(name: string): boolean

	/**
	 *
	 */
	select(): void

	/**
	 *
	 */
	setColorLabel(newColor: number): void

	/**
	 *
	 */
	setOverridePixelAspectRatio(numerator: number, denominator: number): boolean

	/**
	 *
	 */
	setOverrideFrameRate(newFrameRate: number): boolean

	/**
	 * Sets the private project metadata associated with the project item.
	 * 
	 * @param newMetadata A new, serialized private project metadata.
	 * @param updatedFields An array containing the names of the fields to be updated.
	 * 
	 * @returns Returns 0 if update was successful.
	 */
	setProjectMetadata(newMetadata: String, updatedFields: string[]): ResultCode

	/**
	 * Turns on scaling to frame size, for when media from this project item is inserted into a sequence.
	 */
	setScaleToFrameSize(): void

	/**
	 * Assigns a new start time to the project item
	 * 
	 * @param time A new starting time, represented in Ticks.
	 * 
	 * @returns Returns 0 if successful.
	 */
	setStartTime(time: string): ResultCode

	/**
	 * Returns a Time object, representing start time.
	 */
	startTime(): Time

	/**
	 * 
	 * @param newColorSpace value must be available via sequence.workingColorSpaceList 
	 */
	setOverrideColorSpace(newColorSpace: ColorSpace): void

	/**
	 * 
	 */
	getColorSpace(): ColorSpace

	/**
	 * 
	 */
	isMultiCamClip(): boolean

	/**
	 * 
	 */
	isMergedClip(): boolean

	/**
	 * 
	 * @returns boolean indicating whether projectItem is offline.
	 */
	isOffline(): boolean

	/**
	 * 
	 * @returns a boolean indicating whether setting the projectItem offline was successful.
	 */
	setOffline(): boolean

	/**
	 * 
	 * @returns a footageInterpretation object, or null if none was available.
	 */
	getFootageInterpretation(): FootageInterpretation | 0

	/**
	 * 
	 * @param interp object containing desired settings
	 * @returns a boolean indicating whether setting the interpretation was successful.
	 */
	setFootageInterpretation(interp: FootageInterpretation): boolean

	/**
	 * 
	 * @returns an audio channel mapping object, or null if none was available.
	 */
	getAudioChannelMapping: AudioChannelMapping

	/**
	 * 
	 * @param AudioChannelMapping object describing desired audio channel mapping. 
	 * @returns boolean indicating whether setting the audio channel mapping was successful.
	 */
	setAudioChannelMapping(mapping: AudioChannelMapping): boolean

	/**
	 * New method ?
	 */
	setOverrideFramerate: null | ((frameRate: number) => void)
}

/**
 *
 */
declare class ProjectCollection extends Collection<Project> {
	/**
	 *
	 */
	readonly numProjects: number
}

/**
 *
 */
declare class ComponentCollection extends Collection<Component> {
	/**
	 *
	 */
	readonly numItems: number
}

/**
 *
 */
declare class ProjectItemCollection extends Collection<ProjectItem> {
	/**
	 *
	 */
	readonly numItems: number
}

/**
 *
 */
declare class TrackCollection extends Collection<Track> {
	/**
	 *
	 */
	readonly numTracks: number
}

/**
 *
 */
declare class TrackItemCollection extends Collection<TrackItem> {

	/**Number of items
	 * 
	 */
	readonly numItems: number
}

/**
 *
 */
declare class ScratchDiskType {
	/**
	 *
	 */
	static readonly FirstAudioCaptureFolder: string

	/**
	 *
	 */
	static readonly FirstAudioPreviewFolder: string

	/**
	 *
	 */
	static readonly FirstAutoSaveFolder: string

	/**
	 *
	 */
	static readonly FirstCClibrariesFolder: string

	/**
	 *
	 */
	static readonly FirstCapsuleMediaFolder: string

	/**
	 *
	 */
	static readonly FirstVideoCaptureFolder: string

	/**
	 *
	 */
	static readonly FirstVideoPreviewFolder: string
}

/**
 *
 */
declare class Csxs extends Dispatcher {
	/**
	 *
	 */
	readonly resourceCentral: CsxsResourceCentral
}


declare class Collection<T> extends Array<T> implements Dispatcher {

	
	/**
	 *
	 */
	 bind(eventName: string, function_: any): void

	 /**
	  *
	  */
	 setTimeout(eventName: string, function_: any, milliseconds: number): void
 
	 /**
	  *
	  */
	 unbind(eventName: string): void
}

/**
 *
 */
declare class RemoteProductionCollection extends Collection<RemoteProduction> {
	/**
	 *
	 */
	readonly numProductions: number
}

/**
 *
 */
declare class RemoteProduction extends Dispatcher {
	/**
	 *
	 */
	readonly description: string

	/**
	 *
	 */
	readonly name: string

	/**
	 *
	 */
	readonly url: string
}

/**
 *
 */
declare class Encoder extends Dispatcher {
	/**
	 *
	 */
	readonly ENCODE_ENTIRE: number

	/**
	 *
	 */
	readonly ENCODE_IN_TO_OUT: number

	/**
	 *
	 */
	readonly ENCODE_WORKAREA: number

	/**
	 *
	 */
	encodeFile(
		inputFilePath: string,
		outputFilePath: string,
		presetPath: string,
		removeOnCompletion?: number,
		startTime?: object,
		stopTime?: object,
	): string

	/**
	 *
	 */
	encodeProjectItem(
		projectItem: ProjectItem,
		outputFilePath: string,
		presetPath: string,
		WorkAreaType?: number,
		removeOnCompletion?: number,
	): string

	/**
	 *
	 */
	encodeSequence(
		sequence: Sequence,
		outputFilePath: string,
		presetPath: string,
		WorkAreaType?: number,
		removeOnCompletion?: number,
		startQueueImmediately?: boolean,
	): string

	/**
	 * @returns an array of available exporters, or null if no exporters are available.
	 */
	getExporters(): unknown[] | undefined

	/**
	 *
	 */
	launchEncoder(): boolean

	/**
	 *
	 */
	setEmbeddedXMPEnabled(enable: number): void

	/**
	 *
	 */
	setSidecarXMPEnabled(enable: number): void

	/**
	 *
	 */
	startBatch(): boolean

	/**
	 * 
	 */
	lastExportMediaFolder(): String
}

/**
 *
 */
declare class Properties extends Dispatcher {

	/**
	 * @param propertyKey Indicates which property to clear.
	 */
	clearProperty(propertyKey: string): void

	/**
	 *
	 */
	doesPropertyExist(propertyKey: string): boolean

	/**
	 *
	 */
	getProperty(propertyKey: string): any

	/**
	 *
	 */
	isPropertyReadOnly(propertyKey: string): boolean

	/**
	 *
	 */
	setProperty(propertyKey: string, propertyValue: any, permanenceValue: number, allowCreateNewProperty: boolean): void
}
/**
 * 
 */
declare class PrProduction {
	/**
	 * 
	 */
	name: string

	/**
	 * 
	 */
	projects: Array<Project>

	/**
	 * 
	 */
	close(): void

	/**
	 * 
	 */
	getLocked(project: Project): Boolean

	/**
	 * 
	 */
	setLocked(project: Project, newLockState: Boolean): void

	/**
	 * 
	 */
	moveToTrash(projectPath: String, suppressUI: Boolean, saveProject: Boolean): Boolean

}
/**
 *
 */
declare class Application extends Dispatcher {
	/**
	 *
	 */
	readonly anywhere: Anywhere

	/**
	 *
	 */
	readonly build: string

	/**
	 *
	 */
	readonly csxs: Csxs

	/**
	 *
	 */
	readonly encoder: Encoder

	/**
	 *
	 */
	readonly projectManager: ProjectManager


	/**
	 *
	 */
	readonly getAppPrefPath: string

	/**
	 *
	 */
	readonly getAppSystemPrefPath: string

	/**
	 *
	 */
	readonly getPProPrefPath: string

	/**
	 *
	 */
	readonly getPProSystemPrefPath: string

	/**
	 *
	 */
	readonly metadata: Metadata

	/**
	 * This is the current active project.
	 */
	project: Project

	/**
	 *
	 */
	readonly projects: ProjectCollection

	/**
	 *
	 */
	readonly properties: Properties

	/**
	 *
	 */
	readonly sourceMonitor: SourceMonitor

	/**
	 *
	 */
	readonly userGuid: string

	/**
	 *
	 */
	readonly version: string

	/**
	 *
	 */
	broadcastPrefsChanged(preferencesThatChanged: string): boolean

	/**
	 *
	 */
	getEnableProxies(): number

	/**
	 * Checks whether file specified is a doc
	 * @param filePath This is the path to be checked
	 * @returns true if the document at that path is openable as a PPro project
	 */
	isDocument(filePath: string): boolean

	/**
	 *
	 */
	isDocumentOpen(): boolean

	/**
	 *
	 */
	openDocument(filePath: string, bypassConversionDialog?: boolean, bypassLocateFile?: boolean, bypassWarningDialog?: boolean, hideFromMRUList?: boolean): boolean

	/**
	 * @param newValueForTranscodeOnIngest
	 * 
	 * @returns Boolean indicating whether transcode on ingest is enabled.
	 */
	setEnableTranscodeOnIngest(newValueForTranscodeOnIngest: boolean): boolean

	/**
	 *
	 */
	openFCPXML(): boolean

	/**
	 *
	 */
	quit(): void

	/**
	 *
	 */
	setEnableProxies(enable: number): boolean

	/**
	 *
	 */
	setExtensionPersistent(extensionID: string, state?: number): void

	/**
	 * Writes a string to Premiere Pro’s Events panel.
	 * 
	 * @param message A message to display.
	 * @param decorator A message to display.
	 * 
	 * @returns Returns ‘true’ if successful.
	 * 
	 */
	setSDKEventMessage(message: string, decorator: EventMessageDecorator): boolean

	/**
	 *
	 */
	setScratchDiskPath(value: string, type: string): boolean

	/**
	 * Returns the view IDs of currently-open views, associated with any project.
	 * 
	 * @returns An array of view IDs; can be null.
	 */
	getProjectViewIDs(): string[] | undefined

	/**
	 *
	 */
	getProjectFromViewID(viewID: String): Project

	/**
	 *
	 */
	showCursor(enable: boolean): void

	/**
	 *
	 */
	getProjectViewSelection(viewID: String): Array<ProjectItem>

	/**
	* Added in v15.4
	*/
	getCurrentProjectViewSelection(viewID: String): Array<ProjectItem>

	/**
	 *
	 */
	setProjectViewSelection(projectItems: ProjectItem[], viewID: String): void

	/**
	 *
	 */
	onItemAddedToProjectSuccess: undefined


	/**
	 * @returns an array of the names of all available workspaces.
	 */
	getWorkspaces(): string[]

	/**
	 * Set workspace as active. Use app.getWorkspaces() to get a list of all available workspaces.
	 * 
	 * @param workspaceName Name of workspace to use
	 * @returns true if successful
	 */
	setWorkspace(workspaceName: string): boolean

	/**
	 * 
	 * @param eventName event to which to subscribe
	 * @param function_ function to be called 
	 */
	addEventListener(eventName: string, function_: any): void

	/**
	 * Writes a string to Premiere Pro’s debug console.
	 * @returns Returns true if trace was added.
	 */
	trace(message: string): boolean

	/**
	 * Enables Premiere Pro’s QE DOM.
	 * 
	 * @returns Returns true if QE DOM was enabled.
	 */
	enableQE(): boolean

	/**
	 * 
	 */
	newProject(projectName: string): boolean

	/**
	 * 
	 */
	production: PrProduction

	/**
	 * 
	 */
	openPrProduction(path: string): PrProduction

}

/**
 *
 */
declare class MarkerCollection extends Collection<Marker> {
	/**
	 *
	 */
	readonly numMarkers: number

	/**
	 *
	 */
	createMarker(time: number): Marker

	/**
	 *
	 */
	deleteMarker(marker: Marker): void

	/**
	 *
	 */
	getFirstMarker(): Marker

	/**
	 *
	 */
	getLastMarker(): Marker

	/**
	 *
	 */
	getNextMarker(marker: Marker): Marker

	/**
	 *
	 */
	getPrevMarker(marker: Marker): Marker
}

/**
 *
 */
declare class Marker extends Dispatcher {
	/**
	 *
	 */
	comments: string

	/**
	 *
	 */
	end: Time

	/**
	 *
	 */
	readonly guid: string

	/**
	 *
	 */
	name: string

	/**
	 *
	 */
	start: Time

	/**
	 *
	 */
	type: string

	/**
	 *
	 */
	getWebLinkFrameTarget(): string

	/**
	 *
	 */
	getWebLinkURL(): string

	/**
	 *
	 */
	setTypeAsChapter(): void

	/**
	 *
	 */
	setTypeAsComment(): void

	/**
	 *
	 */
	setTypeAsSegmentation(): void

	/**
	 *
	 */
	setTypeAsWebLink(url: string, frameTarget: string): void

	/**
	 * Added in v13.x
	 */
	getColorByIndex(): number

	/**
	 * Added in v13.x
	 */
	setColorByIndex(index: number): void
}

/**
 *
 */
declare class Document extends Dispatcher {
	/**
	 *
	 */
	getFilePath(): string

	/**
	 *
	 */
	importFiles(arg1: any): boolean
}

/**
 * In order to use qe please call app.enableQE() first.
 */
declare const qe: undefined | any

interface SystemCompatibilityReport {
	/**
	* @param fullOutputPath The path and filename at which to write the report.
	*/
	CreateReport(fullOutputPath: string): void
}

declare const SystemCompatibilityReport: SystemCompatibilityReport;

