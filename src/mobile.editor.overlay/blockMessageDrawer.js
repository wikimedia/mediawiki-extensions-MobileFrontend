var Drawer = require( '../mobile.startup/Drawer' ),
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
	return new Drawer( {
		className: 'drawer block-message',
		onBeforeHide: function ( drawer ) {
			drawer.$el.remove();
		},
		children: [
			( new BlockMessageDetails( props ) ).$el
		]
	} );
};
