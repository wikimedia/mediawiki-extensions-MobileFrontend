( function ( M ) {

	var Button,
		View = M.require( 'View' );

	/**
	 * A wrapper for creating a button.
	 * @class Button
	 * @extends View
	 */
	Button = View.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.tagName The name of the tag in which the button is wrapped.
		 * @cfg {Boolean} defaults.progressive is progressive action
		 * @cfg {Boolean} defaults.constructive is constructive action
		 * @cfg {Boolean} defaults.destructive is destructive action
		 * @cfg {String} defaults.additionalClassNames Additional class name(s).
		 * @cfg {String} defaults.href url
		 * @cfg {String} defaults.label of button
		 */
		defaults: {
			tagName: 'a',
			progressive: undefined,
			destructive: undefined,
			constructive: undefined,
			additionalClassNames: '',
			href: undefined,
			label: undefined
		},
		/** @inheritdoc */
		postRender: function () {
			View.prototype.postRender.apply( this, arguments );
			this.$el = this.$el.children( 0 );
		},
		template: mw.template.get( 'mobile.startup', 'button.hogan' )
	} );
	M.define( 'Button', Button );

}( mw.mobileFrontend ) );
