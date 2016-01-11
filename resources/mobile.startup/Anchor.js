( function ( M ) {

	var View = M.require( 'mobile.view/View' );

	/**
	 * A wrapper for creating an anchor.
	 * @class Anchor
	 * @extends View
	 */
	function Anchor() {
		View.apply( this, arguments );
	}

	OO.mfExtend( Anchor, View, {
		/** @inheritdoc */
		isTemplateMode: true,
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
		template: mw.template.get( 'mobile.startup', 'anchor.hogan' )
	} );
	M.define( 'mobile.startup/Anchor', Anchor );

}( mw.mobileFrontend ) );
