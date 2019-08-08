/* global $, OO */
var storage = mw.storage,
	browser = require( './mobile.startup/Browser' ).getSingleton(),
	toast = require( './mobile.startup/toast' ),
	amcOutreach = require( './mobile.startup/amcOutreach/amcOutreach' ),
	EXPAND_SECTIONS_KEY = 'expandSections',
	msg = mw.msg,
	FONT_SIZE_KEY = 'userFontSize';

/**
 * Notifies the user that settings were asynchronously saved.
 * @param {boolean} [isPending] if set toast will show after page has been reloaded.
 */
function notify( isPending ) {
	if ( isPending ) {
		toast.showOnPageReload( msg( 'mobile-frontend-settings-save' ) );
	} else {
		toast.show( msg( 'mobile-frontend-settings-save' ) );
	}
}
/**
 * Creates a label for use with a form input
 * @param {string} heading
 * @param {string} description
 * @return {OO.ui.LabelWidget}
 */
function createLabel( heading, description ) {
	var $label = $( '<div>' );
	$label.append( $( '<strong>' ).text( heading ) );
	$label.append(
		$( '<div>' )
			.addClass( 'option-description' )
			.text( description )
	);

	return new OO.ui.LabelWidget( {
		label: $label
	} );
}

/**
 * Adds a font changer field to the form
 * @param {jQuery.Object} $form
 */
function addFontChangerToForm( $form ) {
	var fontChanger, fontChangerDropdown,
		currentFontSize = storage.get( FONT_SIZE_KEY );

	fontChangerDropdown = new OO.ui.DropdownInputWidget( {
		value: currentFontSize || 'regular',
		options: [
			{
				data: 'small',
				label: msg( 'mobile-frontend-fontchanger-option-small' )
			},
			{
				data: 'regular',
				label: msg( 'mobile-frontend-fontchanger-option-medium' )
			},
			{
				data: 'large',
				label: msg( 'mobile-frontend-fontchanger-option-large' )
			},
			{
				data: 'x-large',
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
 */
function addExpandAllSectionsToForm( $form ) {
	var cb, cbField;

	cb = new OO.ui.ToggleSwitchWidget( {
		name: EXPAND_SECTIONS_KEY,
		value: storage.get( EXPAND_SECTIONS_KEY ) === 'true'
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
	cb.on( 'change', function ( value ) {
		storage.set( EXPAND_SECTIONS_KEY, value ? 'true' : 'false' );
		notify();
	} );

	cbField.$element.prependTo( $form );
}

/**
 * Helper method to infuse checkbox elements with OO magic
 * Additionally it applies all known hacks to make it mobile friendly
 *
 * @param {Object[]} toggleObjects an array of toggle objects to infuse
 * @param {jQuery.Object} $form form to submit when there is interaction with toggle
 */
function infuseToggles( toggleObjects, $form ) {
	toggleObjects.forEach( function ( toggleObject ) {
		var
			$toggleElement = toggleObject.$el,
			toggleSwitch,
			enableToggle,
			$checkbox;

		enableToggle = OO.ui.infuse( $toggleElement );
		$checkbox = enableToggle.$element;

		toggleSwitch = new OO.ui.ToggleSwitchWidget( {
			value: enableToggle.isSelected()
		} );
		// Strangely the ToggleSwitchWidget does not behave as an input so any change
		// to it is not reflected in the form. (see T182466)
		// Ideally we'd replaceWith here and not have to hide the original element.
		toggleSwitch.$element.insertAfter( $checkbox );
		// although the checkbox is hidden already, that is done via visibility
		// as a result, it still takes up space. We don't want it to any more now that the
		// new toggle switch has been added.
		$checkbox.hide();

		// listening on checkbox change is required to make the clicking on label working.
		// Otherwise clicking on label changes the checkbox "checked" state
		// but it's not reflected in the toggle switch
		$checkbox.on( 'change', function () {
			// disable checkbox as submit is delayed by 0.25s
			$checkbox.attr( 'disabled', true );
			toggleSwitch.setValue( enableToggle.isSelected() );
		} );
		toggleSwitch.on( 'change', function ( value ) {
			// execute callback
			toggleObject.onToggle( value );

			// ugly hack, we're delaying submit form by 0.25s
			// and we want to disable registering clicks
			// we want to disable the toggleSwitch
			// but we cannot use setDisabled(true) as it makes button gray
			toggleSwitch.setValue = function () {};

			$checkbox.find( 'input' )
				.prop( 'checked', value );
			notify( true );
			// On some Android devices animation gets stuck in the middle as browser
			// starts submitting the form.
			// Let's call submit on the form after toggle button transition is done
			// (0.25s, defined in OOUI)
			setTimeout( function () {
				$form.trigger( 'submit' );
			}, 250 );
		} );
	} );
}

/**
 * Add features, that depends on localStorage, such as "expand all sections" or "fontchanger".
 * The checkbox is used for turning on/off expansion of all sections on page load.
 */
function initMobileOptions() {
	var $form = $( '#mobile-options' ),
		betaToggle = $( '#enable-beta-toggle' ),
		amcToggle = $( '#enable-amc-toggle' ),
		toggles = [];

	if ( betaToggle.length ) {
		toggles.push( {
			$el: betaToggle,
			onToggle: function () {}
		} );
	}
	if ( amcToggle.length ) {
		toggles.push( {
			$el: amcToggle,
			onToggle: function ( value ) {
				if ( !value && amcOutreach.loadCampaign().isCampaignActive() ) {
					// Make all amc outreach actions ineligible so the user doesn't have
					// to see the outreach drawer again
					amcOutreach.loadCampaign().makeAllActionsIneligible();
				}
			}
		} );
	}
	infuseToggles( toggles, $form );

	if (
		// Don't show this option on large screens since it's only honored for small screens.
		// This logic should be kept in sync with Toggle._enable().
		!browser.isWideScreen()
	) {
		addExpandAllSectionsToForm( $form );
	}

	if ( mw.config.get( 'wgMFEnableFontChanger' ) ) {
		addFontChangerToForm( $form );
	}
}

mw.loader.using( 'oojs-ui-widgets' ).then( initMobileOptions );
