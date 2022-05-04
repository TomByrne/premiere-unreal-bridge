declare class CSInterface {

    /**
     * Retrieves the scale factor of screen.
     * On Windows platform, the value of scale factor might be different from operating system's scale factor,
     * since host application may use its self-defined scale factor.
     *
     * Since 4.2.0
     *
     * @return One of the following float number.
     *      <ul>\n
     *          <li> -1.0 when error occurs </li>\n
     *          <li> 1.0 means normal screen </li>\n
     *          <li> >1.0 means HiDPI screen </li>\n
     *      </ul>\n
     */
    getScaleFactor(): number;

    /**
     * Retrieves a path for which a constant is defined in the system.
     *
     * @param pathType The path-type constant defined in \c #SystemPath ,
     *
     * @return The platform-specific system path string.
     */
    getSystemPath(pathType: SystemPath): string;
}


declare namespace SystemPath {
    export const USER_DATA;

    /** The path to common files for Adobe applications.  */
    export const COMMON_FILES;

    /** The path to the user's default document folder.  */
    export const MY_DOCUMENTS;

    /** @deprecated. Use \c #SystemPath.Extension.  */
    export const APPLICATION;

    /** The path to current extension.  */
    export const EXTENSION;

    /** The path to hosting application's executable.  */
    export const HOST_APPLICATION;
}