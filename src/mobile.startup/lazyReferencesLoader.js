var
	lazyImageLoader = require( './lazyImages/lazyImageLoader' ),
	util = require( './util' ),
	Page = require( './Page' ),
	Deferred = util.Deferred,
	icons = require( './icons' ),
	spinner = icons.spinner();

/**
 * Load the references section content from API if it's not already loaded.
 *
 * All references tags content will be loaded per section.
 * @param {OO.EventEmitter} eventBus
 * @param {ToggledEvent} data Information about the section.
 * @param {ReferencesGateway} gateway
 * @param {Page} page
 * @return {jQuery.Promise|void} rejected when not a reference section.
 */
function loadReferences( eventBus, data, gateway, page ) {
	var $content, $spinner;

	// If the section was expanded before toggling, do not load anything as
	// section is being collapsed now.
	// Also return early if lazy loading is not required or the section is
	// not a reference section
	if (
		data.expanded ||
		!data.isReferenceSection
	) {
		return;
	}

	$content = data.$heading.next();

	function loadImagesAndSetData() {
		// lazy load images if any
		lazyImageLoader.loadImages( lazyImageLoader.queryPlaceholders( $content[0] ) );
		// Do not attempt further loading even if we're unable to load this time.
		$content.data( 'are-references-loaded', 1 );
	}

	if ( !$content.data( 'are-references-loaded' ) ) {
		$content.children().addClass( 'hidden' );
		$spinner = spinner.$el.prependTo( $content );

		// First ensure we retrieve all of the possible lists
		return gateway.getReferencesLists( data.page )
			.then( function () {
				var lastId;

				$content.find( '.mf-lazy-references-placeholder' ).each( function () {
					var refListIndex = 0,
						$placeholder = $content.find( this ),
						// search for id of the collapsible heading
						id = getSectionId( $placeholder );

					if ( lastId !== id ) {
						// If the placeholder belongs to a new section reset index
						refListIndex = 0;
						lastId = id;
					} else {
						// otherwise increment it
						refListIndex++;
					}

					if ( id ) {
						gateway.getReferencesList( data.page, id )
							.then( function ( refListElements ) {
								// Note if no section html is provided
								// no substitution will happen
								// so user is forced to rely on placeholder link.
								if ( refListElements && refListElements[refListIndex] ) {
									$placeholder.replaceWith(
										refListElements[refListIndex]
									);
								}
							} );
					}
				} );
				// Show the section now the references lists have been placed.
				$spinner.remove();
				$content.children().removeClass( 'hidden' );
				/**
				 * Fired when references list is loaded into the HTML
				 * @event references-loaded
				 */
				eventBus.emit( 'references-loaded', page );

				loadImagesAndSetData();
			}, function () {
				$spinner.remove();
				// unhide on a failure
				$content.children().removeClass( 'hidden' );

				loadImagesAndSetData();
			} );
	} else {
		return Deferred().reject().promise();
	}
}

/**
 * Get the id of the section $el belongs to.
 * @param {jQuery.Object} $el
 * @return {string|null} either the anchor (id attribute of the section heading
 *  or null if none found)
 */
function getSectionId( $el ) {
	var id,
		hSelector = Page.HEADING_SELECTOR,
		$parent = $el.parent(),
		// e.g. matches Subheading in
		// <h2>H</h2><div><h3 id="subheading">Subh</h3><a class="element"></a></div>
		$heading = $el.prevAll( hSelector ).eq( 0 );

	if ( $heading.length ) {
		id = $heading.find( '.mw-headline' ).attr( 'id' );
		if ( id ) {
			return id;
		}
	}
	if ( $parent.length ) {
		// if we couldnt find a sibling heading, check the sibling of the parents
		// consider <div><h2 /><div><$el/></div></div>
		return getSectionId( $parent );
	} else {
		return null;
	}
}

module.exports = {
	loadReferences: loadReferences,
	test: {
		getSectionId: getSectionId
	}
};
