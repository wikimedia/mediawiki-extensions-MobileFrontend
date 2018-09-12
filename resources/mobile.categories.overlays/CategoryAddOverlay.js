( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		CategoryGateway = M.require( 'mobile.categories.overlays/CategoryGateway' ),
		CategoryLookupInputWidget = M.require( 'mobile.categories.overlays/CategoryLookupInputWidget' ),
		icons = M.require( 'mobile.startup/icons' ),
		toast = M.require( 'mobile.startup/toast' );

	/**
	 * Displays the list of categories for a page
	 * @class CategoryAddOverlay
	 * @extends Overlay
	 * @uses CategoryGateway
	 * @param {Object} options Configuration options
	 */
	function CategoryAddOverlay( options ) {
		options.heading = mw.msg( 'mobile-frontend-categories-add-heading', options.title );
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( CategoryAddOverlay, Overlay, {
		/**
		 * @memberof CategoryAddOverlay
		 * @instance
		 * @mixes Overlay#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {mw.Api} defaults.api to use to construct gateway
		 * @property {string} defaults.waitMsg Text that displays while a page edit is being saved.
		 * @property {string} defaults.waitIcon HTML of the icon that displays while a page edit
		 * is being saved.
		 */
		defaults: util.extend( {}, Overlay.prototype.defaults, {
			headerButtonsListClassName: 'header-action',
			waitMsg: mw.msg( 'mobile-frontend-categories-add-wait' ),
			waitIcon: icons.spinner().toHtmlString()
		} ),
		/**
		 * @inheritdoc
		 * @memberof CategoryAddOverlay
		 * @instance
		 */
		events: util.extend( {}, Overlay.prototype.events, {
			'click .save': 'onSaveClick',
			'click .suggestion': 'onCategoryClick'
		} ),
		/**
		 * @inheritdoc
		 * @memberof CategoryAddOverlay
		 * @instance
		 */
		className: 'category-overlay overlay',
		/**
		 * @inheritdoc
		 * @memberof CategoryAddOverlay
		 * @instance
		 */
		template: mw.template.get( 'mobile.categories.overlays', 'CategoryAddOverlay.hogan' ),
		/**
		 * @inheritdoc
		 * @memberof CategoryAddOverlay
		 * @instance
		 */
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			header: mw.template.get( 'mobile.categories.overlays', 'CategoryAddOverlayHeader.hogan' ),
			saveHeader: mw.template.get( 'mobile.editor.common', 'saveHeader.hogan' )
		} ),

		/**
		 * @inheritdoc
		 * @memberof CategoryAddOverlay
		 * @instance
		 */
		postRender: function () {
			var input;

			Overlay.prototype.postRender.apply( this );

			this.$suggestions = this.$( '.category-suggestions' );
			this.$saveButton = this.$( '.save' );
			this.wgCategories = this.options.categories;
			this.title = this.options.title;

			this.gateway = new CategoryGateway( this.options.api );
			input = new CategoryLookupInputWidget( {
				gateway: this.gateway,
				suggestions: this.$suggestions,
				categories: this.wgCategories,
				saveButton: this.$saveButton
			} );
			this.$( '.category-add-input' ).append(
				input.$element
			);
		},

		/**
		 * Handle a click on an added category
		 * @memberof CategoryAddOverlay
		 * @instance
		 * @param {jQuery.Event} ev
		 */
		onCategoryClick: function ( ev ) {
			this.$( ev.target ).closest( '.suggestion' ).detach();
			if ( this.$( '.suggestion' ).length > 0 ) {
				this.$saveButton.prop( 'disabled', false );
			} else {
				this.$saveButton.prop( 'disabled', true );
			}
		},

		/**
		 * Handle the click on the save button. Builds a string of new categories
		 * and add it to the article.
		 * @memberof CategoryAddOverlay
		 * @instance
		 */
		onSaveClick: function () {
			var newCategories = '',
				self = this;

			// show the loading spinner and disable the safe button
			this.showHidden( '.saving-header' );

			// add wikitext to add to the page
			this.$( '.suggestion' ).each( function () {
				var data = self.$( this ).data( 'title' );

				if ( data ) {
					// add the new categories in wikitext markup
					newCategories += '\n[[' + data + ']] ';
				}
			} );

			// if there are no categories added, don't do anything (the user shouldn't see the save
			// button)
			if ( newCategories.length === 0 ) {
				toast.show( mw.msg( 'mobile-frontend-categories-nodata' ), 'error' );
			} else {
				// save the new categories
				this.gateway.save( this.title, newCategories ).then( function () {
					M.emit( 'category-added' );
				}, function () {
					self.showHidden( '.initial-header' );
					self.$safeButton.prop( 'disabled', false );
					// FIXME: Should be a better error message
					toast.show( mw.msg( 'mobile-frontend-categories-nodata' ), 'toast error' );
				} );
			}
		}
	} );

	M.define( 'mobile.categories.overlays/CategoryAddOverlay', CategoryAddOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend ) );
