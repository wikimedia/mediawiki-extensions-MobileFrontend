( function ( M, $ ) {
	/**
	 * Provides a generic widget for looking up items in WikiBase instances.
	 * @cfg {Object} config Default configuration
	 * @cfg {WikiDataApi} config.api an instance of an api to use.
	 * @cfg {String} config.claimId to feedback results to.
	 * @cfg {jQuery.Object} config.appendToAnswer element to append selected items to.
	 * @class WikiDataItemLookupInputWidget
	 * @extends OO.ui.LookupElement
	 */
	function WikiDataItemLookupInputWidget( config ) {
		OO.ui.TextInputWidget.call( this, config );
		OO.ui.LookupElement.call( this, config );

		this.api = config.api;
		this.claimId = config.claimId;
		this.appendToAnswer = config.appendToAnswer;
	}
	OO.inheritClass( WikiDataItemLookupInputWidget, OO.ui.TextInputWidget );
	OO.mixinClass( WikiDataItemLookupInputWidget, OO.ui.LookupElement );

	/**
	 * See OOJS UI for documentation
	 * @param {Object} data
	 * @ignore
	 */
	WikiDataItemLookupInputWidget.prototype.onLookupMenuItemChoose = function ( data ) {
		var $answer = $( '<div>' ).data( 'id', this.claimId )
			.text( data.data.label ).data( 'value', data.data.id );

		// FIXME: Build in similar way to Icon class using anchor abstraction
		// FIXME: i18n
		$( '<button class="mw-ui-anchor mw-ui-destructive">' ).text( 'Remove' ).on( 'click', function () {
				$( this ).parent().remove();
			} ).appendTo( $answer );
		$( this.appendToAnswer ).append( $answer );
		this.$element.find( 'input' ).val( '' );
	};

	/**
	 * See OOJS UI for documentation
	 * @ignore
	 */
	WikiDataItemLookupInputWidget.prototype.getLookupRequest = function () {
		return this.api.searchForItem( this.value );
	};

	/**
	 * See OOJS UI for documentation
	 * @ignore
	 */
	WikiDataItemLookupInputWidget.prototype.abortLookupRequest = function () {
		this.api.abort();
	};

	/**
	 * See OOJS UI for documentation
	 * @ignore
	 * @param {Object} response
	 */
	WikiDataItemLookupInputWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response;
	};

	/**
	 * See OOJS UI for documentation
	 * @param {Object} data
	 * @ignore
	 */
	WikiDataItemLookupInputWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		return $.map( data, function ( item ) {
			var description = item.description || '',
				$label = $( '<div class="wikidata-suggestion">' ).text( item.label )
					.append( $( '<em>' ).text( description ) );

			return new OO.ui.MenuOptionWidget( {
				data: {
					id: item.id,
					label: item.label
				},
				label: $label
			} );
		} );
	};
	M.define( 'modules/infobox/WikiDataItemLookupInputWidget', WikiDataItemLookupInputWidget );
}( mw.mobileFrontend, jQuery ) );
