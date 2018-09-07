global.window = {};
global.document = {};
global.mw = window.mw = require( './mockMediaWiki' )();
global.OO = window.OO = require( './mockOO' )();
global.$ = window.$ = require( './mockJQuery' );
