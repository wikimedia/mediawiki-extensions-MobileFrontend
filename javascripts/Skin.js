( function ( M, $ ) {

	var Skin,
		browser = M.require( 'browser' ),
		View = M.require( 'View' );

	/**
	 * Representation of the current skin being rendered.
	 *
	 * @class Skin
	 * @extends View
	 * @uses Browser
	 */
	Skin = View.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Page} options.page page the skin is currently rendering
		 * @cfg {Array} options.tabletModules modules to load when in tablet
		 */
		defaults: {
			page: undefined,
			tabletModules: []
		},

		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			var self = this;

			this.page = options.page;
			this.name = options.name;
			this.tabletModules = options.tabletModules;
			View.prototype.initialize.apply( this, arguments );

			/**
			 * Tests current window size and if suitable loads styles and scripts specific for larger devices
			 *
			 * @method
			 * @ignore
			 */
			function loadWideScreenModules() {
				if ( browser.isWideScreen() ) {
					// Adjust screen for tablets
					if ( self.page.inNamespace( '' ) ) {
						mw.loader.using( self.tabletModules ).always( function () {
							self.off( '_resize' );
						} );
					}
				}
			}
			M.on( 'resize', $.proxy( this, 'emit', '_resize' ) );
			this.on( '_resize', loadWideScreenModules );
			this.emit( '_resize' );
		}
	} );

	M.define( 'Skin', Skin );

}( mw.mobileFrontend, jQuery ) );
