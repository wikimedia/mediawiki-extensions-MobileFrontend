/*jshint node:true */
var fs = require( 'fs' ),
	config = JSON.parse( fs.readFileSync( __dirname + '/../.jscsrc' ) );

delete config.jsDoc;

module.exports = exports = config;
