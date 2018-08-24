const
	newMockMediaWiki = require( './MockMediaWiki.test' ),
	newMockOO = require( './MockOO.test' );

global.mw = newMockMediaWiki();
global.OO = newMockOO();
