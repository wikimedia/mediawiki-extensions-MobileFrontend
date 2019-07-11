var
	mfExtend = require( '../mobile.startup/mfExtend' ),
	util = require( '../mobile.startup/util' ),
	View = require( '../mobile.startup/View' ),
	icons = require( '../mobile.startup/icons' ),
	spinner = icons.spinner().$el,
	ScrollEndEventEmitter = require( '../mobile.startup/ScrollEndEventEmitter' ),
	CategoryGateway = require( './CategoryGateway' );

/**
 * Displays the list of categories for a page in two tabs
 * TODO: Break this into Tab and CategoryList components for better reuse.
 * @class CategoryTabs
 * @extends View
 * @uses CategoryGateway
 *
 * @param {Object} options Configuration options
 * @param {string} options.title of page to obtain categories for
 * @param {string} options.subheading for explaining the list of categories.
 * @param {mw.Api} options.api for use with CategoryGateway
 * @param {OO.EventEmitter} options.eventBus Object used to listen for category-added
 * and scroll:throttled events
 */
function CategoryTabs( options ) {
	this.scrollEndEventEmitter = new ScrollEndEventEmitter( options.eventBus );
	this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
		this._loadCategories.bind( this ) );
	this.gateway = new CategoryGateway( options.api );
	View.call(
		this,
		util.extend(
			true,
			{ events: { 'click .catlink': 'onCatlinkClick' } },
			options
		)
	);
}

mfExtend( CategoryTabs, View, {
	isTemplateMode: true,
	/**
	 * @memberof CategoryTabs
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 */
	defaults: {
		normalcatlink: mw.msg( 'mobile-frontend-categories-normal' ),
		hiddencatlink: mw.msg( 'mobile-frontend-categories-hidden' )
	},
	/**
	 * @inheritdoc
	 * @memberof CategoryTabs
	 * @instance
	 */
	template: util.template( `
<div class="category-list">
	<p class="content-header">
		{{subheading}}
	</p>
	<ul class="category-header">
		<li class="selected">
			<a href="#" class="catlink">{{normalcatlink}}</a>
		</li><li>
			<a href="#" class="catlink">{{hiddencatlink}}</a>
		</li>
	</ul>
	<ul class="topic-title-list normal-catlist"></ul>
	<ul class="topic-title-list hidden hidden-catlist"></ul>
</div>
	` ),
	/**
	 * @inheritdoc
	 * @memberof CategoryTabs
	 * @instance
	 */
	templatePartials: {
		item: util.template( `
<li title="{{title}}">
    <a href="{{url}}">{{title}}</a>
</li>
		` )
	},
	/**
	 * @inheritdoc
	 * @memberof CategoryTabs
	 * @instance
	 */
	postRender: function () {
		View.prototype.postRender.apply( this );
		this.$el.append( spinner );
		this._loadCategories();
	},

	/**
	 * @memberof CategoryTabs
	 * @instance
	 * @return {void}
	 */
	hideSpinner: function () {
		this.$el.find( '.spinner' ).hide();
	},
	/**
	 * @memberof CategoryTabs
	 * @instance
	 * @return {void}
	 */
	showSpinner: function () {
		this.$el.find( '.spinner' ).show();
	},
	/**
	 * Get a list of categories the page belongs to and re-renders the overlay content
	 * FIXME: CategoryTabs should be dumb and solely focus on rendering. This should
	 * be refactored out at the earliest opportunity.
	 * @memberof CategoryTabs
	 * @instance
	 */
	_loadCategories: function () {
		var self = this,
			$normalCatlist = this.$el.find( '.normal-catlist' ),
			$hiddenCatlist = this.$el.find( '.hidden-catlist' ),
			apiResult;

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
									title: title.getMainText()
								} ) );
							} else {
								$normalCatlist.append( self.templatePartials.item.render( {
									url: title.getUrl(),
									title: title.getMainText()
								} ) );
							}
						} );
					}
				} );

				if ( $normalCatlist.length === 0 && $normalCatlist.length === 0 ) {
					self.$el.find( '.content-header' ).text( mw.msg( 'mobile-frontend-categories-nocat' ) );
				} else if ( $normalCatlist.length === 0 && $normalCatlist.length > 0 ) {
					this._changeView();
				}
			} else {
				self.$el.find( '.content-header' ).text( mw.msg( 'mobile-frontend-categories-nocat' ) );
			}
			self.hideSpinner();
			self.scrollEndEventEmitter.enable();
		} );
	},

	/**
	 * Handles a click on one of the tabs to change the viewable categories
	 * @memberof CategoryTabs
	 * @instance
	 * @param {jQuery.Event} ev The Event object triggered this handler
	 */
	onCatlinkClick: function ( ev ) {
		ev.preventDefault();
		// change view only, if the user clicked another view
		if ( !this.$el.find( ev.target ).parent().hasClass( 'selected' ) ) {
			this._changeView();
		}
	},

	/**
	 * Changes the view from hidden categories to content-based categories and vice-versa
	 * @memberof CategoryTabs
	 * @instance
	 */
	_changeView: function () {
		this.$el.find( '.category-header li' ).toggleClass( 'selected' );
		this.$el.find( '.topic-title-list' ).toggleClass( 'hidden' );
	}
} );

module.exports = CategoryTabs;
