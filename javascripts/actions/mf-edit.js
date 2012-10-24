/*global mw, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true */
( function( M, $ ) {

var m = ( function() {
	var $editArea = $( 'form#editform textarea' ).hide();

	function makeSection( sectionId ) {
		var $section = $( '<div class="section">' ).insertBefore( $editArea ),
			$heading = $( '<h2 class="section_heading">' ).attr( 'id', 'section_edit' + sectionId ),
			$content = $( '<div class="content_block">' );
		
		if ( sectionId > 0 ) {
			$section.append( $heading );
			$content.attr( { 'id': 'content_edit' + sectionId } );
		} else {
			$content.addClass( 'openSection' );
		}

		$section.append( $content );
		return $section;
	}

	function init() {
		var wikitext = $editArea.val(),
			$loader,
			parts = wikitext.split( '\n\n' ),
			headingLocation, section_id = 0,
			i, val, heading, $el,
			$section = makeSection( section_id );

		for ( i = 0; i < parts.length; i++ ) {
			val = parts[ i ];
			if ( val.indexOf( '=' ) === 0 ) {
				headingLocation = $section.find( '.content_block' );
				val = val.split( '\n' );
				heading = val[ 0 ];
				val = val[ 1 ];
				$el = $( '<input class="segment">' ).
					val( heading );
				if ( heading.indexOf( '====' ) > -1 ) {
					$el.addClass( 'h4' );
				} else if ( heading.indexOf( '===' ) > -1 ) {
					$el.addClass( 'h3' );
				} else if ( heading.indexOf( '==' ) > -1 ) {
					section_id += 1;
					$section = makeSection( section_id );
					headingLocation = $section.find( '.section_heading' );
					$el.addClass( 'h2' );
				}
				$el.on( 'click', function( ev ) {
					ev.stopPropagation();
				} ).appendTo( headingLocation )
			}

			$( '<textarea class="segment">' ).val( val ).appendTo( $section.find( '.content_block' ) );
		}

		function concatTextAreas() {
			var newVal = [];
			$( 'form#editform .segment' ).each( function() {
				newVal.push( $( this ).val() );
				if ( this.nodeName === 'INPUT' ) {
					newVal.push( '\n' );
				} else {
					newVal.push( '\n\n' );
				}
			} );
			return newVal.join( '' );
		}

		$loader = $( '<div class="loader">' ).text( M.message( 'mobile-frontend-page-saving', M.setting( 'title' ) ) ).
			hide().insertBefore( '#content_0' );
		$( 'form#editform' ).on( 'submit', function() {
			$( '#content_0' ).hide();
			$loader.show();
			var val = concatTextAreas();
			$editArea.val( val );
		} );

		mw.mobileFrontend.getModule( 'toggle' ).enableToggling(); // FIXME: adds dependency to toggle module
	}
	return {
		init: init
	};

} () );

M.registerModule( 'edit', m );
}( mw.mobileFrontend, jQuery ) );

