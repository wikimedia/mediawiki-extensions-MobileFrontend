const View = require( '../View' ),
	Icon = require( '../Icon' ),
	Anchor = require( '../Anchor' ),
	icons = require( '../icons' ),
	spinner = icons.spinner().$el,
	util = require( '../util' );

/**
 * @class SearchResultsView
 * @extends View
 * @param {Object} options
 * @param {string} options.searchContentLabel actionable label to tell the user they can "search
 *  within pages rather than doing a full text search
 * @param {string} options.noResultsMsg shows when no results displayed
 * @param {string} options.searchContentNoResultsMsg alternative to options.searchContentLabel that
 * shows when no search results have been displayed.
 */
class SearchResultsView extends View {
	/** @inheritdoc */
	get isTemplateMode() {
		return true;
	}
	/** @inheritdoc */
	get template() {
		return util.template( `
<div class="search-results-view">
	<div class="search-content overlay-header">
		<ul>
			<li>{{! search content icon goes here }}</li>
		</ul>
		<div class="caption">
			<p class="with-results">{{searchContentLabel}}</p>
			<p class="without-results">{{noResultsMsg}}</p>
			<p class="without-results">{{{searchContentNoResultsMsg}}}</p>
		</div>
	</div>
	<div class="spinner-container position-fixed"></div>
	<div class="results">
		<div class="results-list-container"></div>
		{{#feedback}}
			<div class="search-feedback">
				{{prompt}}
			</div>
		{{/feedback}}
	</div>
</div>`
		);
	}
	/** @inheritdoc */
	preRender() {
		const feedbackLink = mw.config.get( 'wgCirrusSearchFeedbackLink' );
		if ( feedbackLink ) {
			this.options.feedback = {
				prompt: mw.msg( 'mobile-frontend-search-feedback-prompt' ) };
		}
	}
	/** @inheritdoc */
	postRender( options ) {
		const feedbackLink = mw.config.get( 'wgCirrusSearchFeedbackLink' );
		super.postRender( options );
		this.$el.find( '.search-content li' ).append(
			new Icon( {
				tagName: 'a',
				// When this icon is clicked we want to reset the hash for subsequent views
				href: '#',
				name: 'search-content',
				additionalClassNames: 'mw-ui-icon-flush-left',
				label: mw.msg( 'mobile-frontend-search-content' )
			} ).$el
		);
		this.$el.find( '.spinner-container' ).append( spinner );
		if ( feedbackLink ) {
			this.$el.find( '.search-feedback' ).append(
				new Anchor( {
					label: mw.msg( 'mobile-frontend-search-feedback-link-text' ),
					href: feedbackLink
				} ).$el
			);
		}
	}
}

module.exports = SearchResultsView;
