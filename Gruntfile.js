/*!
 * Grunt file
 *
 * @package MobileFrontend
 */

/*jshint node:true, strict:false*/
/*global module*/
module.exports = function ( grunt ) {
	var MW_INSTALL_PATH = grunt.option('MW_INSTALL_PATH') || '../..';

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-qunit-istanbul' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-notify' );
	grunt.loadNpmTasks( 'grunt-svg2png' );
	grunt.loadNpmTasks( 'grunt-jsduck' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-mkdir' );

	grunt.initConfig( {
		URL: process.env.URL || 'http://127.0.0.1:8080/w/index.php/',
		QUNIT_FILTER: ( process.env.QUNIT_FILTER && '&filter=' + process.env.QUNIT_FILTER ) || '',
		QUNIT_MODULE: ( process.env.QUNIT_MODULE && '&module=' + process.env.QUNIT_MODULE ) || '',
		files: {
			js: 'javascripts/**/*.js',
			jsTests: 'tests/qunit/**/*.js',
			jsExternals: 'javascripts/externals/**/*.js',
			mantleJs: MW_INSTALL_PATH + '/extensions/Mantle/javascripts/**/*.js'
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
			main: ['<%= jshint.sources %>'],
			doc: {
				files: {
					src: ['<%= jshint.sources %>']
				},
				options: {
					config: ".jscs-jsdocrc"
				}
			}
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
		},
		mkdir: {
			jsdocs: {
				options: {
					create: [ 'docs/js' ]
				}
			}
		},
		clean: {
			jsdocs: [ 'docs/js' ]
		},
		jsduck: {
			main: {
				src: [ '<%= files.mantleJs %>', '<%= files.js %>', '!<%= files.jsExternals %>' ],
				dest: 'docs/js',
				options: {
					'builtin-classes': true,
					'external': [
						'Hogan.Template',
						'HandleBars.Template',
						'jQuery.Deferred',
						'jQuery.Event',
						'jQuery.Object',
						'mw.user',
						'OO.EventEmitter'
					],
					'ignore-global': true,
					'warnings': [ '-no_doc', '-dup_member', '-link_ambiguous' ]
				}
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs:main' ] );
	grunt.registerTask( 'docs', [ 'clean:jsdocs', 'mkdir:jsdocs', 'jsduck:main' ] );

	// grunt test will be run by npm test which will be run by Jenkins
	// Do not execute qunit here, or other tasks that require full mediawiki
	// running.
	grunt.registerTask( 'test', [ 'lint' ] );

	grunt.registerTask( 'default', [ 'test' ] );
	grunt.registerTask( 'build-icons', [ 'svg2png' ] );
};
