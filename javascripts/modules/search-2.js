( function( M, $ ) {

var Overlay = M.require( 'Overlay' ), SearchOverlay,
	api = M.require( 'api' ),
	searchOverlay;

/**
 * Escapes regular expression wildcards (metacharacters) by adding a \\ prefix
 * @param {String} str a string
 * @return {String} a regular expression that can be used to search for that str
 */
function createSearchRegEx( str ) {
	str = str.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&' );
	return new RegExp( '^(' + str + ')' , 'ig' );
}

/**
 * Takes a label potentially beginning with term
 * and highlights term if it is present with strong
 *
 * @param {String} label a piece of text
 * @param {String} term a string to search for from the start
 * @return {String} safe html string with matched terms encapsulated in strong tags
 */
function highlightSearchTerm( label, term ) {
	label = $( '<span>' ).text( label ).html();
	term = $( '<span>' ).text( term ).html();

	return label.replace( createSearchRegEx( term ),'<strong>$1</strong>' );
}

SearchOverlay = Overlay.extend( {
	templateResults: M.template.get( 'overlays/search/results' ),
	template: M.template.get( 'overlays/search/search' ),
	defaults: {
		explanation: mw.msg( 'mobile-frontend-search-help' ),
		noresults: mw.msg( 'mobile-frontend-search-noresults' ),
		action: mw.config.get( 'wgScript' )
	},
	postRender: function( options ) {
		var self = this;

		this._super( options );

		this.data = this.defaults;

		this.$( 'input' ).on( 'keyup', function( ev ) {
			if ( ev.keyCode && ev.keyCode === 13 ) {
				$( this ).parents( 'form' ).submit();
			} else {
				self.performSearch();
			}
		} );
		this.results = [];
		this.$( '.clear' ).on( 'click', function() {
			self.$( 'input' ).val( '' ).focus();
		} );
	},
	/**
	 * A wrapper for $.ajax() to be used when calling server APIs.
	 * Sends a GET request. See ajax() for details.
	 *
	 * @param {Array} results list of search results with label and url properties set
	 */
	writeResults: function( results ) {
		var $list = this.$( 'ul.suggestions-results' );

		this.data.results = results || [];
		$list.
			html( this.templateResults.render( this.data ) );

		if ( results ) {
			if ( results.length > 0 ) {
				this.$( '.no-results' ).remove();
			}
		} else {
			this.$( '.no-results' ).remove();
		}
		this.emit( 'write-results', this );
	},
	performSearch: function() {
		var self = this,
			term = this.$( 'input' ).val();

		function completeSearch( data ) {
			data = $.map( data[ 1 ], function( item ) {
				return {
					label: highlightSearchTerm( item, term ),
					title: item,
					url: M.history.getArticleUrl( item )
				};
			} );

			self.writeResults( data );
			self.$( 'input' ).removeClass( 'searching' );
		}

		clearTimeout( this.timer );
		if ( term.length > 0 ) {
			this.timer = setTimeout( function () {
				self.$( 'input' ).addClass( 'searching' );
				api.get( {
					search: term,
					action: 'opensearch',
					namespace: 0,
					limit: 15
				} ).done( completeSearch );
			}, 500 );
		}
	},
	showAndFocus: function() {
		this.show();
		this.$( 'input' ).focus().select();
	}
} );

searchOverlay = new SearchOverlay();

function init() {
	// don't use focus event (https://bugzilla.wikimedia.org/show_bug.cgi?id=47499)
	$( '#searchInput' ).on( 'touchend keydown', function( ev ) {
		// if touch or key not Tab or Shift
		if ( ev.type === 'touchend' || ( ev.which !== 9 && ev.which !== 16 ) ) {
			searchOverlay.showAndFocus();
		}
	} );
}
init();

M.define( 'search', {
	SearchOverlay: SearchOverlay,
	overlay: searchOverlay,
	highlightSearchTerm: highlightSearchTerm
} );

}( mw.mobileFrontend, jQuery ));
