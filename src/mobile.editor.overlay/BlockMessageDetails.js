'use strict';
const Button = require( '../mobile.startup/Button' ),
	View = require( '../mobile.startup/View' ),
	Icon = require( '../mobile.startup/Icon' ),
	util = require( '../mobile.startup/util' );

/**
 * @extends View
 */
class BlockMessageDetails extends View {
	/** @inheritdoc */
	get isTemplateMode() {
		return true;
	}
	/**
	 * @inheritdoc
	 */
	get defaults() {
		return {
			createDetailsAnchorHref: function () {
				return function ( blockId, render ) {
					return mw.util.getUrl( 'Special:BlockList', { wpTarget: '#' + render( blockId ) } );
				};
			},
			createDetailsAnchorLabel: function () {
				return mw.msg( 'mobile-frontend-editor-blocked-drawer-help' );
			},
			createTitle: function () {
				let msgKey = 'mobile-frontend-editor-blocked-drawer-title';
				if ( mw.user.isAnon() ) {
					msgKey += '-ip';
				}
				if ( this.partial ) {
					msgKey += '-partial';
				}
				// The following messages can be passed here:
				// * mobile-frontend-editor-blocked-drawer-title
				// * mobile-frontend-editor-blocked-drawer-title-partial
				// * mobile-frontend-editor-blocked-drawer-title-ip
				// * mobile-frontend-editor-blocked-drawer-title-ip-partial
				return mw.msg( msgKey );
			},
			createBody: function () {
				let msgKey = '';
				if ( mw.user.isAnon() && this.anonOnly ) {
					msgKey = 'mobile-frontend-editor-blocked-drawer-body';
					if ( this.noCreateAccount ) {
						msgKey += '-login';
					} else {
						msgKey += '-login-createaccount';
					}
					if ( this.partial ) {
						msgKey += '-partial';
					}
				} else {
					if ( this.partial ) {
						msgKey = 'mobile-frontend-editor-blocked-drawer-body-partial';
					}
				}
				// The following messages can be passed here:
				// * mobile-frontend-editor-blocked-drawer-body-partial
				// * mobile-frontend-editor-blocked-drawer-body-login
				// * mobile-frontend-editor-blocked-drawer-body-login-partial
				// * mobile-frontend-editor-blocked-drawer-body-login-createaccount
				// * mobile-frontend-editor-blocked-drawer-body-login-createaccount-partial
				return msgKey ? mw.msg( msgKey ) : msgKey;
			},
			seeMoreLink: mw.msg( 'mobile-frontend-editor-blocked-drawer-body-link' ),
			reasonHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-reason-header' ),
			creatorHeader: function () {
				// The gender is the subject (the blockee) not the object (the blocker).
				return mw.msg( 'mobile-frontend-editor-blocked-drawer-creator-header',
					mw.user.options.get( 'gender' ) );
			},
			expiryHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-expiry-header' )
		};
	}
	/**
	 * Configure the call to action depending on the type of block.
	 *
	 * @return {Object} Configuration options
	 */
	getButtonConfig() {
		let cta = true;
		const config = {
				progressive: true
			},
			wiki = mw.config.get( 'wgDBname' );

		if ( mw.user.isAnon() && this.options.anonOnly ) {
			// The user can avoid the block by logging in
			config.label = mw.msg( 'mobile-frontend-editor-blocked-drawer-action-login' );
			config.href = new mw.Title( 'Special:UserLogin' ).getUrl();
		} else if ( this.options.partial ) {
			// The user can avoid the block by editing a different page
			config.label = mw.msg( 'mobile-frontend-editor-blocked-drawer-action-randompage' );
			config.href = new mw.Title( 'Special:Random' ).getUrl();
			config.quiet = true;
		} else {
			// The user cannot avoid the block
			config.tagName = 'button';
			config.label = mw.msg( 'mobile-frontend-editor-blocked-drawer-action-ok' );
			config.additionalClassNames = 'cancel';
			cta = false;
		}

		if ( cta && mw.config.get( 'wgMFTrackBlockNotices' ) ) {
			mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.ctaShown', 1 );
			config.events = {
				click: function () {
					mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.ctaClicked', 1 );
				}
			};
		}

		return config;
	}
	/**
	 * @inheritdoc
	 */
	postRender() {
		const drawer = this;
		this.$el.find( '.block-message-buttons' ).prepend(
			new Button( this.getButtonConfig() ).$el
		);
		this.$el.find( '.block-message-icon' ).prepend(
			( new Icon( {
				name: 'block-destructive',
				additionalClassNames: 'mw-ui-icon-flush-top'
			} ) ).$el
		);
		this.options.parsedReason.then( function ( htmlReason ) {
			drawer.$el.find( '.block-message-reason div' ).html( htmlReason );
		} );
	}
	/**
	 * @inheritdoc
	 */
	get template() {
		return util.template( `
<div class="block-message block-message-container">
  <div class="block-message-icon"></div>
  <div class="block-message-info">
    <div class="block-message-item block-message-title">
      <h5>{{ createTitle }}</h5>
    </div>
    <div class="block-message-data">
      <div class="block-message-item">
        <p>
          {{ createBody }}
          <a class ="block-message-see-more" href="#">{{ seeMoreLink }}</a>
        </p>
      </div>
      <div class="block-message-item block-message-creator">
        {{#creator.name}}
          <p>
            {{ creatorHeader }}
            <strong>
              {{#creator.url}}
                <a href="{{ creator.url }}">{{ creator.name }}</a>
              {{/creator.url}}
              {{^creator.url}}
                {{ creator.name }}
              {{/creator.url}}
            </strong>
          </p>
        {{/creator.name}}
      </div>
      {{#duration}}
        <div class="block-message-item">
          <p>
            {{ expiryHeader }}
            <strong>{{ duration }}</strong>
          </p>
        </div>
      {{/duration}}
      {{#blockId}}
        <div class="block-message-item">
          <a href="{{#createDetailsAnchorHref}}{{ blockId }}{{/createDetailsAnchorHref}}">
            {{ createDetailsAnchorLabel }}
          </a>
        </div>
      {{/blockId}}
    </div>
  </div>
  {{#reason}}
    <div class="block-message-item block-message-reason">
      <h5>{{ reasonHeader }}</h5>
      <div><p>{{{ reason }}}</p></div>
    </div>
  {{/reason}}
  <div class="block-message-buttons">
  </div>
</div>` );
	}
}

module.exports = BlockMessageDetails;
