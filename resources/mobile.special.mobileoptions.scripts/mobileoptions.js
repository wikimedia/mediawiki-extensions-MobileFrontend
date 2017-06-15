( function ( M, $ ) {
	var View = M.require( 'mobile.startup/View' );

	/**
	 * Wrapper for checkboxes styled as in MediaWiki UI style guide
	 * @class Checkbox
	 * @extends View
	 */
	function Checkbox() {
		View.apply( this, arguments );
	}

	OO.mfExtend( Checkbox, View, {
		template: mw.template.get( 'mobile.special.mobileoptions.scripts', 'Checkbox.hogan' ),
		/**
		 * Save the current state of the checkbox to the storage
		 * @method
		 */
		save: function () {
			mw.storage.set( this.options.name, this.cb.prop( 'checked' ) ? 'true' : 'false' );
		},
		/** @inheritdoc */
		postRender: function () {
			var cbview = this;
			this.cb = this.$( 'input[type=checkbox]' );
			this.cb.prop( 'checked', mw.storage.get( this.options.name ) === 'true' );
			$( 'form.mw-mf-settings' ).on( 'submit', $.proxy( cbview, 'save' ) );
		}
	} );

	/**
	 * Add features, that depends on localStorage, such as "exapnd all sections" or "fontchanger".
	 * The checkbox is used for turning on/off expansion of all sections on page load.
	 * @method
	 */
	function initLocalStorageElements() {
		var cb,
			saveLI = $( '#mw-mf-settings-save' );

		if ( mw.config.get( 'wgMFExpandAllSectionsUserOption' ) ) {
			cb = new Checkbox( {
				name: 'expandSections',
				label: mw.msg( 'mobile-frontend-expand-sections-status' ),
				description: mw.msg( 'mobile-frontend-expand-sections-description' )
			} );
			cb.insertBefore( saveLI );
		}
	}

	$( initLocalStorageElements );
}( mw.mobileFrontend, jQuery ) );
