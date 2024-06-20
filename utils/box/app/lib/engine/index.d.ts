/* tslint:disable */
/* eslint-disable */
/**
*/
export function main(): void;
/**
* Register the host messaging.
*
* # Errors
*
* If the execution of the registering throws, returns a `JsValue` with the error string.
* @param {Function} f
*/
export function register_messaging(f: Function): void;
/**
* Evaluate the given ECMAScript code.
*
* # Errors
*
* If the execution of the script throws, returns a `JsValue` with the error string.
* @param {string} src
* @returns {string}
*/
export function evaluate(src: string): string;
/**
* Evaluate the given ECMAScript code.
*
* # Errors
*
* If the execution of the script throws, returns a `JsValue` with the error string.
* @param {string} callback_id
* @returns {string}
*/
export function trigger(callback_id: string): string;
