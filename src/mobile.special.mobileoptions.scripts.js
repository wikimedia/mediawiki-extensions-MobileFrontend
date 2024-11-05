/* global $ */
/* See T354224 for information on the @wikimedia/mediawiki.skins.clientpreferences module. */
const clientPrefs = require( '@wikimedia/mediawiki.skins.clientpreferences' ),
	toast = require( './mobile.startup/showOnPageReload' ),
	amcOutreach = require( './mobile.startup/amcOutreach/amcOutreach' ),
	EXPAND_SECTIONS_KEY = 'mf-expand-sections',
	msg = mw.msg,
	USER_FONT_SIZE_SMALL = 'small',
	USER_FONT_SIZE_REGULAR = 'regular',
	USER_FONT_SIZE_LARGE = 'large',
	THEME = 'skin-theme',
	// FIXME: This value should be synced between back-end and front-end code,
	// but it's currently hard-coded because ResourceLoader virtual imports
	// i.e. require( './config.json') are incompatible with the
	// Webpack build. Requires updating to Webpack 5 and common.js magic comments.
	// https://webpack.js.org/configuration/module/#moduleparserjavascriptcommonjsmagiccomments
	// e.g: require(/* webpackIgnore: true */ './config.json');
	FONT_SIZE_KEY = 'mf-font-size';

/**
 * Notifies the user that settings were asynchronously saved.
 *
 * @private
 * @param {boolean} [isPending] if set toast will show after page has been reloaded.
 */
function notify( isPending ) {
	if ( isPending ) {
		toast.showOnPageReload( msg( 'mobile-frontend-settings-save' ) );
	} else {
		mw.notify( msg( 'mobile-frontend-settings-save' ) );
	}
}

let api;
/**
 * @ignore
 * @param {Object<string,string|number>} options
 * @return {JQuery.Promise<Object>}
 */
function saveOptions( options ) {
	api = api || new mw.Api();
	// @ts-ignore
	return api.saveOptions( options, {
		global: 'update'
	} );
}

/**
 * Adds a font changer field to the form
 *
 * @private
 * @param {jQuery.Object} $form
 * @param {Record<string,ClientPreference>} clientPreferences
 * @return {Promise<Node>}
 */
function addClientPreferencesToForm( $form, clientPreferences ) {
	const cp = document.createElement( 'div' );
	const id = 'mf-client-preferences';
	cp.id = id;
	$form.prepend( cp );
	return clientPrefs.render( `#${ id }`, clientPreferences, { saveOptions } );
}

/**
 * Helper method to infuse checkbox elements with OO magic
 * Additionally it applies all known hacks to make it mobile friendly
 *
 * @private
 * @param {Object[]} toggleObjects an array of toggle objects to infuse
 * @param {jQuery.Object} $form form to submit when there is interaction with toggle
 */
function infuseToggles( toggleObjects, $form ) {
	toggleObjects.forEach( ( toggleObject ) => {
		const $toggleElement = toggleObject.$el;
		const enableToggle = OO.ui.infuse( $toggleElement );
		const $checkbox = enableToggle.$element;
		const toggleSwitch = new OO.ui.ToggleSwitchWidget( {
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
		$checkbox.on( 'change', () => {
			// disable checkbox as submit is delayed by 0.25s
			$checkbox.attr( 'disabled', true );
			toggleSwitch.setValue( enableToggle.isSelected() );
		} );
		toggleSwitch.on( 'change', ( value ) => {
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
			setTimeout( () => {
				$form.trigger( 'submit' );
			}, 250 );
		} );
	} );
}

/**
 * Add features, that depends on localStorage, such as "expand all sections" or "fontchanger".
 * The checkbox is used for turning on/off expansion of all sections on page load.
 *
 * @private
 */
function initMobileOptions() {
	const $form = $( '#mobile-options' ),
		$betaToggle = $( '#enable-beta-toggle' ),
		$amcToggle = $( '#enable-amc-toggle' ),
		toggles = [];

	if ( $betaToggle.length ) {
		toggles.push( {
			$el: $betaToggle,
			onToggle: function () {}
		} );
	}
	if ( $amcToggle.length ) {
		toggles.push( {
			$el: $amcToggle,
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

	const clientPreferences = {};

	if ( mw.config.get( 'wgMFEnableFontChanger' ) ) {
		clientPreferences[ FONT_SIZE_KEY ] = {
			options: [
				USER_FONT_SIZE_SMALL,
				USER_FONT_SIZE_REGULAR,
				USER_FONT_SIZE_LARGE
			],
			preferenceKey: FONT_SIZE_KEY,
			callback: notify
		};
	}

	const skin = mw.config.get( 'skin' );
	clientPreferences[ THEME ] = {
		options: [ 'day', 'night', 'os' ],
		preferenceKey: `${ skin }-theme`
	};

	clientPreferences[ EXPAND_SECTIONS_KEY ] = {
		options: [
			'0',
			'1'
		],
		type: 'switch',
		preferenceKey: EXPAND_SECTIONS_KEY,
		callback: notify
	};

	if ( !mw.user.isAnon() ) {
		clientPreferences[ 'mw-mf-amc' ] = {
			options: [
				'0',
				'1'
			],
			type: 'switch',
			preferenceKey: 'mf_amc_optin',
			callback: () => location.reload()
		};
	}

	// Transport existing links to new layout.

	/**
	 * Currently toggle switches have duplicate headings and a description that is not
	 * part of the toggle switch layout.
	 * This works around this to retain the classic MobileFrontend layout for these
	 * controls.
	 * FIXME: This should be upstreamed to @wikimedia/mediawiki.skins.clientpreferences
	 *
	 * @param {jQuery} $node
	 */
	function modifyToggleSwitch( $node ) {
		// Move the description from the heading into the label.
		$node.find( '.skin-client-pref-description' )
			.appendTo( $node.find( '.cdx-toggle-switch__label' ) );
		// Drop the duplicate label.
		$node.find( '> label' ).remove();
	}

	addClientPreferencesToForm( $form, clientPreferences ).then( () => {
		// Make some modifications that are currently not supported by the Vector client preferences
		// Move the links from the server side preference into the row.
		$( '#amc-field .option-links' ).appendTo( '#skin-client-prefs-mw-mf-amc' );
		modifyToggleSwitch( $( '#skin-client-prefs-mf-expand-sections' ) );
		modifyToggleSwitch( $( '#skin-client-prefs-mw-mf-amc' ) );
		// Remove the server side rendered OOUI field.
		$( '#amc-field' ).remove();

	} );
}

if ( !window.QUnit ) {
	mw.loader.using( 'oojs-ui-widgets' ).then( initMobileOptions );
}

module.exports = {
	test: {
		addClientPreferencesToForm
	}
};
