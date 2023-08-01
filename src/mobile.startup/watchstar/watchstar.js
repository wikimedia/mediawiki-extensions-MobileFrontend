var icons = require( '../icons' );

/**
 * A clickable watchstar for logged in users.
 * Should not be used for anonymous users.
 *
 * @param {Object} options Configuration options
 * @param {Page} options.page
 * @param {boolean} options.isWatched is the article watched?
 * @return {IconButton}
 */
module.exports = function ( options ) {
	const isWatched = options.isWatched,
		// FIXME: mw.loader.require is not a public function (T235198)
		watchstar = mw.loader.require( 'mediawiki.page.watch.ajax' ).watchstar,
		action = isWatched ? 'unwatch' : 'watch',
		iconProps = {
			href: mw.Title.newFromText( options.page.title ).getUrl( { action } )
		},
		watchButton = icons.watch( iconProps ),
		watchedButton = icons.watched( iconProps ),
		WATCH_BUTTON_CLASS = watchButton.getClassName(),
		WATCHED_BUTTON_CLASS = watchedButton.getClassName(),
		WATCH_CLASS = watchButton.getIcon().getClassName(),
		WATCHED_CLASS = watchedButton.getIcon().getClassName(),
		activeIcon = isWatched ? watchedButton : watchButton,
		callback = ( $link, watched ) => {
			$link.attr( 'class', watched ?
				WATCHED_BUTTON_CLASS : WATCH_BUTTON_CLASS );
			const $icon = $link.find( '.mf-icon' );
			$icon.attr( 'class', watched ?
				WATCHED_CLASS : WATCH_CLASS );
		};

	watchstar( activeIcon.$el, options.page.title, callback );
	return activeIcon;
};
