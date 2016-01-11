( function ( M, $ ) {

	var Overlay = M.require( 'mobile.overlays/Overlay' ),
		CategoryGateway = M.require( 'mobile.categories.overlays/CategoryGateway' );

	/**
	 * Displays the list of categories for a page
	 * @class CategoryOverlay
	 * @extends Overlay
	 * @uses CategoryGateway
	 */
	function CategoryOverlay() {
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( CategoryOverlay, Overlay, {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {mw.Api} defaults.api to use to construct gateway
		 * @cfg {String} defaults.heading Title of the list of categories this page is
		 * categorized in.
		 * @cfg {String} defaults.subheading Introduction text for the list of categories,
		 * the page belongs to.
		 * @cfg {Array} defaults.headerButtons Objects that will be used as defaults for
		 * generating header buttons.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			heading: mw.msg( 'mobile-frontend-categories-heading' ),
			subheading: mw.msg( 'mobile-frontend-categories-subheading' ),
			headerButtonsListClassName: 'overlay-action',
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
		 */
		className: 'category-overlay overlay',
		/**
		 * @inheritdoc
		 */
		templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.categories.overlays', 'CategoryOverlay.hogan' )
		} ),
		events: $.extend( {}, Overlay.prototype.events, {
			'click .catlink': 'onCatlinkClick'
		} ),
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			Overlay.prototype.postRender.apply( this );

			if ( !this.options.isAnon ) {
				this.$( '.add' ).removeClass( 'hidden' );
			}
			if ( !this.options.items ) {
				this._loadCategories( this.options );
			}
			if ( this.options.showHidden ) {
				this._changeView();
			}
			M.off( 'category-added' ).on( 'category-added', $.proxy( this, '_loadCategories', this.options ) );
		},

		/**
		 * Get a list of categories the page belongs to and re-renders the overlay content
		 * @param {Object} options Object passed to the constructor.
		 */
		_loadCategories: function ( options ) {
			var gateway = new CategoryGateway( options.api ),
				self = this;

			this.$( '.topic-title-list' ).empty();
			this.showSpinner();
			gateway.getCategories( options.title ).done( function ( data ) {
				if ( data.query && data.query.pages ) {
					options.items = [];
					options.hiddenitems = [];

					// add categories to overlay
					$.each( data.query.pages, function ( index, page ) {
						if ( page.categories ) {
							$.each( page.categories, function ( index, category ) {
								var title = mw.Title.newFromText( category.title, category.ns );

								if ( category.hidden !== undefined ) {
									options.hiddenitems.push( {
										url: title.getUrl(),
										title: title.getNameText()
									} );
								} else {
									options.items.push( {
										url: title.getUrl(),
										title: title.getNameText()
									} );
								}
							} );
						}
					} );

					if ( options.items.length === 0 && options.hiddenitems.length === 0 ) {
						options.subheading = mw.msg( 'mobile-frontend-categories-nocat' );
					} else if ( options.items.length === 0 && options.hiddenitems.length > 0 ) {
						options.showHidden = true;
					}
				} else {
					options.subheading = mw.msg( 'mobile-frontend-categories-nocat' );
				}
				self.render( options );
				self.clearSpinner();
			} );
		},

		/**
		 * Handles a click on one of the tabs to change the viewable categories
		 * @param {jQuery.Event} ev The Event object triggered this handler
		 */
		onCatlinkClick: function ( ev ) {
			ev.preventDefault();
			// change view only, if the user clicked another view
			if ( !$( ev.target ).parent().hasClass( 'selected' ) ) {
				this._changeView();
			}
		},

		/**
		 * Changes the view from hidden categories to content-based categories and vice-versa
		 */
		_changeView: function () {
			this.$( '.category-header li' ).toggleClass( 'selected' );
			this.$( '.topic-title-list' ).toggleClass( 'hidden' );
		}
	} );

	M.define( 'mobile.categories.overlays/CategoryOverlay', CategoryOverlay );

}( mw.mobileFrontend, jQuery ) );
