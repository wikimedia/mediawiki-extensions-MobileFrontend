( function( M, $ ) {
	var View = M.require( 'View' ), Checkbox;

	function supportsTouchEvents() {
		return 'ontouchstart' in window;
	}

	function enhanceCheckboxes() {

		function clickChkBox() {
			var $parent = $( this ),
				box = $parent.children( 'input' )[ 0 ];

			if ( $parent.hasClass( 'checked' ) ) {
				$parent.removeClass( 'checked' );
				box.checked = false;
			} else {
				$parent.addClass( 'checked' );
				box.checked = true;
			}
		}

		$( '.mw-mf-checkbox-css3 > input[type=checkbox]' ).each( function( i, el ) {
			var $parent = $( el ).parent(),
				eventName = supportsTouchEvents() ? 'touchstart' : 'click';
			$parent.on( eventName, clickChkBox );
			if ( el.checked ) {
				$parent.addClass( 'checked ');
			}
		} );
	}

	Checkbox = View.extend( {
		template: M.template.get( 'specials/mobileoptions/checkbox.hogan' ),
		tagName: 'li',
		defaults: {
			onMsg: mw.msg( 'mobile-frontend-on' ),
			offMsg: mw.msg( 'mobile-frontend-off' ),
		},
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
		var saveLI = $( '#mw-mf-settings-save' ).parent(), cb;
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
	$( enhanceCheckboxes );
}( mw.mobileFrontend, jQuery ) );
