( function ( M ) {

	var View = M.require( 'mobile.startup/View' );

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
		 * @cfg {boolean} defaults.progressive is progressive action
		 * @cfg {boolean} defaults.destructive is destructive action
		 * @cfg {string} defaults.additionalClassNames Additional class name(s).
		 * @cfg {string} defaults.href url
		 * @cfg {string} defaults.label of anchor
		 */
		defaults: {
			progressive: undefined,
			destructive: undefined,
			additionalClassNames: '',
			href: undefined,
			label: undefined
		},
		template: mw.template.get( 'mobile.startup', 'anchor.hogan' )
	} );
	M.define( 'mobile.startup/Anchor', Anchor );

}( mw.mobileFrontend ) );
