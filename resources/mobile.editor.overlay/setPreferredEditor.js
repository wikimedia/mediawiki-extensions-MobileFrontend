/**
 * Store the user's preferred editor
 *
 * @param {string} editor 'VisualEditor' or 'SourceEditor'
 */
module.exports = function setPreferredEditor( editor ) {
	if ( mw.user.isNamed() ) {
		new mw.Api().saveOption( 'mobile-editor', editor ).then( () => {
			mw.user.options.set( 'mobile-editor', editor );
		} );
	} else {
		mw.storage.set( 'preferredEditor', editor );
	}
};
