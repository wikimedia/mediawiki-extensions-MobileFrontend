( function ( M ) {
	'use strict';

	var Drawer = M.require( 'mobile.startup/Drawer' ),
		Button = M.require( 'mobile.startup/Button' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		util = M.require( 'mobile.startup/util' );

	/**
	 * This creates the drawer at the bottom of the screen that appears when a
	 * blocked user tries to edit.
	 * @class BlockReason
	 * @extends Drawer
	 */
	function BlockMessage() {
		Drawer.apply( this, arguments );
	}

	OO.mfExtend( BlockMessage, Drawer, {
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
			title: mw.msg( 'mobile-frontend-editor-blocked-drawer-title' ),
			reasonHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-reason-header' ),
			creatorHeader: function () {
				return mw.msg( 'mobile-frontend-editor-blocked-drawer-creator-header',
					this.creator.gender || 'unknown' );
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

	M.define( 'mobile.editor.overlay/BlockMessage', BlockMessage );

}( mw.mobileFrontend ) );
