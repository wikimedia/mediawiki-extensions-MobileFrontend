( function ( M, $, OO ) {
	/**
	 * @class CategoryLookupInputWidget
	 * @extends OO.ui.LookupElement
	 */
	function CategoryLookupInputWidget( options ) {
		this.$element = $( '<div>' );
		this.api = options.api;
		this.$suggestions = options.suggestions;
		this.categories = options.categories;
		this.$saveButton = options.saveButton;
		options.placeholder = mw.msg( 'mobile-frontend-categories-search' );
		OO.ui.TextInputWidget.call( this, options );
		OO.ui.LookupElement.call( this, options );
	}
	OO.inheritClass( CategoryLookupInputWidget, OO.ui.TextInputWidget );
	OO.mixinClass( CategoryLookupInputWidget, OO.ui.LookupElement );

	/**
	 * Handle a click on a suggested item. Add it to the list of added categories and show save button.
	 * @param {Object} data Data of the clicked element
	 */
	CategoryLookupInputWidget.prototype.onLookupMenuItemChoose = function ( data ) {
		this.$suggestions.append(
			mw.template.get( 'mobile.categories', 'CategoryButton.hogan' ).render( {
				title: data.data,
				displayname: data.label
			} )
		);
		this.$saveButton.prop( 'disabled', false );
	};

	/**
	 * Returns the result of the search request.
	 * @return {jQuery.Deferred}
	 */
	CategoryLookupInputWidget.prototype.getLookupRequest = function () {
		return this.api.search( this.value );
	};

	/**
	 * Get lookup cache item from server response data.
	 * @param {Mixed} response Response from server
	 * @return {Mixed} Cached result response
	 */
	CategoryLookupInputWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		var title = new mw.Title( this.value, 14 );

		// add user input as a possible (actually not existing) category
		response.results.unshift( {
			title: title.toString(),
			displayname: title.getNameText()
		} );

		return response;
	};

	/**
	 * Get a list of menu item widgets from the data stored by the lookup request's done handler.
	 * @param {Mixed} data Cached result data, usually an array
	 * @return {Array} Array of OO.ui.MenuOptionWidget
	 */
	CategoryLookupInputWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		var result = [],
			self = this;

		$.each( data.results, function ( i, value ) {
			if (
				!$( 'button[data-title="' + value.title + '"]' ).length &&
				$.inArray( value.displayname, self.categories ) === -1
			) {
				result.push(
					new OO.ui.MenuOptionWidget( {
						data: value.title,
						label: value.displayname
					} )
				);
			}
		} );
		return result;
	};

	M.define( 'modules/categories/CategoryLookupInputWidget', CategoryLookupInputWidget );

}( mw.mobileFrontend, jQuery, OO ) );
