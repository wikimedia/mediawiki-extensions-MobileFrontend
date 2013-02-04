document.documentElement.className += ' jsEnabled page-loading';

if ( typeof console === 'undefined' ) {
	console = { log: function() {} };
}
