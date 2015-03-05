( function ( M ) {
	var ReferencesDrawer = M.require( 'modules/references/ReferencesDrawer' ),
		Icon = M.require( 'Icon' ),
		ReferencesDrawerBeta;

	/**
	 * Drawer for references (beta)
	 * @inheritdoc
	 * @class ReferencesDrawerBeta
	 * @extends ReferencesDrawer
	 */
	ReferencesDrawerBeta = ReferencesDrawer.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelButton HTML of the button that closes the drawer.
		 * @cfg {String} defaults.citation HTML of the citation icon.
		 */
		defaults: {
			cancelButton: new Icon( {
				name: 'cancel-light',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			citation: new Icon( {
				name: 'citation',
				additionalClassNames: 'text icon-16px',
				hasText: true,
				label: mw.msg( 'mobile-frontend-references-citation' )
			} ).toHtmlString()
		},
		/**
		 * @inheritdoc
		 */
		closeOnScroll: false,
		template: mw.template.get( 'mobile.references.beta', 'DrawerBeta.hogan' )
	} );

	M.define( 'modules/references/ReferencesDrawerBeta', ReferencesDrawerBeta );
}( mw.mobileFrontend ) );
