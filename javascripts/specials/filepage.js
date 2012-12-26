( function() {

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

function init() {
	stopClickThrough();
}
init();

} )();
