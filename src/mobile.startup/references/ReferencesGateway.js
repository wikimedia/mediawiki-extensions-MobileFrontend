/**
 * Abstract base class
 * Gateway for retrieving references
 *
 * @class module:mobile.startup/references~Gateway
 * @abstract
 */
class ReferencesGateway {
	/**
	 * @param {mw.Api} api
	 */
	constructor( api ) {
		this.api = api;
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Return the matched reference via API or DOM query
	 *
	 * @memberof module:mobile.startup/references~Gateway
	 * @instance
	 * @param {string} id CSS selector
	 * @param {Page} page to find reference for
	 * @param {module:mobile.startup/PageHTMLParser} pageHTMLParser
	 * @return {jQuery.Promise} resolves with an Object representing reference
	 *  with a `text` property
	 *  The promise should be rejected with ReferenceGateway.ERROR_NOT_EXIST:
	 *  if the reference is not found.
	 *  If for some reason locating the reference fails return ReferenceGateway.ERROR_OTHER.
	 */
	// eslint-disable-next-line no-unused-vars
	getReference( id, page, pageHTMLParser ) {
		// overridden
	}
}

/**
 * @memberof module:mobile.startup/references~Gateway
 * @property ERROR_NOT_EXIST error code to be returned by getReference
 *  when a reference does not exist.
 * @type string
 */
ReferencesGateway.ERROR_NOT_EXIST = 'NOT_EXIST_ERROR';
/**
 * ERROR_OTHER error code to be returned by getReference
 *  under any other circumstance not covered
 *  by ERROR_NOT_EXIST. It should be used if it is unclear whether a reference exists or not.
 *
 * @memberof module:mobile.startup/references~Gateway
 * @type string
 */
ReferencesGateway.ERROR_OTHER = 'OTHER_ERROR';

module.exports = ReferencesGateway;
