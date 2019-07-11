/**
 * Abstract base class
 * Gateway for retrieving references
 *
 * @class ReferencesGateway
 * @abstract
 *
 * @param {mw.Api} api
 */
function ReferencesGateway( api ) {
	this.api = api;
}

/**
 * Return the matched reference via API or DOM query
 *
 * @memberof ReferencesGateway
 * @instance
 * @param {string} id CSS selector
 * @param {Page} page to find reference for
 * @param {PageHTMLParser} pageHTMLParser
 * @return {jQuery.Promise} resolves with an Object representing reference
 *  with a `text` property
 *  The promise should be rejected with ReferenceGateway.ERROR_NOT_EXIST:
 *  if the reference is not found.
 *  If for some reason locating the reference fails return ReferenceGateway.ERROR_OTHER.
 */
ReferencesGateway.prototype.getReference = null;

/**
 * @memberof ReferencesGateway
 * @property ERROR_NOT_EXIST error code to be returned by getReference
 *  when a reference does not exist.
 */
ReferencesGateway.ERROR_NOT_EXIST = 'NOT_EXIST_ERROR';
/**
 * @memberof ReferencesGateway
 * @property ERROR_OTHER error code to be returned by getReference
 *  under any other circumstance not covered
 *  by ERROR_NOT_EXIST. It should be used if it is unclear whether a reference exists or not.
 */
ReferencesGateway.ERROR_OTHER = 'OTHER_ERROR';

module.exports = ReferencesGateway;
