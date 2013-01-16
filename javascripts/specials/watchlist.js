jQuery(function() {
( function( $, M ) {

	// this goes elsewhere - common

	$.ajaxSetup( {
		url: M.getApiUrl(),
		dataType: 'json',
		data: {
			format: 'json'
		}
	} );

	M.api = function( options ) {
		var data = options.data, key, value;
		if ( data ) {
			for ( key in data ) {
				if ( typeof data[key] === 'boolean' && data[key] === false )
					delete data[key];
				} else if ( data[key] instanceof Array ) {
					data[key] = data[key].join( '|' );
				}
			}
		}
		return $.ajax( options );
	};

	function ViewBase() {}
	ViewBase.prototype.$ = function( query ) {
		return this.$el.find( query );
	};

	M.view = function( prototype ) {
		function View( el ) {
			this.$el = $( el );
		}
		View.prototype = new ViewBase();
		$.extend( View.prototype, prototype );
		return View;
	};

	M.template = function( template ) {
		return Hogan.compile( template );
	};

	// watchlist

	var THUMBNAIL_SIZE = 120;
	var WATCHLIST_ITEM = '#mw-mf-watchlist li';

	var WatchlistItem = M.view( {
		thumbnailTpl: M.template(
			'<div class="listThumb {{class}}" style="background: url({{source}})">'
		),

		title: function() {
			return this.$( 'h2' ).text();
		},

		addThumbnail: function( thumbnail ) {
			thumbnail.class = thumbnail.width > thumbnail.height ? 'listThumbH' : 'listThumbV';
			$( this.thumbnailTpl.render( thumbnail ) ).prependTo( this.$( 'a' ) );
		}
	} );

	function getThumbnails( titles, callback ) {
		M.api( {
			data: {
				action: 'query',
				prop: 'pageimages',
				pithumbsize: THUMBNAIL_SIZE,
				titles: titles
			}
		} ).done( function( res ) {
			callback( res.query.pages );
		} );
	}

	function init() {
		var items = {}, titles = [];

		$( WATCHLIST_ITEM ).each( function() {
			var item = new WatchlistItem( this ), title = item.title();
			items[title] = item;
			titles.push( title );
		} );

		getThumbnails( titles, function( images ) {
			$.each( images, function( k, image ) {
				if ( image.thumbnail ) {
					items[image.title].addThumbnail( image.thumbnail );
				}
			} );
		} );
	}

	$( init );

} )( jQuery, mw.mobileFrontend );
});
