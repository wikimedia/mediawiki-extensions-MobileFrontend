const
	View = require( '../mobile.startup/View' ),
	util = require( '../mobile.startup/util' ),
	langUtil = require( './util' ),
	mfExtend = require( '../mobile.startup/mfExtend' );

/**
 * Overlay displaying a structured list of languages for a page
 *
 * @class LanguageSearcher
 * @extends View
 *
 * @param {Object} props Configuration options
 * @param {Object[]} props.languages list of language objects as returned by the API
 * @param {Array|boolean} props.variants language variant objects
 *  or false if no variants exist
 * @param {string} [props.deviceLanguage] the device's primary language
 */
function LanguageSearcher( props ) {
	/**
	 * @prop {StructuredLanguages} languages` JSDoc.
	 */
	const languages = langUtil.getStructuredLanguages(
		props.languages,
		props.variants,
		langUtil.getFrequentlyUsedLanguages(),
		props.deviceLanguage
	);

	View.call(
		this,
		util.extend(
			{
				className: 'language-searcher',
				events: {
					'click a': 'onLinkClick',
					'input .search': 'onSearchInput'
				},
				// the rest are template properties
				inputPlaceholder: mw.msg( 'mobile-frontend-languages-structured-overlay-search-input-placeholder' ),
				// we can't rely on CSS only to uppercase the headings. See https://stackoverflow.com/questions/3777443/css-text-transform-not-working-properly-for-turkish-characters
				allLanguagesHeader: mw.msg( 'mobile-frontend-languages-structured-overlay-all-languages-header' ).toLocaleUpperCase(),
				suggestedLanguagesHeader: mw.msg( 'mobile-frontend-languages-structured-overlay-suggested-languages-header' ).toLocaleUpperCase(),
				allLanguages: languages.all,
				allLanguagesCount: languages.all.length,
				suggestedLanguages: languages.suggested,
				suggestedLanguagesCount: languages.suggested.length
			},
			props
		)
	);
}

mfExtend( LanguageSearcher, View, {
	/**
	 * @inheritdoc
	 * @memberof LanguageSearcher
	 * @instance
	 */
	template: util.template( `
<div class="panel">
	<div class="panel-body search-box">
		<input type="search" class="search" placeholder="{{inputPlaceholder}}">
	</div>
</div>

<div class="overlay-content-body">
	{{#suggestedLanguagesCount}}
	<h3 class="list-header">{{suggestedLanguagesHeader}}</h3>
	<ol class="site-link-list suggested-languages">
		{{#suggestedLanguages}}
			<li>
				<a href="{{url}}" class="{{lang}}" hreflang="{{lang}}" lang="{{lang}}" dir="{{dir}}">
					<span class="autonym">{{autonym}}</span>
					{{#title}}
						<span class="title">{{title}}</span>
					{{/title}}
				</a>
			</li>
		{{/suggestedLanguages}}
	</ol>
	{{/suggestedLanguagesCount}}

	{{#allLanguagesCount}}
	<h3 class="list-header">{{allLanguagesHeader}} ({{allLanguagesCount}})</h3>
	<ul class="site-link-list all-languages">
		{{#allLanguages}}
			<li>
				<a href="{{url}}" class="{{lang}}" hreflang="{{lang}}" lang="{{lang}}" dir="{{dir}}">
					<span class="autonym">{{autonym}}</span>
					{{#title}}
						<span class="title">{{title}}</span>
					{{/title}}
				</a>
			</li>
		{{/allLanguages}}
	</ul>
	{{/allLanguagesCount}}
</div>
	` ),
	/**
	 * @inheritdoc
	 * @memberof LanguageSearcher
	 * @instance
	 */
	postRender: function () {
		// cache
		this.$siteLinksList = this.$el.find( '.site-link-list' );
		this.$languageItems = this.$siteLinksList.find( 'a' );
		this.$subheaders = this.$el.find( 'h3' );
	},
	/**
	 * Article link click event handler
	 * @memberof LanguageSearcher
	 * @instance
	 * @param {jQuery.Event} ev
	 */
	onLinkClick: function ( ev ) {
		const $link = this.$el.find( ev.currentTarget ),
			lang = $link.attr( 'lang' );

		langUtil.saveLanguageUsageCount( lang, langUtil.getFrequentlyUsedLanguages() );
	},
	/**
	 * Search input handler
	 * @memberof LanguageSearcher
	 * @instance
	 * @param {jQuery.Event} ev Event object.
	 */
	onSearchInput: function ( ev ) {
		this.filterLanguages( this.$el.find( ev.target ).val().toLowerCase() );
	},
	/**
	 * Filter the language list to only show languages that match the current search term.
	 * @memberof LanguageSearcher
	 * @instance
	 * @param {string} val of search term (lowercase).
	 */
	filterLanguages: function ( val ) {
		const filteredList = [];

		if ( val ) {
			this.options.languages.forEach( function ( language ) {
				const langname = language.langname;
				// search by language code or language name
				if ( language.autonym.toLowerCase().indexOf( val ) > -1 ||
						( langname && langname.toLowerCase().indexOf( val ) > -1 ) ||
						language.lang.toLowerCase().indexOf( val ) > -1
				) {
					filteredList.push( language.lang );
				}
			} );

			if ( this.options.variants ) {
				this.options.variants.forEach( function ( variant ) {
					// search by variant code or variant name
					if ( variant.autonym.toLowerCase().indexOf( val ) > -1 ||
						variant.lang.toLowerCase().indexOf( val ) > -1
					) {
						filteredList.push( variant.lang );
					}
				} );
			}

			this.$languageItems.addClass( 'hidden' );
			if ( filteredList.length ) {
				this.$siteLinksList.find( '.' + filteredList.join( ',.' ) ).removeClass( 'hidden' );
			}
			this.$siteLinksList.addClass( 'filtered' );
			this.$subheaders.addClass( 'hidden' );
		} else {
			this.$languageItems.removeClass( 'hidden' );
			this.$siteLinksList.removeClass( 'filtered' );
			this.$subheaders.removeClass( 'hidden' );
		}
	}
} );

module.exports = LanguageSearcher;
