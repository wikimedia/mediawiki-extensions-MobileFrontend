( function ( M, $ ) {
	var Checkbox,
		View = M.require( 'View' ),
		settings = M.require( 'settings' );

	/**
	 * Wrapper for checkboxes styled as in MediaWiki UI style guide
	 * @class Checkbox
	 * @extends View
	 */
	Checkbox = View.extend( {
		template: mw.template.get( 'mobile.special.mobileoptions.scripts', 'Checkbox.hogan' ),
		/**
		 * Save the current state of the checkbox to the settings
		 * @method
		 */
		save: function () {
			settings.save( this.options.name, this.cb.prop( 'checked' ) ? 'true' : 'false', true );
		},
		/** @inheritdoc */
		postRender: function () {
			var cbview = this;
			this.cb = this.$( 'input[type=checkbox]' );
			this.cb.prop( 'checked', settings.get( this.options.name, true ) === 'true' );
			$( 'form.mw-mf-settings' ).on( 'submit', $.proxy( cbview, 'save' ) );
		}
	} );

	/**
	 * Add a new 'expand sections' checkbox in alpha.
	 * The checkbox is used for turning on/off expansion of all sections on page load.
	 * @method
	 */
	function initLocalStorageCheckboxes() {
		var cb,
			saveLI = $( '#mw-mf-settings-save' );

		if ( M.isAlphaGroupMember() ) {
			cb = new Checkbox( {
				name: 'expandSections',
				enableMsg: mw.msg( 'mobile-frontend-expand-sections-status' ),
				descriptionMsg: mw.msg( 'mobile-frontend-expand-sections-description' )
			} );
			cb.insertBefore( saveLI );
		}
	}

	$( initLocalStorageCheckboxes );
}( mw.mobileFrontend, jQuery ) );
