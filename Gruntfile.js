/*!
 * Grunt file
 *
 * @package MobileFrontend
 */

/*jshint node:true, strict:false*/
module.exports = function ( grunt ) {
	var MW_INSTALL_PATH = grunt.option( 'MW_INSTALL_PATH' ) || process.env.MW_INSTALL_PATH;

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
		URL: process.env.MEDIAWIKI_URL || 'http://127.0.0.1:8080/w/index.php/',
		QUNIT_DEBUG: ( process.env.QUNIT_DEBUG && '&debug=true' || '' ),
		QUNIT_FILTER: ( process.env.QUNIT_FILTER && '&filter=' + process.env.QUNIT_FILTER ) || '',
		QUNIT_MODULE: ( process.env.QUNIT_MODULE && '&module=' + process.env.QUNIT_MODULE ) || '',
		files: {
			js: 'javascripts/**/*.js',
			jsTests: 'tests/qunit/**/*.js',
			jsExternals: 'javascripts/externals/**/*.js'
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
			main: [
				'<%= files.js %>'
			],
			test: {
				options: {
					config: '.jscsrctest.js',
				},
				files: {
					src: '<%= files.jsTests %>'
				}
			}
		},
		qunit: {
			all: {
				options: {
					timeout: 20000,
					urls: [
						'<%= URL %>Special:JavaScriptTest/qunit?useformat=mobile' +
						'<%= QUNIT_DEBUG %><%= QUNIT_FILTER %><%= QUNIT_MODULE %>'
					]
				}
			},
			cov: {
				options: {
					timeout: 20000,
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
				src: [ '<%= files.js %>', '!<%= files.jsExternals %>' ],
				dest: 'docs/js',
				options: {
					'builtin-classes': true,
					'external': [
						'Hogan.Template',
						'HandleBars.Template',
						'jQuery.Deferred',
						'jQuery.Event',
						'jQuery.Object',
						'jqXHR',
						'File',
						'mw.user',
						'CodeMirror',
						'OO.ui.LookupElement',
						'OO.EventEmitter'
					],
					'ignore-global': true,
					'tags': './.docs/jsduckCustomTags.rb',
					'warnings': [ '-nodoc(class,public)', '-dup_member', '-link_ambiguous' ]
				}
			}
		}
	} );

	grunt.registerTask( 'checkInstallPath', 'Check if the install path is set', function () {
		checkInstallPathNotFound( MW_INSTALL_PATH, grunt );
	} );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );
	grunt.registerTask( 'docs', [ 'checkInstallPath', 'clean:jsdocs', 'mkdir:jsdocs', 'jsduck:main' ] );

	// grunt test will be run by npm test which will be run by Jenkins
	// Do not execute qunit here, or other tasks that require full mediawiki
	// running.
	grunt.registerTask( 'test', [ 'lint' ] );

	grunt.registerTask( 'default', [ 'test' ] );
};

/**
 * Checks if the path is set, and if not it prints an error message and bails
 * out
 */
function checkInstallPathNotFound( MW_INSTALL_PATH, grunt ) {
	if ( !MW_INSTALL_PATH ) {
		grunt.log.error(
			'MW_INSTALL_PATH is not set. Please set it to your root mediawiki installation or pass the --MW_INSTALL_PATH to grunt.\n\n' +
			'\n    export MW_INSTALL_PATH=/Users/johndoe/dev/mediawiki' +
			'\n    MW_INSTALL_PATH=../../ grunt' +
			'\n    grunt --MW_INSTALL_PATH=../../'
		);
		process.exit( 1 );
	}
}
