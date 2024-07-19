const
	fakeToolbar = require( './fakeToolbar' ),
	IconButton = require( '../mobile.startup/IconButton' ),
	Overlay = require( '../mobile.startup/Overlay' );

/* global $ */

/**
 * Like loadingOverlay(), but with a fake editor toolbar instead of the spinner.
 *
 * @param {Function} afterShow Callback which runs after overlay is shown
 * @param {Function} afterHide Callback which runs after overlay is hidden
 * @param {Function} [loadBasicEditor] Callback for the "Use basic editor" button
 * @return {Overlay}
 */
function editorLoadingOverlay( afterShow, afterHide, loadBasicEditor ) {
	let timeout;
	const
		$fakeToolbar = fakeToolbar(),
		$loadBasicWrapper = $( '<div>' ).addClass( 've-loadbasiceditor' ),
		loadBasicButton = new IconButton( {
			label: mw.msg( 'mobile-frontend-editor-loadbasiceditor' ),
			action: 'progressive',
			weight: 'normal',
			size: 'medium',
			isIconOnly: false,
			icon: null
		} ),
		overlay = new Overlay( {
			className: 'overlay overlay-loading',
			noHeader: true,
			isBorderBox: false,
			onBeforeExit: function ( exit ) {
				exit();
				afterHide();
				if ( timeout ) {
					clearTimeout( timeout );
				}
			}
		} ),
		logFeatureUse = function ( feature, action ) {
			mw.track( 'visualEditorFeatureUse', {
				feature: feature,
				action: action,
				// eslint-disable-next-line camelcase
				editor_interface: 'visualeditor'
			} );
		};

	overlay.show = function () {
		Overlay.prototype.show.call( this );
		afterShow();
	};

	overlay.$el.find( '.overlay-content' ).append( $fakeToolbar );

	if ( loadBasicEditor ) {
		overlay.$el.find( '.overlay-content' ).append(
			$loadBasicWrapper.append(
				$( '<p>' ).text( mw.msg( 'mobile-frontend-editor-loadingtooslow' ) ),
				loadBasicButton.$el
			)
		);

		timeout = setTimeout( function () {
			$loadBasicWrapper.addClass( 've-loadbasiceditor-shown' );
			logFeatureUse( 'mobileVisualFallback', 'context-show' );
		}, 3000 );

		loadBasicButton.$el.on( 'click', function () {
			$loadBasicWrapper.removeClass( 've-loadbasiceditor-shown' );
			logFeatureUse( 'mobileVisualFallback', 'fallback-confirm' );
			loadBasicEditor();
		} );
	}

	// Animate the toolbar sliding into place.
	$fakeToolbar.addClass( 'toolbar-hidden' );
	setTimeout( function () {
		$fakeToolbar.addClass( 'toolbar-shown' );
		setTimeout( function () {
			$fakeToolbar.addClass( 'toolbar-shown-done' );
		}, 250 );
	} );

	return overlay;
}

module.exports = editorLoadingOverlay;
