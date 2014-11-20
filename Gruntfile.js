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
	grunt.loadNpmTasks( 'grunt-qunit-istanbul' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-notify' );
	grunt.loadNpmTasks( 'grunt-svg2png' );

	grunt.initConfig( {
		URL: process.env.URL || 'http://127.0.0.1:8080/w/index.php/',
		QUNIT_FILTER: ( process.env.QUNIT_FILTER && '&filter=' + process.env.QUNIT_FILTER ) || '',
		QUNIT_MODULE: ( process.env.QUNIT_MODULE && '&module=' + process.env.QUNIT_MODULE ) || '',
		files: {
			js: 'javascripts/**/*.js',
			jsTests: 'tests/qunit/**/*.js',
			jsExternals: 'javascripts/externals/**/*.js'
		},
		svg2png: {
			dist: {
				src: 'less/images/icons/*.svg'
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			tests: '<%= files.jsTests %>',
			sources: [
				'<%= files.js %>',
				'!<%= files.jsExternals %>'
			]
		},
		jscs: {
			sources: '<%= jshint.sources %>'
		},
		qunit: {
			all: {
				options: {
					urls: [
						'<%= URL %>Special:JavaScriptTest/qunit?useformat=mobile' +
						'<%= QUNIT_FILTER %><%= QUNIT_MODULE %>'
					]
				}
			},
			cov: {
				options: {
					urls: [
						'<%= URL %>Special:JavaScriptTest/qunit?debug=true&useformat=mobile' +
						'<%= QUNIT_FILTER %><%= QUNIT_MODULE %>'
					],
					coverage: {
						prefixUrl: 'w/', // Prefix url on the server
						baseUrl: '../../', // Path to assets from the server (extensions/Mobile...)
						src: [ '<%= files.js %>', '!<%= files.jsExternals %>' ],
						instrumentedFiles: 'tests/report/tmp',
						htmlReport: 'tests/report'
					}
				}
			}
		},
		watch: {
			lint: {
				files: [ '<%= files.js %>', '<%= files.jsTests %>' ],
				tasks: [ 'lint' ]
			},
			scripts: {
				files: [ '<%= files.js %>', '<%= files.jsTests %>' ],
				tasks: [ 'test' ]
			},
			configFiles: {
				files: [ 'Gruntfile.js' ],
				options: {
					reload: true
				}
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );

	// grunt test will be run by npm test which will be run by Jenkins
	// Do not execute qunit here, or other tasks that require full mediawiki
	// running.
	grunt.registerTask( 'test', [ 'lint' ] );

	grunt.registerTask( 'default', [ 'test' ] );
	grunt.registerTask( 'build-icons', [ 'svg2png' ] );
};
