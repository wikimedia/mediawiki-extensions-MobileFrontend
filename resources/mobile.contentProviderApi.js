// This injects a global ajaxSend event which ensures origin=* is added to all
// ajax requests. This helps with compatibility of VisualEditor! This is
// intentionally simplistic as all queries we care about are guaranteed to
// already have a query string

// eslint-disable-next-line no-undef
$( document ).ajaxSend( function ( _event, _jqxhr, settings ) {
	settings.url += '&origin=*';
} );
