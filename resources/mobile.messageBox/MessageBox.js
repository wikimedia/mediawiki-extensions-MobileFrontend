( function ( M ) {
	var View = M.require( 'mobile.startup/View' );

	/**
	 * @class MessageBox
	 * @extends View
	 */
	function MessageBox() {
		View.apply( this, arguments );
	}

	OO.mfExtend( MessageBox, View, {
		/**
		 * @inheritdoc
		 * @memberof MessageBox
		 * @instance
		 */
		isTemplateMode: true,
		/**
		 * @memberof MessageBox
		 * @instance
		 * @mixes View#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {string} [defaults.heading] heading to show along with message (text)
		 * @property {string} defaults.msg message to show (html)
		 * @property {string} defaults.className either errorbox, warningbox or successbox
		 */
		defaults: {},
		/**
		 * @memberof MessageBox
		 * @instance
		 */
		template: mw.template.get( 'mobile.messageBox', 'MessageBox.hogan' )
	} );

	M.define( 'mobile.messageBox/MessageBox', MessageBox );
}( mw.mobileFrontend ) );
