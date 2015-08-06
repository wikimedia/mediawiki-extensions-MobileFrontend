( function ( M, $ ) {
	var FontChanger,
		View = M.require( 'View' ),
		settings = M.require( 'settings' );

	/**
	 * FontChanger wrapper
	 * @class FontChanger
	 * @extends View
	 */
	FontChanger = View.extend( {
		/** @inheritdoc */
		template: mw.template.get( 'mobile.fontchanger', 'FontChanger.hogan' ),
		/**
		 * Save the actual font size setting.
		 * @method
		 */
		save: function () {
			settings.save( this.options.name, this.fontchanger.val(), true );
		},

		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var self = this;

			this.fontchanger = this.$( '.fontchanger-value' );
			this.changePlus = this.$( '.fontchanger.plus' );
			this.changeMinus = this.$( '.fontchanger.minus' );
			this.setPercentage( settings.get( this.options.name, true ) || 100 );

			this.fontchanger.on( 'click', function () {
					self.setPercentage( 100 );
					return false;
				} );

			this.changeMinus.on( 'click', function () {
				self.setPercentage( self.fontchanger.val() - 10 );
				return false;
			} );

			this.changePlus.on( 'click', function () {
				self.setPercentage( parseInt( self.fontchanger.val() ) + 10 );
				return false;
			} );
			$( 'form.mw-mf-settings' ).on( 'submit', $.proxy( this, 'save' ) );
		},

		/**
		 * Set a new percentage (doesn't change the value higher then 200% and lower then 10%)
		 * @param {Number} percentage New percentage value
		 */
		setPercentage: function ( percentage ) {
			// disallow changes under 10% and over 200%
			if ( percentage > 9 && percentage < 201 ) {
				this.fontchanger
					.text( percentage + '%' )
					.val( percentage );
			}
		}
	} );

	M.define( 'modules/fontchanger/FontChanger', FontChanger );

}( mw.mobileFrontend, jQuery ) );
