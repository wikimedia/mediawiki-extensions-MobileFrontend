var icons = require( '../icons' );

/**
 * A clickable watchstar for logged in users.
 * Should not be used for anonymous users.
 *
 * @param {Object} options Configuration options
 * @param {Page} options.page
 * @param {boolean} options.isWatched is the article watched?
 * @return {Icon}
 */
module.exports = function ( options ) {
	const isWatched = options.isWatched,
		// FIXME: mw.loader.require is not a public function (T235198)
		watchstar = mw.loader.require( 'mediawiki.page.watch.ajax' ).watchstar,
		action = isWatched ? 'unwatch' : 'watch',
		iconProps = {
			href: mw.Title.newFromText( options.page.title ).getUrl( { action } )
		},
		watchIcon = icons.watchIcon( iconProps ),
		watchedIcon = icons.watchedIcon( iconProps ),
		WATCH_CLASS = watchIcon.$el.attr( 'class' ),
		WATCHED_CLASS = watchedIcon.$el.attr( 'class' ),
		activeIcon = isWatched ? watchedIcon : watchIcon,
		callback = ( $link, isWatched ) => {
			$link.attr( 'class', isWatched ?
				WATCHED_CLASS : WATCH_CLASS );
		};

	watchstar( activeIcon.$el, options.page.title, callback );
	return activeIcon;
};
