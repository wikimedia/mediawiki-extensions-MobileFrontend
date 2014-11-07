( function ( M, $ ) {
	var View = M.require( 'View' ), Checkbox,
		settings = M.require( 'settings' );

	/**
	 * Wrapper for checkboxes styled as in MediaWiki UI style guide
	 * @class Checkbox
	 * @extends View
	 */
	Checkbox = View.extend( {
		template: mw.template.get( 'mobile.special.mobileoptions.scripts', 'Checkbox.hogan' ),
		save: function () {
			settings.save( this.options.name, this.cb.prop( 'checked' ) ? 'true' : 'false', true );
		},
		postRender: function () {
			var cbview = this;
			this.cb = this.$( 'input[type=checkbox]' );
			this.cb.prop( 'checked', settings.get( this.options.name, true ) === 'true' );
			$( 'form.mw-mf-settings' ).on( 'submit', $.proxy( cbview, 'save' ) );
		}
	} );

	function initLocalStorageCheckboxes() {
		var saveLI = $( '#mw-mf-settings-save' ), cb;
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
