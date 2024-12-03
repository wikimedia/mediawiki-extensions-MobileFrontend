const util = require( './util.js' ),
	mfExtend = require( './mfExtend' ),
	View = require( './View' ),
	browser = require( './Browser' ).getSingleton();

/**
 * List of items page view
 *
 * @class PageList
 * @extends module:mobile.startup/View
 */
function PageList() {
	View.apply( this, arguments );
}

mfExtend( PageList, View, {
	/**
	 * @memberof PageList
	 * @instance
	 * @mixes module:mobile.startup/View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {Page[]} defaults.pages Array of Page objects. These should match
	 *                              the Page model and not necessarily the
	 *                              underlying API format used.
	 * E.g. [
	 *   {
	 *     heading: "<strong>C</strong>laude Monet",
	 *     id: undefined,
	 *     title: "Claude Monet",
	 *     displayTitle: "<i>Claude Monet</i>",
	 *     url: "/wiki/Claude_Monet",
	 *     thumbnail: {
	 *       height: 62,
	 *       source: "http://127.0.0.1:8080/images/thumb/thumb.jpg",
	 *       width: 80,
	 *       isLandscape: true
	 *     }
	 *   }
	 * ]
	 */
	defaults: {
		pages: []
	},
	/**
	 * Render page images for the existing page list. Assumes no page images have been loaded.
	 *
	 * @memberof PageList
	 * @instance
	 */
	renderPageImages() {
		setTimeout( () => {
			this.$el.find( '.list-thumb' ).each( ( i, thumbEl ) => {
				const style = this.$el.find( thumbEl ).data( 'style' );
				this.$el.find( thumbEl ).attr( 'style', style );
			} );
			// Delay an unnecessary load of images on mobile (slower?) connections
			// In particular on search results which can be regenerated quickly.
		}, browser.isWideScreen() ? 0 : 1000 );
	},
	/**
	 * @inheritdoc
	 * @memberof PageList
	 * @instance
	 */
	postRender() {
		this.renderPageImages();
	},
	template: util.template( `
<ul class="mw-mf-page-list thumbs actionable">
	{{#pages}}
		{{>item}}
	{{/pages}}
</ul>
	` ),
	/**
	 * @memberof PageList
	 * @instance
	 */
	templatePartials: {
		// The server uses a very different structure in
		// SpecialMobileEditWatchlist.getLineHtml(). Be aware of these differences
		// when updating server rendered items.
		item: util.template( `
<li title="{{title}}" data-id="{{id}}" class="page-summary">
  <a href="{{url}}" class="title {{#isMissing}}new{{/isMissing}}"
    {{#anchor}}name="{{anchor}}"{{/anchor}}
    data-title="{{title}}">
    <div class="list-thumb
      {{#thumbnail.isLandscape}}list-thumb-y{{/thumbnail.isLandscape}}
      {{^thumbnail.isLandscape}}list-thumb-x{{/thumbnail.isLandscape}}"
      {{#thumbnail}}data-style="background-image: url( {{thumbnail.source}} )"{{/thumbnail}}>
      {{^thumbnail}}<span class="mf-icon-image"></span>{{/thumbnail}}
	</div>
    <h3>{{{displayTitle}}}</h3>
    {{#wikidataDescription}}
    <div class="wikidata-description">{{wikidataDescription}}</div>
    {{/wikidataDescription}}
  </a>
</li>
	` )
	}
} );

module.exports = PageList;
