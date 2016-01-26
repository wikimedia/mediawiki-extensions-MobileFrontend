( function ( M ) {
	var View = M.require( 'mobile.view/View' );

	/**
	 * @class MessageBox
	 * @extends View
	 */
	function MessageBox() {
		View.apply( this, arguments );
	}

	OO.mfExtend( MessageBox, View, {
		/** @inheritdoc */
		isTemplateMode: true,
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} [defaults.heading] heading to show along with message (text)
		 * @cfg {String} defaults.msg message to show (html)
		 * @cfg {String} defaults.className either errorbox, warningbox or successbox
		 */
		defaults: {},
		template: mw.template.get( 'mobile.messageBox', 'MessageBox.hogan' )
	} );

	M.define( 'mobile.messageBox/MessageBox', MessageBox );
}( mw.mobileFrontend ) );
