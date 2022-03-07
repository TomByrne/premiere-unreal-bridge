declare namespace CSInterface {
    
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
    export function getScaleFactor(): number;
}