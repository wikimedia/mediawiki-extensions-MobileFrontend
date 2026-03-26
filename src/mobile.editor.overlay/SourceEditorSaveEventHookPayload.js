class SourceEditorSaveEventHookPayload {
	/**
	 * This callback is passed as an argument to setTemplate() and, if provided,
	 * called after the new template has been rendered.
	 *
	 * @callback setTemplateCallback
	 *
	 * @memberOf SourceEditorSaveEventHookPayload
	 */

	/**
	 * @param {Object} currentPage
	 * @param {boolean} readOnly
	 * @param {Object} options
	 * @param {callback} resumeCallback
	 */
	constructor( currentPage, readOnly, options, resumeCallback ) {
		this._stopped = false;
		this.currentPage = currentPage;
		this.readOnly = readOnly;
		this.options = options;
		this.resumeCallback = resumeCallback;
		this.templates = {};
		this.templateRenderedCallback = {};
		this.templateArgs = {};
	}

	/**
	 * Checks whether stop() was called.
	 *
	 * @returns {boolean}
	 */
	isStopped() {
		return this._stopped;
	}

	/**
	 * This method is used by hook handlers to signal that the
	 * save flow should be interrupted.
	 *
	 * @returns {void}
	 */
	stop() {
		this._stopped = true;
	}

	/**
	 * This function is used by hook handlers to resume the
	 * save flow after a call to stop().
	 *
	 * @param {Object} newOptions
	 * @returns {void}
	 */
	resume( newOptions ) {
		this._stopped = false;

		this.resumeCallback( newOptions );
	}

	/**
	 * Sets the template code to use for a given panel.
	 *
	 * @param {string} panel Name of the panel to set the template for.
	 * @param {string} newTemplate Source code for the new template.
	 * @param {Object} additionalTemplateArgs additional arguments to use when rendering the template.
	 * @param {?setTemplateCallback} onTemplateRenderedCallback Function called once the new template has been set.
	 * @returns {void}
	 */
	setTemplate( panel, newTemplate, additionalTemplateArgs = {}, onTemplateRenderedCallback = null ) {
		this.templates[panel] = newTemplate;
		this.templateRenderedCallback[panel] = onTemplateRenderedCallback;
		this.templateArgs[panel] = additionalTemplateArgs;
	}

	/**
	 * Retrieves the template source code to use for a given panel, or
	 * undefined if not set.
	 *
	 * @param {string} panel Name of the panel to get the template for.
	 * @returns {string|undefined}
	 */
	getTemplate( panel ) {
		return this.templates[panel];
	}

	/**
	 * Retrieves additional arguments to use when rendering the template
	 * for a given panel.
	 *
	 * @param {string} panel Name of the panel to get the args for.
	 * @returns {Object}
	 */
	getTemplateArgs( panel ) {
		if ( !( panel in this.templateArgs ) ) {
			return {};
		}

		return this.templateArgs[panel];
	}

	/**
	 * Retrieves the post-render callback for a given panel, or null if not set.
	 *
	 * @param {string} panel Name of the panel to get the callback for.
	 * @returns {setTemplateCallback|null}
	 */

	getTemplateRenderedCallback( panel ) {
		const callback = this.templateRenderedCallback[panel];
		return callback === undefined ? null : callback;
	}
}

module.exports = SourceEditorSaveEventHookPayload;
