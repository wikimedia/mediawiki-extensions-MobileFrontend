( function ( M ) {

	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		ScrollEndEventEmitter = M.require( 'mobile.scrollEndEventEmitter/ScrollEndEventEmitter' ),
		CategoryGateway = M.require( 'mobile.categories.overlays/CategoryGateway' );

	/**
	 * Displays the list of categories for a page
	 * @class CategoryOverlay
	 * @extends Overlay
	 * @uses CategoryGateway
	 *
	 * @param {Object} options Configuration options
	 */
	function CategoryOverlay( options ) {
		this.scrollEndEventEmitter = new ScrollEndEventEmitter();
		this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
			this._loadCategories.bind( this ) );
		this.gateway = new CategoryGateway( options.api );
		M.on( 'category-added', this._loadCategories.bind( this ) );
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( CategoryOverlay, Overlay, {
		/**
		 * @memberof CategoryOverlay
		 * @instance
		 * @mixes Overlay#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {mw.Api} defaults.api to use to construct gateway
		 * @property {string} defaults.heading Title of the list of categories this page is
		 * categorized in.
		 * @property {string} defaults.subheading Introduction text for the list of categories,
		 * the page belongs to.
		 * @property {Array} defaults.headerButtons Objects that will be used as defaults for
		 * generating header buttons.
		 */
		defaults: util.extend( {}, Overlay.prototype.defaults, {
			heading: mw.msg( 'mobile-frontend-categories-heading' ),
			subheading: mw.msg( 'mobile-frontend-categories-subheading' ),
			headerButtonsListClassName: 'header-action',
			headerButtons: [ {
				href: '#/categories/add',
				className: 'add continue hidden',
				msg: mw.msg( 'mobile-frontend-categories-add' )
			} ],
			normalcatlink: mw.msg( 'mobile-frontend-categories-normal' ),
			hiddencatlink: mw.msg( 'mobile-frontend-categories-hidden' )
		} ),
		/**
		 * @inheritdoc
		 * @memberof CategoryOverlay
		 * @instance
		 */
		className: 'category-overlay overlay',
		/**
		 * @inheritdoc
		 * @memberof CategoryOverlay
		 * @instance
		 */
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.categories.overlays', 'CategoryOverlay.hogan' ),
			item: mw.template.get( 'mobile.categories.overlays', 'CategoryOverlayItem.hogan' )
		} ),
		/**
		 * @memberof CategoryOverlay
		 * @instance
		 */
		events: util.extend( {}, Overlay.prototype.events, {
			'click .catlink': 'onCatlinkClick'
		} ),
		/**
		 * @inheritdoc
		 * @memberof CategoryOverlay
		 * @instance
		 */
		postRender: function () {
			Overlay.prototype.postRender.apply( this );

			if ( !this.options.isAnon ) {
				this._showAddCategoryButton();
			}
			if ( !this.options.items ) {
				this._loadCategories();
			}
		},

		/**
		 * @memberof CategoryOverlay
		 * @instance
		 * @return {void}
		 */
		_showAddCategoryButton: function () {
			this.$( '.add' ).removeClass( 'hidden' );
		},

		/**
		 * Get a list of categories the page belongs to and re-renders the overlay content
		 * @memberof CategoryOverlay
		 * @instance
		 */
		_loadCategories: function () {
			var self = this,
				$normalCatlist = this.$( '.normal-catlist' ),
				$hiddenCatlist = this.$( '.hidden-catlist' ),
				apiResult;

			this.showSpinner();
			this.scrollEndEventEmitter.setElement( this.$el );
			// ScrollEndEventEmitter is enabled once it's created, but we want to wait, until at
			// least one element is in the list before we enable it. So disable it here and enable
			// once the elements are loaded.
			this.scrollEndEventEmitter.disable();
			apiResult = this.gateway.getCategories( this.options.title );
			if ( apiResult === false ) {
				self.hideSpinner();
				return;
			}
			apiResult.then( function ( data ) {
				if ( data.query && data.query.pages ) {
					// add categories to overlay
					data.query.pages.forEach( function ( page ) {
						if ( page.categories ) {
							page.categories.forEach( function ( category ) {
								var title = mw.Title.newFromText( category.title, category.ns );

								if ( category.hidden ) {
									$hiddenCatlist.append( self.templatePartials.item.render( {
										url: title.getUrl(),
										title: title.getNameText()
									} ) );
								} else {
									$normalCatlist.append( self.templatePartials.item.render( {
										url: title.getUrl(),
										title: title.getNameText()
									} ) );
								}
							} );
						}
					} );

					if ( $normalCatlist.length === 0 && $normalCatlist.length === 0 ) {
						self.$( '.content-header' ).text( mw.msg( 'mobile-frontend-categories-nocat' ) );
					} else if ( $normalCatlist.length === 0 && $normalCatlist.length > 0 ) {
						this._changeView();
					}
				} else {
					self.$( '.content-header' ).text( mw.msg( 'mobile-frontend-categories-nocat' ) );
				}
				self.hideSpinner();
				self.scrollEndEventEmitter.enable();
			} );
		},

		/**
		 * Handles a click on one of the tabs to change the viewable categories
		 * @memberof CategoryOverlay
		 * @instance
		 * @param {jQuery.Event} ev The Event object triggered this handler
		 */
		onCatlinkClick: function ( ev ) {
			ev.preventDefault();
			// change view only, if the user clicked another view
			if ( !this.$( ev.target ).parent().hasClass( 'selected' ) ) {
				this._changeView();
			}
		},

		/**
		 * Changes the view from hidden categories to content-based categories and vice-versa
		 * @memberof CategoryOverlay
		 * @instance
		 */
		_changeView: function () {
			this.$( '.category-header li' ).toggleClass( 'selected' );
			this.$( '.topic-title-list' ).toggleClass( 'hidden' );
		}
	} );

	M.define( 'mobile.categories.overlays/CategoryOverlay', CategoryOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend ) );
