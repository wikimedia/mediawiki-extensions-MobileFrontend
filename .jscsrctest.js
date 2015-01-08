var fs = require( 'fs' ),
	config = JSON.parse( fs.readFileSync( '.jscsrc' ) );

delete config.jsDoc;

module.exports = exports = config;
