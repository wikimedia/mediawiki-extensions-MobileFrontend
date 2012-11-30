(function() {

function select(selector) {
	if (selector.substr(0, 1) === '#') {
		var node = document.getElementById(selector.substr(1));
		if (node === null) {
			return [];
		} else {
			return [node];
		}
	} else if (selector.substr(0, 1) === '.') {
		return document.getElementsByClassName(selector.substr(1));
	} else {
		throw new Error("Unrecognized selector " + selector);
	}
}

function setDisplay(selector, display) {
	var nodes = select(selector);
	for (var i = 0; i < nodes.length; i++) {
		nodes[i].style.display = display;
	}
}

function show(selector) {
	setDisplay(selector, 'block');
}

function hide(selector) {
	setDisplay(selector, 'none');
}

var chunks = {
	file: [
		'#file',
		'.fullMedia',
		'#mw-imagepage-content'
	],
	filehistory: [
		'#filehistory',
		'#mw-imagepage-section-filehistory',
		'#mw-imagepage-reupload-link',
		'#mw-imagepage-edit-external'
	],
	filelinks: [
		'#filelinks',
		'#mw-imagepage-section-linkstoimage'
	],
	metadata: [
		'#metadata',
		'.mw-imagepage-section-metadata'
	]
};

function makeToggle(thisId) {
	return function() {
		var id, i;
		for ( id in chunks ) {
			if ( chunks.hasOwnProperty( id ) ) {
				var selectors = chunks[ id ], act;
				if ( id === thisId ) {
					act = show;
				} else {
					act = hide;
				}
				for ( i = 0; i < selectors.length; i++ ) {
					act( selectors[ i ] );
				}
			}
		}
	};
}

function addToggle(id) {
	var filetoc = document.getElementById('filetoc');
	if ( filetoc ) {
		var items = filetoc.getElementsByTagName('a');
		if ( items ) {
			for (var i = 0; i < items.length; i++) {
				var item = items[i],
					href = item.href,
					hashPos = href.search('#'),
					hash = href.substr(hashPos + 1);
				if (hash == id) {
					items[i].onclick = makeToggle(id);
				}
			}
		}
	}
}

function stopClickThrough() {
	var file = document.getElementById('file');
	if ( file ) {
		var links = file.getElementsByTagName('a');
		if (links.length) {
			links[0].onclick = function() {
				return false;
			};
		}
	}
}

function init() {
	var id, initial = 'file', section;
	for ( id in chunks ) {
		if ( chunks.hasOwnProperty( id ) ) {
			addToggle( id );
		}
	}

	stopClickThrough();

	if ( window.location.hash ) {
		section = window.location.hash.substr( 1 );
		if ( section in chunks ) {
			initial = section;
		}
	}
	makeToggle( initial )();
}
init();

})();
