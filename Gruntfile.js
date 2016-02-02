// jscs:disable jsDoc
/*jshint node:true, strict:false */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jsonlint' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-notify' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );

	grunt.initConfig( {
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'.'
			],
			test: {
				files: {
					src: 'tests/qunit/**/*.js'
				}
			}
		},
		jscs: {
			main: [
				'**/*.js',
				'!tests/qunit/**'
			],
			test: {
				options: {
					config: 'tests/.jscsrc.js'
				},
				files: {
					src: 'tests/qunit/**/*.js'
				}
			}
		},
		watch: {
			lint: {
				files: [ 'resources/**/*.js', 'tests/qunit/**/*.js' ],
				tasks: [ 'lint' ]
			},
			scripts: {
				files: [ 'resources/**/*.js', 'tests/qunit/**/*.js' ],
				tasks: [ 'test' ]
			},
			configFiles: {
				files: [ 'Gruntfile.js' ],
				options: {
					reload: true
				}
			}
		},
		banana: {
			all: 'i18n/'
		},
		jsonlint: {
			all: [
				'*.json',
				'**/*.json',
				'!node_modules/**'
			]
		}
	} );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs', 'jsonlint', 'banana' ] );
	grunt.registerTask( 'test', [ 'lint' ] );

	grunt.registerTask( 'default', [ 'test' ] );
};
