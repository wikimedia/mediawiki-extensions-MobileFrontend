document.documentElement.className += ' jsEnabled page-loading';

var _mwStart = +new Date;
window._evq = window._evq || [];
if ( typeof console === 'undefined' ) {
	console = { log: function() {} };
}
if( typeof mw === 'undefined' ) {
	mw = {};
}

function _mwLogEvent( data, additionalInformation ) {
	var timestamp = + new Date, ev;
	ev = { event_id: 'mobile', delta: timestamp - _mwStart, data: data, beta: mwMobileFrontendConfig.settings.beta,
		host: window.location.hostname,
		auth: mwMobileFrontendConfig.settings.authenticated,
		session: _mwStart, page: mwMobileFrontendConfig.settings.title, info: additionalInformation || '' };
	_evq.push( ev );
	console.log( typeof JSON === 'undefined' ? ev : JSON.stringify( ev ) );
}


( function() {
var domLoaded;

if ( document.addEventListener ) {
	document.addEventListener( 'DOMContentLoaded', function() {
		domLoaded = true;
		_mwLogEvent( 'DOMContentLoaded' );
		mw.mobileFrontend.init();
	}, false );
}

window.onload = function() {
	if ( !domLoaded ) {
		mw.mobileFrontend.init();
	}
};

// if page hasn't loaded in 7s revert to non-javascript mode
window.setTimeout( function() {
	if ( !domLoaded ) {
		domLoaded = true;
		var className = document.documentElement.className.replace( ' jsEnabled page-loading', '' );
		document.documentElement.className = className;
	}
}, 7000 );

}() );
