'use strict';

const { defineConfig, globalIgnores } = require( 'eslint/config' );
const globals = require( 'globals' );
const wikimedia = require( 'eslint-config-wikimedia/flat' );

// Shared by the root and resources (was .eslintshared.js)
const sharedConfig = [
	...wikimedia( 'jquery', 'mediawiki' ),
	{
		languageOptions: {
			globals: {
				$: 'off',
				OO: 'readonly',
				self: 'off'
			}
		},
		rules: {
			'no-restricted-properties': [
				'error',
				{
					property: 'done',
					message: 'The method `done` if used with Deferred objects is incompatible with ES6 Promises. Please use `then`.'
				},
				{
					property: 'fail',
					message: 'The method `fail` if used with Deferred objects is incompatible with ES6 Promises. Please use `then`.'
				},
				{
					property: 'always',
					message: 'The method `always` if used with Deferred objects is incompatible with ES6 Promises. Please use `then`.'
				},
				{
					object: 'window',
					property: 'history',
					message: 'Please use mediawiki.router'
				},
				{
					object: 'window',
					property: 'location',
					message: 'Please use mediawiki.router'
				}
			],
			'object-property-newline': 'error',
			'computed-property-spacing': 'off',
			// Not using ResourceLoader modules
			'mediawiki/valid-package-file-require': 'off',
			'no-underscore-dangle': 'off',
			'no-jquery/no-class-state': 'off',
			'no-jquery/no-global-selector': 'off'
		}
	}
];

// Directories with their own config, which other configs don't apply to.
// These were directories with `"root": true` in .eslintrc.json.
const rootDirs = {
	resources: [ 'resources/**' ],
	tests: [ 'tests/node-qunit/**' ]
};

module.exports = defineConfig( [
	globalIgnores( [
		// Upstream code
		'libs/',
		'resources/lib/',

		// Build
		'coverage/',
		'docs/',
		'vendor/',

		// Language files written automatically by TranslateWiki
		'i18n/**/*.json',
		'!i18n/**/en.json',
		'!i18n/**/qqq.json'
	] ),

	// Build scripts, etc.
	{
		ignores: Object.values( rootDirs ).flat(),
		extends: [ wikimedia( 'server' ), sharedConfig ]
	},

	// Code which runs in MediaWiki
	{
		files: rootDirs.resources,
		extends: [ wikimedia( 'client' ), sharedConfig ],
		languageOptions: {
			// CommonJS globals (was `env: { commonjs: true }`)
			globals: {
				require: 'readonly',
				module: 'readonly',
				exports: 'writable',
				global: 'readonly'
			}
		},
		rules: {
			'no-shadow': 'warn',
			'object-shorthand': 'warn',
			'prefer-arrow-callback': 'warn',
			'jsdoc/check-tag-names': 'off',
			'jsdoc/no-undefined-types': 'off',
			'jsdoc/require-returns': 'off',
			'jsdoc/require-property-type': 'off',
			'jsdoc/valid-types': 'off',
			'unicorn/prefer-includes': 'warn'
		}
	},

	// QUnit tests, which run in Node
	{
		files: rootDirs.tests,
		extends: [ wikimedia( 'server', 'mediawiki', 'qunit' ) ],
		languageOptions: {
			// From `env: { browser: true }`
			globals: globals.browser
		},
		rules: {
			'compat/compat': 'off',
			'computed-property-spacing': 'off',
			'mediawiki/valid-package-file-require': 'off',
			'no-underscore-dangle': 'off',
			strict: 'off'
		}
	}
] );
