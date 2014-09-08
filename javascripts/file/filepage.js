( function( $ ) {

function stopClickThrough() {
	var file = document.getElementById( 'file' ),
		links;
	if ( file ) {
		links = file.getElementsByTagName( 'a' );
		if (links.length) {
			links[0].onclick = function() {
				return false;
			};
		}
	}
}

function scrollToLicensingInformation() {
	var $shared;

	if ( window.location.hash !== '#mw-jump-to-license' ) {
		return;
	}
	$shared = $( '#shared-image-desc' );
	window.location.hash = $shared.length > 0 ? '#shared-image-desc' : '#mw-imagepage-content';
}

function init() {
	stopClickThrough();
	scrollToLicensingInformation();
}
init();

} )( jQuery );
