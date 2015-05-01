( function ( M ) {

	var Button,
		View = M.require( 'View' );

	/**
	 * A wrapper for creating a button.
	 * @class Button
	 * @extends View
	 */
	Button = View.extend( {
		/** @inheritdoc */
		isTemplateMode: true,
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.tagName The name of the tag in which the button is wrapped.
		 * @cfg {Boolean} defaults.block is stacked button
		 * @cfg {Boolean} defaults.progressive is progressive action
		 * @cfg {Boolean} defaults.constructive is constructive action
		 * @cfg {Boolean} defaults.quiet is quiet button
		 * @cfg {Boolean} defaults.destructive is destructive action
		 * @cfg {String} defaults.additionalClassNames Additional class name(s).
		 * @cfg {String} defaults.href url
		 * @cfg {String} defaults.label of button
		 */
		defaults: {
			tagName: 'a',
			block: undefined,
			progressive: undefined,
			destructive: undefined,
			constructive: undefined,
			quiet: undefined,
			additionalClassNames: '',
			href: undefined,
			label: undefined
		},
		/** @inheritdoc */
		initialize: function ( options ) {
			if ( options.href ) {
				options.tagName = 'a';
			}
			View.prototype.initialize.call( this, options );
		},
		template: mw.template.get( 'mobile.startup', 'button.hogan' )
	} );
	M.define( 'Button', Button );

}( mw.mobileFrontend ) );
