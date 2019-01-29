var
	browser = require( './Browser' ).getSingleton(),
	lazyImageLoader = require( './lazyImages/lazyImageLoader' ),
	lazyImageTransformer = require( './lazyImages/lazyImageTransformer' ),
	View = require( './View' ),
	util = require( './util' ),
	Page = require( './Page' ),
	Deferred = util.Deferred,
	icons = require( './icons' ),
	spinner = icons.spinner(),
	mfExtend = require( './mfExtend' );

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

/**
 * Representation of the current skin being rendered.
 *
 * @class Skin
 * @extends View
 * @uses Browser
 * @uses Page
 * @fires Skin#click
 * @fires Skin#references-loaded
 * @fires Skin#changed
 * @param {Object} params Configuration options
 * @param {OO.EventEmitter} params.eventBus Object used to listen for
 * scroll:throttled, resize:throttled, and section-toggled events
 */
function Skin( params ) {
	var self = this,
		options = util.extend( {}, params );

	this.page = options.page;
	this.name = options.name;
	if ( options.mainMenu ) {
		this.mainMenu = options.mainMenu;
		mw.log.warn( 'Skin: Use of mainMenu is deprecated.' );
	}
	this.eventBus = options.eventBus;
	options.isBorderBox = false;
	View.call( this, options );
	this.referencesGateway = options.referencesGateway;

	if (
		mw.config.get( 'wgMFLazyLoadImages' )
	) {
		util.docReady( function () {
			var
				container = document.getElementById( 'content' ),
				images = lazyImageLoader.queryPlaceholders( container );
			self.lazyImageTransformer = lazyImageTransformer.newLazyImageTransformer(
				self.eventBus, self.$.bind( self ), util.getWindow().height() * 1.5, images
			);
			self.lazyImageTransformer.loadImages();
		} );
	}

	if ( mw.config.get( 'wgMFLazyLoadReferences' ) ) {
		this.eventBus.on( 'section-toggled', this.lazyLoadReferences.bind( this ) );
	}
}

mfExtend( Skin, View, {
	/**
	 * @memberof Skin
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {Page} defaults.page page the skin is currently rendering
	 * @property {ReferencesGateway} defaults.referencesGateway instance of references gateway
	 */
	defaults: {
		page: undefined
	},

	/**
	 * @inheritdoc
	 * @memberof Skin
	 * @instance
	 */
	events: {},

	/**
	 * @inheritdoc
	 * @memberof Skin
	 * @instance
	 */
	postRender: function () {
		var $el = this.$el;
		if ( browser.supportsAnimations() ) {
			$el.addClass( 'animations' );
		}
		if ( browser.supportsTouchEvents() ) {
			$el.addClass( 'touch-events' );
		}
		util.parseHTML( '<div class="transparent-shield cloaked-element">' )
			.appendTo( $el.find( '#mw-mf-page-center' ) );
		if ( this.lazyImageTransformer ) {
			this.lazyImageTransformer.loadImages();
		}

		/**
		 * Fired when the skin is clicked.
		 * @event Skin#click
		 */
		this.$( '#mw-mf-page-center' ).on( 'click', this.emit.bind( this, 'click' ) );
	},
	/**
	 * Load the references section content from API if it's not already loaded.
	 *
	 * All references tags content will be loaded per section.
	 * @memberof Skin
	 * @instance
	 * @param {ToggledEvent} data Information about the section.
	 * @return {jQuery.Promise|void} rejected when not a reference section.
	 */
	lazyLoadReferences: function ( data ) {
		var $content, $spinner,
			gateway = this.referencesGateway,
			self = this;

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
					self.emit( 'references-loaded', self.page );

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
	},

	/**
	 * Returns the appropriate license message including links/name to
	 * terms of use (if any) and license page
	 * @memberof Skin
	 * @instance
	 * @return {string}
	 */
	getLicenseMsg: function () {
		var licenseMsg,
			mfLicense = mw.config.get( 'wgMFLicense' ),
			licensePlural = mw.language.convertNumber( mfLicense.plural );

		if ( mfLicense.link ) {
			if ( this.$( '#footer-places-terms-use' ).length > 0 ) {
				licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing-with-terms',
					mw.message(
						'mobile-frontend-editor-terms-link',
						this.$( '#footer-places-terms-use a' ).attr( 'href' )
					).parse(),
					mfLicense.link,
					licensePlural
				);
			} else {
				licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing',
					mfLicense.link,
					licensePlural
				);
			}
		}
		return licenseMsg;
	}
} );

Skin.getSectionId = getSectionId;

module.exports = Skin;
