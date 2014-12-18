( function ( M ) {

	var CategoryApi,
		SearchApi = M.require( 'modules/search/SearchApi' );

	/**
	 * Api for CategoryOverlay
	 * @class CategoryApi
	 * @extends Api
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
		 * @returns {jquery.Deferred}
		 */
		save: function ( title, categories ) {
			return this.postWithToken( 'edit', {
				action: 'edit',
				title: title,
				appendtext: categories,
				summary: mw.msg( 'mobile-frontend-categories-summary' )
			} );
		}
	} );

	M.define( 'modules/categories/CategoryApi', CategoryApi );

}( mw.mobileFrontend, jQuery ) );
