( function( M, $ ) {

var $infobox = $( '.infobox' ).eq( 0 ),
	infoboxTop, infoboxLength, infoboxBottom, interval, logData,
	viewportHeight = $( window ).height(),
	scrollingHasCommenced = false,
	userScrolledToInfobox = false,
	userScrolledPastInfobox = false;

function attemptLogEvent() {
	return $.Deferred().resolve();
}

function detectInfobox() {
	var scrollTop = $( 'body' ).scrollTop(),
		scrollBottom = scrollTop + viewportHeight;
	if ( scrollTop > 0 && !scrollingHasCommenced ) {
		scrollingHasCommenced = true;
		logData.start = new Date().getTime();
	}

	// The infobox is in view when the top is less than the bottom of the screen
	if ( !userScrolledToInfobox && infoboxTop < scrollBottom ) {
		userScrolledToInfobox = true;
		logData['in'] = new Date().getTime();
	} else if ( userScrolledToInfobox && !userScrolledPastInfobox && infoboxBottom < scrollTop ) {
		userScrolledPastInfobox = true;
		logData.out = new Date().getTime();
	}
	attemptLogEvent();
}

if ( $infobox.length > 0 ) {
	infoboxTop = $infobox.offset().top;
	infoboxLength = $infobox.height();
	infoboxBottom = infoboxLength + infoboxTop;
	logData = {
		wasInteraction: false,
		width: $( window ).width(),
		height: $( window ).height(),
		infoboxLength: infoboxLength,
		userAgent: navigator.userAgent
	};

	// When something in infobox is clicked mark interaction
	$infobox.find( 'a' ).on( 'click', function( ev ) {
		var href = $( this ).attr( 'href' );
		ev.preventDefault();
		logData.out = new Date().getTime();
		logData.wasInteraction = true;
		attemptLogEvent().always( function() {
			window.location.href = href;
		} );
	} );
	// window.scroll fires far too often and is unperformant to use for this sort of thing
	// http://ejohn.org/blog/learning-from-twitter/
	// "It’s a very, very, bad idea to attach handlers to the window scroll event."
	interval = setInterval( detectInfobox, 500 );
}

}( mw.mobileFrontend, jQuery ));
