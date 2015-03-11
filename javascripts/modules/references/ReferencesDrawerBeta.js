( function ( M, $ ) {
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
				tagName: 'a',
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
		template: mw.template.get( 'mobile.references.beta', 'DrawerBeta.hogan' ),
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var windowHeight = $( window ).height();

			ReferencesDrawer.prototype.postRender.apply( this, arguments );

			// make sure the drawer doesn't take up more than 50% of the viewport height
			if ( windowHeight / 2 < 400 ) {
				this.$el.css( 'max-height', windowHeight / 2 );
			}

			this.on( 'show', $.proxy( this, 'onShow' ) );
			this.on( 'hide', $.proxy( this, 'onHide' ) );
		},
		/**
		 * Make body not scrollable
		 */
		onShow: function () {
			$( 'body' ).addClass( 'drawer-enabled' );
		},
		/**
		 * Restore body scroll
		 */
		onHide: function () {
			$( 'body' ).removeClass( 'drawer-enabled' );
		}
	} );

	M.define( 'modules/references/ReferencesDrawerBeta', ReferencesDrawerBeta );
}( mw.mobileFrontend, jQuery ) );
