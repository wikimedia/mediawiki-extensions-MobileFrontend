( function ( M ) {
	var ReferencesDrawer,
		Drawer = M.require( 'Drawer' ),
		Icon = M.require( 'Icon' ),
		SchemaMobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		uiSchema = new SchemaMobileWebClickTracking( {}, 'MobileWebUIClickTracking' );

	/**
	 * Drawer for references
	 * @class ReferencesDrawer
	 * @extends Drawer
	 * @uses Icon
	 */
	ReferencesDrawer = Drawer.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelButton HTML of the button that closes the drawer.
		 */
		defaults: {
			cancelButton: new Icon( {
				name: 'cancel',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString()
		},
		/** @inheritdoc */
		show: function () {
			uiSchema.log( {
				name: 'reference'
			} );
			return Drawer.prototype.show.apply( this, arguments );
		},
		className: 'drawer position-fixed text references',
		template: mw.template.get( 'mobile.references', 'Drawer.hogan' )
	} );

	M.define( 'modules/references/ReferencesDrawer', ReferencesDrawer );
}( mw.mobileFrontend ) );
