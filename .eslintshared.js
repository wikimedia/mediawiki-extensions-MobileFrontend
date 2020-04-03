// "no-restricted-properties" rules are not properly merged when just using "extends".
// Therefore we have to have this file which calls a custom merge function.
// The merge function calls Object.assign with special handling for configuration such as
// `no-restricted-properties` and `no-restricted-syntax` which are array based - ensuring the two
// values being merged are concatenated

/* eslint-disable quote-props, quotes, one-var */
const merge = require( './node_modules/eslint-config-wikimedia/language/merge.js' );
const rules = {
	"extends": [
		"wikimedia/jquery",
		"wikimedia/mediawiki"
	],
	"globals": {
		"$": "off",
		"OO": "readonly"
	},
	"rules": {
		"no-restricted-properties": [2,
			{
				"property": "done",
				"message": "The method `done` if used with Deferred objects is incompatible with ES6 Promises. Please use `then`."
			},
			{
				"property": "fail",
				"message": "The method `fail` if used with Deferred objects is incompatible with ES6 Promises. Please use `then`."
			},
			{
				"property": "always",
				"message": "The method `always` if used with Deferred objects is incompatible with ES6 Promises. Please use `then`."
			},
			{
				"object": "window",
				"property": "history",
				"message": "Please use mediawiki.router"
			},
			{
				"object": "window",
				"property": "location",
				"message": "Please use mediawiki.router"
			}
		],
		"object-property-newline": "error",
		"computed-property-spacing": "off",
		// Not using ResourceLoader modules
		"mediawiki/valid-package-file-require": "off",
		"no-use-before-define": "off",
		"no-underscore-dangle": "off",
		"no-jquery/no-class-state": "off",
		"no-jquery/no-global-selector": "off"
	}
};
module.exports = Object.assign(
	rules,
	merge( rules, require( './node_modules/eslint-config-wikimedia/language/not-es5.js' ) )
);
