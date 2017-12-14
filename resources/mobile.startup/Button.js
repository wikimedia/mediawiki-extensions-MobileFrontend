( function ( M ) {

	var View = M.require( 'mobile.startup/View' );

	/**
	 * A wrapper for creating a button.
	 * @class Button
	 * @extends View
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function Button( options ) {
		if ( options.href ) {
			options.tagName = 'a';
		}
		View.call( this, options );
	}

	OO.mfExtend( Button, View, {
		/** @inheritdoc */
		isTemplateMode: true,
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {string} defaults.tagName The name of the tag in which the button is wrapped.
		 * @cfg {boolean} defaults.block is stacked button
		 * @cfg {boolean} defaults.progressive is progressive action
		 *   This option is deprecated. Please use `progressive`.
		 * @cfg {boolean} defaults.quiet is quiet button
		 * @cfg {boolean} defaults.destructive is destructive action
		 * @cfg {string} defaults.additionalClassNames Additional class name(s).
		 * @cfg {string} defaults.href url
		 * @cfg {string} defaults.label of button
		 */
		defaults: {
			tagName: 'a',
			block: undefined,
			progressive: undefined,
			destructive: undefined,
			quiet: undefined,
			additionalClassNames: '',
			href: undefined,
			label: undefined
		},
		template: mw.template.get( 'mobile.startup', 'button.hogan' )
	} );
	M.define( 'mobile.startup/Button', Button );

}( mw.mobileFrontend ) );
