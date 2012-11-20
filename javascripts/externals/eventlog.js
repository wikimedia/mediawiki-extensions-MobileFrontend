/**
 * Event Logging Beacon
 *
 * Implements sending data to the server via an image beacon. The image's URI
 * points to a special endpoint that is configured to return an HTTP 204 ("No
 * Content") response. Data is serialized into a query string that is appended
 * to the image URI.
 *
 * Note (07-July-2012): incoming requests are currently not stored or
 * aggregated by the back end.
 *
 * @author     Ori Livneh <ori@wikimedia.org>
 * @version    $Id$
 */
( function ( window, document, encode ) {
	'use strict';

	var ENDPOINT = '//bits.wikimedia.org/event.gif?';
	var POLL_INTERVAL = 500;  // in miliseconds.

	window._evq = window._evq || [];

	function serialize( ev ) {

		var kv = [], key, param;

		if ( !( 'event_id' in ev ) || !( ev.event_id.length ) ) {
			throw new Error( 'Event is missing "event_id" key' );
		}

		for ( key in ev ) {
			param = encode( key ) + '=' + encode( ev[ key ] );
			key === 'event_id' ? kv.unshift( param ) : kv.push( param );
		}

		return kv.join( '&' );
	}

	function track( ev ) {

		var beacon, uri;

		uri = ENDPOINT + serialize( ev );

		// URLs > 2000 characters are unsafe:
		// * http://www.boutell.com/newfaq/misc/urllength.html
		// * http://stackoverflow.com/questions/417142
		if ( uri.length > 2000 ) {
			throw new Error( 'track(): request URI too long' );
		}

		beacon = document.createElement( 'img' );
		beacon.src = uri;
	}


	function dequeue() {
		var e;
		while ( ( e = _evq.pop() ) !== undefined ) {
			track( e );
		}
	}

	window.setInterval( dequeue, POLL_INTERVAL );
	window.onbeforeunload = dequeue;

	window._evq.track = track;

} ( window, document, window.encodeURIComponent ));
