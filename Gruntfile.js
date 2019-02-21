/* eslint-env node */
module.exports = function ( grunt ) {
	var conf = grunt.file.readJSON( 'extension.json' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jsonlint' );
	grunt.loadNpmTasks( 'grunt-notify' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.initConfig( {
		stylelint: {
			options: {
				syntax: 'less'
			},
			all: [
				'mobile.less/**/*.less',
				'resources/**/*.less'
			]
		},
		watch: {
			lint: {
				files: [ 'resources/**/*.js', 'tests/node-qunit/**/*.js' ],
				tasks: [ 'lint' ]
			},
			scripts: {
				files: [ 'resources/**/*.js', 'tests/node-qunit/**/*.js' ],
				tasks: [ 'test' ]
			},
			configFiles: {
				files: [ 'Gruntfile.js' ],
				options: {
					reload: true
				}
			}
		},
		banana: conf.MessagesDirs,
		jsonlint: {
			all: [
				'*.json',
				'**/*.json',
				'!node_modules/**',
				'!vendor/**'
			]
		}
	} );
	grunt.registerTask( 'i18n', [ 'jsonlint', 'banana' ] );
	grunt.registerTask( 'test', [ 'i18n', 'stylelint' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};
