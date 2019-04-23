'use strict';
var Drawer = require( '../mobile.startup/Drawer' ),
	Button = require( '../mobile.startup/Button' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Icon = require( '../mobile.startup/Icon' ),
	util = require( '../mobile.startup/util' );

/**
 * This creates the drawer at the bottom of the screen that appears when a
 * blocked user tries to edit.
 * @class BlockReason
 * @extends Drawer
 */
function BlockMessage() {
	Drawer.apply( this, arguments );
}

mfExtend( BlockMessage, Drawer, {
	/**
	 * @memberof BlockMessage
	 * @instance
	 */
	defaults: util.extend( {}, Drawer.prototype.defaults, {
		stopHandIcon: new Icon( {
			name: 'stop-hand'
		} ).options,
		userIcon: new Icon( {
			tagName: 'span',
			name: 'profile'
		} ).options,
		okButton: new Button( {
			label: mw.msg( 'ok' ),
			tagName: 'button',
			progressive: true,
			additionalClassNames: 'cancel'
		} ).options,
		createDetailsAnchorHref: function () {
			return mw.util.getUrl( 'Special:BlockList', { wpTarget: '#' + this.blockId } );
		},
		createDetailsAnchorLabel: function () {
			return mw.msg( 'mobile-frontend-editor-blocked-drawer-help' );
		},
		createTitle: function () {
			return this.partial ? mw.msg( 'mobile-frontend-editor-blocked-drawer-title-partial' ) : mw.msg( 'mobile-frontend-editor-blocked-drawer-title' );
		},
		reasonHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-reason-header' ),
		creatorHeader: function () {
			// The gender is the subject (the blockee) not the object (the blocker).
			return mw.msg( 'mobile-frontend-editor-blocked-drawer-creator-header',
				this.user.options.gender || 'unknown' );
		},
		expiryHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-expiry-header' )
	} ),
	/**
	 * @memberof BlockMessage
	 * @instance
	 */
	templatePartials: util.extend( {}, Drawer.prototype.templatePartials, {
		button: Button.prototype.template,
		icon: Icon.prototype.template
	} ),
	/**
	 * @memberof BlockMessage
	 * @instance
	 */
	template: mw.template.get( 'mobile.editor.overlay', 'BlockMessage.hogan' )
} );

module.exports = BlockMessage;
