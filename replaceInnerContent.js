/**
 * Contains the function that does replacements of the data in the HTML element.
 *
 * This version of this file does not allow HTML code to be injected. Thus it is
 * safer to use and avoids problems with some linters that point out the usage of
 * "innerHtml".
 *
 * @package
 * @module Localizer
 */

/**
 * Replaces inner content of the HTML element.
 *
 * This function ignores a potential third parameter and thus does not allow
 * you to insert HTML code, but always interprets it as text.
 *
 * @protected
 * @param  {HTMLElement} elem
 * @param  {string} translatedMessage
 * @returns {void}
 */
export function replaceInnerContent(elem, translatedMessage) {
    elem.textContent = translatedMessage;
}
