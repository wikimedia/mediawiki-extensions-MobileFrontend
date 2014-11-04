( function ( M ) {
	var ReferencesDrawer = M.require( 'modules/references/ReferencesDrawer' ),
		Icon = M.require( 'Icon' ),
		ReferencesDrawerBeta;

	/**
	 * Drawer for references (beta)
	 * @class ReferencesDrawerBeta
	 * @extends ReferencesDrawer
	 */
	ReferencesDrawerBeta = ReferencesDrawer.extend( {
		defaults: {
			cancelButton: new Icon( {
				name: 'cancel-light', additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			citation: new Icon( {
				name: 'citation', additionalClassNames: 'text',
				hasText: true,
				label: mw.msg( 'mobile-frontend-references-citation' )
			} ).toHtmlString()
		},
		template: mw.template.get( 'mobile.references.beta', 'DrawerBeta.hogan' )
	} );

	M.define( 'modules/references/ReferencesDrawerBeta', ReferencesDrawerBeta );
}( mw.mobileFrontend ) );
