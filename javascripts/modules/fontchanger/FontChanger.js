( function ( M, $ ) {
	var FontChanger,
		Drawer = M.require( 'Drawer' ),
		Icon = M.require( 'Icon' ),
		settings = M.require( 'settings' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		uiSchema = new MobileWebClickTracking( {}, 'MobileWebUIClickTracking' );

	/**
	 * FontChanger wrapper
	 * @class FontChanger
	 * @extends Drawer
	 */
	FontChanger = Drawer.extend( {
		defaults: {
			cancelButton: new Icon( {
				name: 'cancel',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			descriptionMsg: mw.msg( 'mobile-frontend-fontchanger-desc' )
		},
		className: 'drawer position-fixed fontchanger',
		template: mw.template.get( 'mobile.fontchanger', 'FontChanger.hogan' ),
		// if the user wants to look at more then one text position, close the drawer only
		// with a click on the close button
		closeOnScroll: false,

		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			var enabled = 'mw-ui-progressive',
				userFontSize = settings.get( 'userFontSize', true );

			switch ( userFontSize ) {
				case '70':
					options.size1 = enabled;
					break;
				case '130':
					options.size3 = enabled;
					break;
				default:
					// default = 100
					options.size2 = enabled;
					break;
			}

			Drawer.prototype.initialize.apply( this, arguments );
		},

		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var self = this;

			Drawer.prototype.postRender.apply( this, arguments );

			// set handler for clicks on the size buttons
			this.$( '.sizes' ).find( 'div' ).each( function () {
				var $el = $( this );

				$el.on( 'click', function () {
					self.setNewSize( $el );

					uiSchema.log( {
						name: 'fontchanger-font-change'
					} );
				} );
			} );
		},

		/**
		 * Set a new font size and change the drawer content
		 * @param {jQuery.Object} $el Clicked font size element
		 */
		setNewSize: function ( $el ) {
			var fontSize = $el.data( 'size' );

			// save and change the new font size
			settings.save( 'userFontSize', fontSize, true );
			$( '.content' ).css( 'font-size', fontSize + '%' );

			// update drawer
			this.$( '.sizes' ).find( 'div' ).each( function () {
				$( this ).removeClass( 'mw-ui-progressive' );
			} );
			// add class to actual used size
			$el.addClass( 'mw-ui-progressive' );
		}
	} );

	M.define( 'modules/fontchanger/FontChanger', FontChanger );

}( mw.mobileFrontend, jQuery ) );
