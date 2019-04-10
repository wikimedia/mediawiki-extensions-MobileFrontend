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
	 * @inheritdoc
	 * @memberof BlockMessage
	 * @instance
	 */
	onShowDrawer: function () {
		var wiki = mw.config.get( 'wgDBname' );

		Drawer.prototype.onShowDrawer.apply( this );

		if ( mw.config.get( 'wgEnableBlockNoticeStats' ) ) {
			mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.shown', 1 );
		}
	},
	/**
	 * @memberof BlockMessage
	 * @instance
	 */
	template: util.template( `
{{#collapseIcon}}{{>icon}}{{/collapseIcon}}
<div class="block-message">
  <div class="block-message-icon">
    {{#stopHandIcon}}{{>icon}}{{/stopHandIcon}}
  </div>
  <div class="block-message-info">
    <div class="block-message-item block-message-title">
      <h5>{{ createTitle }}</h5>
    </div>
    <div class="block-message-data">
      {{#reason}}
        <div class="block-message-item">
          <h6>{{ reasonHeader }}</h6>
          <div><strong>{{{ reason }}}</strong></div>
        </div>
      {{/reason}}
      <div class="block-message-item block-message-creator">
        <h6>{{ creatorHeader }}</h6>
        <div><strong><a href="{{ creator.url }}">{{#userIcon}}{{>icon}}{{/userIcon}}{{ creator.name }}</a></strong></div>
      </div>
      {{#expiry}}
        <div class="block-message-item">
          <h6>{{ expiryHeader }}</h6>
          <div><strong>{{#duration}}{{ duration }} / {{/duration}}{{ expiry }}</strong></div>
        </div>
      {{/expiry}}
    </div>
    <div class="block-message-item block-message-buttons">
      {{#okButton}}
        {{>button}}
      {{/okButton}}
      <a href="{{ createDetailsAnchorHref }}">{{ createDetailsAnchorLabel }}</a>
    </div>
  </div>
</div>
	` )
} );

module.exports = BlockMessage;
