( function ( M, $ ) {
	var storage = mw.storage,
		notification,
		toast = M.require( 'mobile.startup/toast' ),
		EXPAND_SECTIONS_KEY = 'expandSections',
		msg = mw.msg,
		FONT_SIZE_KEY = 'userFontSize';

	/**
	 * Notifies the user that settings were asynchronously saved.
	 * @method
	 * @param {Boolean} isPending if set toast will show after page has been reloaded.
	 * @ignore
	 */
	function notify( isPending ) {
		if ( notification ) {
			clearTimeout( notification );
		}
		if ( isPending ) {
			toast.showOnPageReload( msg( 'mobile-frontend-settings-save' ) );
		} else {
			notification = setTimeout( function () {
				toast.show( msg( 'mobile-frontend-settings-save' ) );
			}, 1000 );
		}
	}
	/**
	 * Creates a label for use with a form input
	 * @method
	 * @ignore
	 * @param {String} heading
	 * @param {String} description
	 * @return {OO.ui.LabelWidget}
	 */
	function createLabel( heading, description ) {
		var $label = $( '<div>' );
		$label.append( $( '<strong>' ).text( heading ) );
		$label.append(
			$( '<div class="option-description">' )
				.text( description )
		);

		return new OO.ui.LabelWidget( {
			label: $label
		} );
	}

	/**
	 * Adds a font changer field to the form
	 * @method
	 * @param {jQuery.Object} $form
	 * @ignore
	 */
	function addFontChangerToForm( $form ) {
		var fontChanger, fontChangerDropdown,
			currentFontSize = storage.get( FONT_SIZE_KEY );

		fontChangerDropdown = new OO.ui.DropdownInputWidget( {
			value: currentFontSize ? parseInt( currentFontSize, 10 ) : 100,
			options: [
				{
					data: 90,
					label: msg( 'mobile-frontend-fontchanger-option-small' )
				},
				{
					data: 100,
					label: msg( 'mobile-frontend-fontchanger-option-medium' )
				},
				{
					data: 120,
					label: msg( 'mobile-frontend-fontchanger-option-large' )
				},
				{
					data: 140,
					label: msg( 'mobile-frontend-fontchanger-option-xlarge' )
				}
			]
		} );
		fontChanger = new OO.ui.FieldLayout(
			fontChangerDropdown,
			{
				label: createLabel( mw.msg( 'mobile-frontend-fontchanger-link' ),
					mw.msg( 'mobile-frontend-fontchanger-desc' ) ).$element
			}
		);
		fontChangerDropdown.on( 'change', function ( value ) {
			storage.set( FONT_SIZE_KEY, value );
			notify();
		} );

		fontChanger.$element.prependTo( $form );
	}

	/**
	 * Adds an expand all sections field to the form
	 * @param {jQuery.Object} $form
	 * @ignore
	 * @method
	 */
	function addExpandAllSectionsToForm( $form ) {
		var cb, cbField;

		cb = new OO.ui.CheckboxInputWidget( {
			name: EXPAND_SECTIONS_KEY,
			selected: storage.get( EXPAND_SECTIONS_KEY ) === 'true'
		} );
		cbField = new OO.ui.FieldLayout(
			cb,
			{
				label: createLabel(
					mw.msg( 'mobile-frontend-expand-sections-status' ),
					mw.msg( 'mobile-frontend-expand-sections-description' )
				).$element
			}
		);
		cb.on( 'change', function () {
			storage.set( EXPAND_SECTIONS_KEY, this.isSelected() ? 'true' : 'false' );
			notify();
		}.bind( cb ) );

		cbField.$element.prependTo( $form );
	}

	/**
	 * Add features, that depends on localStorage, such as "exapnd all sections" or "fontchanger".
	 * The checkbox is used for turning on/off expansion of all sections on page load.
	 * @method
	 * @ignore
	 */
	function initLocalStorageElements() {
		var
			enableToggle = OO.ui.infuse( $( '#enable-beta-toggle' ) ),
			$form = $( '#mobile-options' );

		enableToggle.on( 'change', function () {
			notify( true );
			$form.submit();
		} );

		if ( mw.config.get( 'wgMFExpandAllSectionsUserOption' ) ) {
			addExpandAllSectionsToForm( $form );
		}

		if ( mw.config.get( 'wgMFEnableFontChanger' ) ) {
			addFontChangerToForm( $form );
		}
	}

	mw.loader.using( 'oojs-ui-widgets' ).then( initLocalStorageElements );
}( mw.mobileFrontend, jQuery ) );
