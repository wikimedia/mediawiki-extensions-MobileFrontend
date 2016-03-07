( function ( M, $ ) {
	var Drawer = M.require( 'mobile.drawers/Drawer' ),
		icons = M.require( 'mobile.startup/icons' ),
		Icon = M.require( 'mobile.startup/Icon' );

	/**
	 * Drawer for references
	 * @class ReferencesDrawer
	 * @extends Drawer
	 * @uses Icon
	 */
	function ReferencesDrawer() {
		Drawer.apply( this, arguments );
	}

	OO.mfExtend( ReferencesDrawer, Drawer, {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelButton HTML of the button that closes the drawer.
		 * @cfg {Boolean} defaults.error whether an error message is being shown
		 */
		defaults: $.extend( {}, Drawer.prototype.defaults, {
			spinner: icons.spinner().toHtmlString(),
			cancelButton: new Icon( {
				name: 'close-gray',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			citation: new Icon( {
				name: 'citation',
				additionalClassNames: 'text',
				hasText: true,
				label: mw.msg( 'mobile-frontend-references-citation' )
			} ).toHtmlString()
		} ),
		events: {
			'click sup a': 'showNestedReference'
		},
		/** @inheritdoc */
		show: function () {
			return Drawer.prototype.show.apply( this, arguments );
		},
		className: 'drawer position-fixed text references',
		template: mw.template.get( 'mobile.references', 'Drawer.hogan' ),
		/**
		 * @inheritdoc
		 */
		closeOnScroll: false,
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var windowHeight = $( window ).height();

			Drawer.prototype.postRender.apply( this );

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
		},
		/**
		 * Fetch and render nested reference upon click
		 * @param {String} id of the reference to be retrieved
		 * @param {Page} page to locate reference for
		 * @param {String} refNumber the number it identifies as in the page
		 */
		showReference: function ( id, page, refNumber ) {
			var drawer = this;

			// Save the page in case we have to show a nested reference.
			this.options.page = page;
			this.options.gateway.getReference( id, page ).done( function ( reference ) {
				drawer.render( {
					title: refNumber,
					text: reference.text
				} );
			} ).fail( function () {
				drawer.render( {
					error: true,
					title: refNumber,
					text: mw.msg( 'mobile-frontend-references-citation-error' )
				} );
			} );
		},
		/**
		 * Fetch and render nested reference upon click
		 * @param {jQuery.Event} ev
		 */
		showNestedReference: function ( ev ) {
			var $dest = $( ev.target );

			this.showReference( $dest.attr( 'href' ), this.options.page, $dest.text() );
			// Don't hide the already shown drawer via propagation and stop default scroll behaviour.
			return false;
		}
	} );

	M.define( 'mobile.references/ReferencesDrawer', ReferencesDrawer );
}( mw.mobileFrontend, jQuery ) );
