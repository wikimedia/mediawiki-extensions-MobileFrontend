/*!
 * Grunt file
 *
 * @package MobileFrontend
 */

/*jshint node:true, strict:false*/
/*global module*/
module.exports = function ( grunt ) {

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'javascripts/**/*.js',
				'!javascripts/externals/**/*.js'
			]
		},
		jscs: {
			src: '<%= jshint.all %>',
			options: {
				config: ".jscs.json"
			}
		}
	} );

	// Jenkins automatically runs grunt test for us
	grunt.registerTask( 'test', [ 'jshint', 'jscs' ] );
	grunt.registerTask( 'default', [ 'jshint', 'jscs' ] );

};