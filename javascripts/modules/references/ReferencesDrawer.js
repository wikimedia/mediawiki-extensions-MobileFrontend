( function ( M ) {
	var Drawer = M.require( 'Drawer' ),
		Icon = M.require( 'Icon' ),
		ReferencesDrawer;

	/**
	 * Drawer for references
	 * @class ReferencesDrawer
	 * @extends Drawer
	 */
	ReferencesDrawer = Drawer.extend( {
		defaults: {
			cancelButton: new Icon( {
				name: 'cancel',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString()
		},
		className: 'drawer position-fixed text references',
		template: mw.template.get( 'mobile.references', 'Drawer.hogan' )
	} );

	M.define( 'modules/references/ReferencesDrawer', ReferencesDrawer );
}( mw.mobileFrontend ) );
