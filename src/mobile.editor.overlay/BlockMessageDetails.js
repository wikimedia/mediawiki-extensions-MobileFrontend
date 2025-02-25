/* global $ */

'use strict';
const mobile = require( 'mobile.startup' );
const Button = mobile.Button,
	View = mobile.View,
	Icon = mobile.Icon,
	util = mobile.util;

const blockMessageUtils = {
	/**
	 * @param {Object} options
	 * @return {BlockMessageOptions}
	 */
	makeTemplateOptions( options ) {
		return Object.assign( {}, options, {
			createDetailsAnchorHref: () => ( blockId, render ) => mw.util.getUrl(
				'Special:BlockList', { wpTarget: '#' + render( blockId ) }
			),
			createDetailsAnchorLabel: () => mw.msg( 'mobile-frontend-editor-blocked-drawer-help' ),
			createTitle: () => {
				let msgKey = 'mobile-frontend-editor-blocked-drawer-title';
				if ( mw.user.isAnon() ) {
					msgKey += '-ip';
				}
				if ( options.partial ) {
					msgKey += '-partial';
				}
				// The following messages can be passed here:
				// * mobile-frontend-editor-blocked-drawer-title
				// * mobile-frontend-editor-blocked-drawer-title-partial
				// * mobile-frontend-editor-blocked-drawer-title-ip
				// * mobile-frontend-editor-blocked-drawer-title-ip-partial
				return mw.msg( msgKey );
			},
			createBody: () => {
				let msgKey = '';
				if ( mw.user.isAnon() && options.anonOnly ) {
					msgKey = 'mobile-frontend-editor-blocked-drawer-body';
					if ( options.noCreateAccount ) {
						msgKey += '-login';
					} else {
						msgKey += '-login-createaccount';
					}
					if ( options.partial ) {
						msgKey += '-partial';
					}
				} else {
					if ( options.partial ) {
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
			creatorHeader: () => mw.msg(
				'mobile-frontend-editor-blocked-drawer-creator-header',
				// The gender is the subject (the blockee) not the object (the blocker).
				mw.user.options.get( 'gender' )
			),
			expiryHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-expiry-header' )
		} );
	},

	/**
	 * Configure the call to action depending on the type of block.
	 *
	 * @param {BlockMessageOptions} options
	 * @return {Object} Configuration options for Button element
	 */
	getButtonConfig( options ) {
		let cta = true;
		const config = {
				progressive: true
			},
			wiki = mw.config.get( 'wgDBname' );

		if ( mw.user.isAnon() && options.anonOnly ) {
			// The user can avoid the block by logging in
			config.label = mw.msg( 'mobile-frontend-editor-blocked-drawer-action-login' );
			config.href = new mw.Title( 'Special:UserLogin' ).getUrl();
		} else if ( options.partial ) {
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
			mw.track( 'stats.mediawiki_block_notices_total', 1, {
				source: 'MobileFrontend',
				action: 'ctaShown',
				wiki
			} );
			config.events = {
				click() {
					mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.ctaClicked', 1 );
					mw.track( 'stats.mediawiki_block_notices_total', 1, {
						source: 'MobileFrontend',
						action: 'ctaClicked',
						wiki
					} );
				}
			};
		}

		return config;
	},

	/**
	 * Creates the block message details element.
	 *
	 * @param {Element} child
	 * @param {BlockMessageOptions} options
	 * @return {Element[]}
	 */
	makeChildren( child, options ) {
		const $child = $( child );
		$child.find( '.block-message-buttons' ).prepend(
			new Button( this.getButtonConfig( options ) ).$el
		);
		$child.find( '.block-message-icon' ).prepend(
			( new Icon( {
				icon: 'block-destructive'
			} ) ).$el
		);

		if ( options.parsedReason instanceof Promise ) {
			options.parsedReason.then( ( htmlReason ) => {
				$child.find( '.block-message-reason div' ).html( htmlReason );
			} );
		}

		// Move all children
		return Array.from( $child.children() );
	}
};

const template = util.template( `<div>
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

/**
 * @param {BlockMessageOptions} options
 * @return {View}
 */
module.exports = {
	factory: ( options ) => {
		const blockMessageOptions = blockMessageUtils.makeTemplateOptions( options );
		const view = template.render( blockMessageOptions );

		return View.make(
			Object.assign(
				options,
				{
					className: 'block-message block-message-container'
				}
			),
			blockMessageUtils.makeChildren( view, blockMessageOptions )
		);
	}
};
