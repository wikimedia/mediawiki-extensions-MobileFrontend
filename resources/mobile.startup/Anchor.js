( function ( M ) {

	var Anchor,
		View = M.require( 'View' );

	/**
	 * A wrapper for creating an anchor.
	 * @class Anchor
	 * @extends View
	 */
	Anchor = View.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.progressive is progressive action
		 * @cfg {Boolean} defaults.constructive is constructive action
		 * @cfg {Boolean} defaults.destructive is destructive action
		 * @cfg {String} defaults.additionalClassNames Additional class name(s).
		 * @cfg {String} defaults.href url
		 * @cfg {String} defaults.label of anchor
		 */
		defaults: {
			progressive: undefined,
			destructive: undefined,
			constructive: undefined,
			additionalClassNames: '',
			href: undefined,
			label: undefined
		},
		/** @inheritdoc */
		postRender: function () {
			View.prototype.postRender.apply( this );
			this.$el = this.$el.children( 0 );
		},
		template: mw.template.get( 'mobile.startup', 'anchor.hogan' )
	} );
	M.define( 'Anchor', Anchor );

}( mw.mobileFrontend ) );
