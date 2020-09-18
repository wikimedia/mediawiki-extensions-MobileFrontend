const
	Drawer = require( '../mobile.startup/Drawer' ),
	BlockMessageDetails = require( './BlockMessageDetails' );

/**
 * @typedef {Object} BlockMessageOptions
 * @property {number} blockId representing the block
 * @property {boolean} partial is this a partial block?
 * @property {Object} creator
 * @property {string} creator.name of the blocker
 * @property {string} creator.url associated with the block
 * @property {string} reason for block
 * @property {string} [duration] of block e.g. "1 week"
 * @property {string} [expiry] of block, wrapped in parentheses
 *  e.g. "(1st September 2019)"
 */

/**
 * This creates the drawer at the bottom of the screen that appears when a
 * blocked user tries to edit.
 *
 * @param {BlockMessageOptions} props
 * @return {Drawer}
 */
module.exports = function blockMessageDrawer( props ) {
	const blockDrawer = new Drawer( {
		className: 'drawer block-message',
		onBeforeHide: function ( drawer ) {
			drawer.$el.remove();
		},
		onShow: function () {
			const $drawer = blockDrawer.$el.find( '.drawer.block-message' ),
				drawerTop = $drawer.offset().top - 100,
				creatorTop = blockDrawer.$el.find( '.block-message-creator' ).offset().top - 100,
				buttonsTop = blockDrawer.$el.find( '.block-message-buttons' ).offset().top - 100,
				$seeMore = blockDrawer.$el.find( '.block-message-see-more' ),
				wiki = mw.config.get( 'wgDBname' );

			$drawer.css( 'top', drawerTop + ( buttonsTop - creatorTop ) );
			$seeMore.on(
				'click',
				function () {
					const $container = blockDrawer.$el.find( '.block-message-container' );
					$drawer.css( 'top', 0 );
					$container.css( 'overflow-y', 'auto' );
					$container.css( 'height', buttonsTop - $container.offset().top );
					$seeMore.hide();

					if ( mw.config.get( 'wgMFTrackBlockNotices' ) ) {
						mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.reasonShown', 1 );
					}
				}
			);

			if ( mw.config.get( 'wgMFTrackBlockNotices' ) ) {
				mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.shown', 1 );
			}
		},
		children: [
			( new BlockMessageDetails( props ) ).$el
		]
	} );
	return blockDrawer;
};
