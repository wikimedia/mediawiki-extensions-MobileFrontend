( function ( M ) {
	var PageGateway = M.require( 'mobile.startup/PageGateway' ),
		Overlay = M.require( 'mobile.startup/Overlay' );

	/**
	 * Base overlay for talk page overlays
	 * @class TalkOverlayBase
	 * @extends Overlay
	 * @uses Page
	 * @uses PageGateway
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function TalkOverlayBase( options ) {
		this.pageGateway = new PageGateway( options.api );
		// FIXME: This should be using a gateway e.g. TalkGateway, PageGateway or EditorGateway
		this.editorApi = options.api;
		Overlay.apply( this, arguments );
	}
	OO.mfExtend( TalkOverlayBase, Overlay, {
		/**
		 * Autosign a block of text if necessary
		 * FIXME: Ideally this would be an imported function rather than a member variable
		 * and as soon as MobileFrontend uses an asset bundler we'll make that so.
		 * @param {String} text
		 * @return {String} text with an autosign ("~~~~") if necessary
		 */
		autosign: function ( text ) {
			return /~{3,5}/.test( text ) ? text : text + ' ~~~~';
		},
		className: 'talk-overlay overlay'
	} );

	M.define( 'mobile.talk.overlays/TalkOverlayBase', TalkOverlayBase );

}( mw.mobileFrontend ) );
