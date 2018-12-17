( function ( M ) {
	/**
	 * Autosign a block of text if necessary
	 * FIXME: Ideally this would be an imported function rather than a member variable
	 * and as soon as MobileFrontend uses an asset bundler we'll make that so.
	 * @instance
	 * @param {string} text
	 * @return {string} text with an autosign ("~~~~") if necessary
	 */
	function autosign( text ) {
		return /~{3,5}/.test( text ) ? text : text + ' ~~~~';
	}

	M.define( 'mobile.talk.overlays/autosign', autosign );

}( mw.mobileFrontend ) );
