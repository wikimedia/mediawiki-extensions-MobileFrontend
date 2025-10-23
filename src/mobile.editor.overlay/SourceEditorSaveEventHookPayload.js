class SourceEditorSaveEventHookPayload {
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
}

module.exports = SourceEditorSaveEventHookPayload;
