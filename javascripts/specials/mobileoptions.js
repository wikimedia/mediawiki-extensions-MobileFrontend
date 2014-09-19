( function( M, $ ) {
	var View = M.require( 'View' ), Checkbox;

	Checkbox = View.extend( {
		template: M.template.get( 'specials/mobileoptions/checkbox.hogan' ),
		save: function() {
			M.settings.saveUserSetting( this.options.name, this.cb.prop( 'checked' ) ? 'true' : 'false', true );
		},
		postRender: function() {
			var cbview = this;
			this.cb = this.$( 'input[type=checkbox]' );
			this.cb.prop( 'checked', M.settings.getUserSetting( this.options.name, true ) === 'true' );
			$( 'form.mw-mf-settings' ).on( 'submit', function() { cbview.save(); } );
		},
	} );

	function initLocalStorageCheckboxes() {
		var saveLI = $( '#mw-mf-settings-save' ), cb;
		if ( M.isAlphaGroupMember() ) {
			cb = new Checkbox( {
				name: 'expandSections',
				enableMsg: mw.msg( 'mobile-frontend-expand-sections-status' ),
				descriptionMsg: mw.msg( 'mobile-frontend-expand-sections-description' ),
			} );
			cb.insertBefore( saveLI );
		}
	}

	$( initLocalStorageCheckboxes );
}( mw.mobileFrontend, jQuery ) );
