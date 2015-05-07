( function ( M ) {

	var CategoryApi,
		SearchApi = M.require( 'modules/search/SearchApi' );

	/**
	 * Api for CategoryOverlay
	 * @class CategoryApi
	 * @extends SearchApi
	 */
	CategoryApi = SearchApi.extend( {
		/**
		 * @inheritdoc
		 */
		searchNamespace: 14,
		/**
		 * @inheritdoc
		 */
		getApiData: function ( query ) {
			return {
				action: 'query',
				list: 'prefixsearch',
				pssearch: query,
				pslimit: 5,
				psnamespace: this.searchNamespace
			};
		},

		/**
		 * Saves the categories passed to this function to the page
		 * @param {String} title Title of the current page (to add the categories to)
		 * @param {String} categories List of Categories to add
		 * @returns {jQuery.Deferred}
		 */
		save: function ( title, categories ) {
			return this.postWithToken( 'edit', {
				action: 'edit',
				title: title,
				appendtext: categories,
				summary: mw.msg( 'mobile-frontend-categories-summary' )
			} );
		},

		/**
		 * Returns the categories the title belongs to.
		 * @param {String} title Title of the current page (to add the categories to)
		 * @returns {jQuery.Deferred}
		 */
		getCategories: function ( title ) {
			return this.get( {
				action: 'query',
				prop: 'categories',
				titles: title,
				clprop: 'hidden',
				cllimit: 50 // FIXME: Replace with InfiniteScroll
			} );
		}
	} );

	M.define( 'modules/categories/CategoryApi', CategoryApi );

}( mw.mobileFrontend, jQuery ) );
