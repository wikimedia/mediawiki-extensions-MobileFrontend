const BlockMessageDetails = require( './BlockMessageDetails.js' );
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

	/**
	 * @returns {boolean}
	 */
	const hasAdditionalModules = () => {
		const requiredModules = mw.config.get(
			'wgMobileFrontendSourceEditorInitializeModules',
			[]
		);

		return Array.isArray( requiredModules ) &&
			requiredModules.length > 0;
	};

	/**
	 * @returns {Promise<void>}
	 */
	const loadAdditionalModules = () => {
		const requiredModules = mw.config.get(
			'wgMobileFrontendSourceEditorInitializeModules',
			[]
		);

		const dependencies = [];
		if ( Array.isArray( requiredModules ) ) {
			for ( const moduleName of requiredModules ) {
				const state = mw.loader.getState( moduleName );
				if ( state === null || state === 'missing' ) {
					// Skip modules that are not known by the resource loader
					continue;
				}

				dependencies.push( mw.loader.using( moduleName ) );
			}
		}

		return Promise.all( dependencies );
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
			const wiki = mw.config.get( 'wgDBname' );

			// Delay the UI update a little bit until the component heights are
			// set, otherwise computing the new drawer top will fail.
			setTimeout( () => repositionDrawer( $drawer ), 100 );

			// Reposition the popup when the viewport size changes
			eventListener = () => repositionDrawer( $drawer );
			window.addEventListener( 'resize', eventListener );

			if ( mw.config.get( 'wgMFTrackBlockNotices' ) ) {
				mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.shown', 1 );
				mw.track( 'stats.mediawiki_block_notices_total', 1, {
					source: 'MobileFrontend',
					action: 'shown',
					wiki
				} );
				// This was previously behind a "show more" link, and has been
				// kept for stats-consistency:
				mw.track( 'counter.MediaWiki.BlockNotices.' + wiki + '.MobileFrontend.reasonShown', 1 );
				mw.track( 'stats.mediawiki_block_notices_total', 1, {
					source: 'MobileFrontend',
					action: 'reasonShown',
					wiki
				} );
			}

			if ( hasAdditionalModules() ) {
				loadAdditionalModules().then(
					() => mw.hook( 'mobileFrontend.blockMessageDrawer.onShow' ).fire()
				);
			}
		},
		children: [
			( new BlockMessageDetails( props ) ).$el
		]
	} );

	return blockDrawer;
};
