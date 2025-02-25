const blockMessageDetails = require( './BlockMessageDetails.js' );
const mobile = require( 'mobile.startup' );
const Drawer = mobile.Drawer;

/**
 * @private
 * @typedef {Object} BlockMessageOptions
 * @property {number} blockId representing the block
 * @property {boolean} partial is this a partial block?
 * @property {Object} creator
 * @property {string} creator.name of the blocker
 * @property {string} creator.url associated with the block
 * @property {string} reason for block
 * @property {string} [duration] of block e.g. "1 week"
 * @property {string} [expiry] of block, wrapped in parentheses
 * @property {Promise<string>} [parsedReason] the reason for the block.
 *  e.g. "(1st September 2019)"
 */

/**
 * This creates the drawer at the bottom of the screen that appears when a
 * blocked user tries to edit.
 *
 * @private
 * @param {BlockMessageOptions} props
 * @return {module:mobile.startup/Drawer}
 */
module.exports = function blockMessageDrawer( props ) {
	let eventListener;

	const repositionDrawer = ( $drawer ) => {
		const $container = $drawer.find( '.block-message-container' );
		const $button = $drawer.find( '> .cdx-button' );
		const newTop = window.innerHeight - $container.height() - $button.height();

		$drawer.css( 'top', newTop > 0 ? `${ newTop }px` : 0 );
	};

	const blockDrawer = new Drawer( {
		className: 'drawer block-message',
		onBeforeHide: ( drawer ) => {
			if ( typeof eventListener === 'function' ) {
				window.removeEventListener( 'resize', eventListener );
				eventListener = null;
			}

			drawer.$el.remove();
		},
		onShow: () => {
			const $drawer = blockDrawer.$el.find( '.drawer.block-message' );
			const $seeMore = $drawer.find( '.block-message-see-more' );
			const wiki = mw.config.get( 'wgDBname' );

			// Delay the UI update a little bit until the component heights are
			// set, otherwise computing the new drawer top will fail.
			setTimeout( () => repositionDrawer( $drawer ), 100 );

			// Reposition the popup when the viewport size changes
			eventListener = () => repositionDrawer( $drawer );
			window.addEventListener( 'resize', eventListener );

			$seeMore.on( 'click', () => {
				const $reason = $drawer.find( '.block-message-reason' );
				$reason.show();
				$seeMore.hide();

				repositionDrawer( $drawer );

				if ( mw.config.get( 'wgMFTrackBlockNotices' ) ) {
					mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.reasonShown', 1 );
					mw.track( 'stats.mediawiki_block_notices_total', 1, {
						source: 'MobileFrontend',
						action: 'reasonShown',
						wiki
					} );
				}
			} );

			if ( mw.config.get( 'wgMFTrackBlockNotices' ) ) {
				mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.shown', 1 );
				mw.track( 'stats.mediawiki_block_notices_total', 1, {
					source: 'MobileFrontend',
					action: 'shown',
					wiki
				} );
			}
		},
		children: [
			( blockMessageDetails.factory( props ) ).$el
		]
	} );

	return blockDrawer;
};
