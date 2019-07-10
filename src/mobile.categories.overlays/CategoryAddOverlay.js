var
	Overlay = require( '../mobile.startup/Overlay' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	headers = require( '../mobile.startup/headers' ),
	util = require( '../mobile.startup/util' ),
	CategoryGateway = require( './CategoryGateway' ),
	CategoryLookupInputWidget = require( './CategoryLookupInputWidget' ),
	toast = require( '../mobile.startup/toast' ),
	router = mw.loader.require( 'mediawiki.router' );

/**
 * Displays the list of categories for a page
 * @class CategoryAddOverlay
 * @extends Overlay
 * @uses CategoryGateway
 * @param {Object} options Configuration options
 * @param {OO.EventEmitter} options.eventBus Object used to emit category-added events
 */
function CategoryAddOverlay( options ) {
	this.eventBus = options.eventBus;
	Overlay.call(
		this,
		util.extend(
			true,
			{
				headers: [
					headers.saveHeader(
						mw.msg( 'mobile-frontend-categories-add-heading', options.title ),
						'initial-header'
					),
					headers.savingHeader( mw.msg( 'mobile-frontend-categories-add-wait' ) )
				],
				className: 'category-overlay overlay',
				events: {
					'click .save': 'onSaveClick',
					'click .suggestion': 'onCategoryClick'
				}
			},
			options
		)
	);
}

mfExtend( CategoryAddOverlay, Overlay, {
	/**
	 * @inheritdoc
	 * @memberof CategoryAddOverlay
	 * @instance
	 */
	template: util.template( `
<div class="overlay-header-container header-container position-fixed"></div>
<div class="content-header panel add-panel overlay-content">
	<div class="category-add-input"></div>
</div>
<p class="overlay-content category-suggestions panel"></p>
	` ),

	/**
	 * @inheritdoc
	 * @memberof CategoryAddOverlay
	 * @instance
	 */
	postRender: function () {
		var input;

		Overlay.prototype.postRender.apply( this );

		this.$suggestions = this.$el.find( '.category-suggestions' );
		this.$saveButton = this.$el.find( '.save' );
		this.wgCategories = this.options.categories;
		this.title = this.options.title;

		this.gateway = new CategoryGateway( this.options.api );
		input = new CategoryLookupInputWidget( {
			gateway: this.gateway,
			suggestions: this.$suggestions,
			categories: this.wgCategories,
			saveButton: this.$saveButton
		} );
		this.$el.find( '.category-add-input' ).append(
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
		this.$el.find( ev.target ).closest( '.suggestion' ).detach();
		if ( this.$el.find( '.suggestion' ).length > 0 ) {
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
		this.$el.find( '.suggestion' ).each( function () {
			var data = self.$el.find( this ).data( 'title' );

			if ( data ) {
				// add the new categories in wikitext markup
				newCategories += '\n[[' + data + ']] ';
			}
		} );

		// if there are no categories added, don't do anything (the user shouldn't see the save
		// button)
		if ( newCategories.length === 0 ) {
			toast.show( mw.msg( 'mobile-frontend-categories-nodata' ), { type: 'error' } );
		} else {
			// save the new categories
			this.gateway.save( this.title, newCategories ).then( function () {
				// we're closing the overlay to show the user
				// that the action was completed successful
				router.navigate( '#' );
				mw.notify( mw.msg( 'mobile-frontend-categories-notification' ) );
			}, function () {
				self.showHidden( '.initial-header' );
				self.$safeButton.prop( 'disabled', false );
				// FIXME: Should be a better error message
				toast.show( mw.msg( 'mobile-frontend-categories-nodata' ), { type: 'error' } );
			} );
		}
	}
} );

module.exports = CategoryAddOverlay;
