( function ( M, $ ) {
	var View = M.require( 'mobile.view/View' ),
		Button = M.require( 'mobile.startup/Button' ),
		settings = M.require( 'mobile.settings/settings' );

	/**
	 * FontChanger wrapper
	 * @class FontChanger
	 * @extends View
	 */
	function FontChanger() {
		View.apply( this, arguments );
	}

	OO.mfExtend( FontChanger, View, {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Object} defaults.viewLink Anchor options for a link to wikidata page.
		*/
		defaults: {
			plusButton: new Button( {
				progressive: true,
				additionalClassNames: 'fontchanger plus',
				label: '+'
			} ).options,
			minusButton: new Button( {
				progressive: true,
				additionalClassNames: 'fontchanger minus',
				label: '-'
			} ).options,
			valueButton: new Button( {
				additionalClassNames: 'fontchanger-value',
				label: '100%'
			} ).options
		},
		/** @inheritdoc */
		template: mw.template.get( 'mobile.fontchanger', 'FontChanger.hogan' ),
		/** @inheritdoc */
		templatePartials: {
			button: Button.prototype.template
		},
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

	M.define( 'mobile.fontchanger/FontChanger', FontChanger );

}( mw.mobileFrontend, jQuery ) );
