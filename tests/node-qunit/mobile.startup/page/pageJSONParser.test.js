const dom = require( '../../utils/dom' );
const jQuery = require( '../../utils/jQuery' );
const mw = require( '../../utils/mw' );
const oo = require( '../../utils/oo' );
let Page;
let pageJSONParser;
const sinon = require( 'sinon' );
let sandbox;

QUnit.module( 'MobileFrontend pageJSONParser', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		mw.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		Page = require( '../../../../src/mobile.startup/Page' );
		pageJSONParser = require( '../../../../src/mobile.startup/page/pageJSONParser' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '.parse()', function ( assert ) {
	const p = new Page( {
			title: '<script>alert("oops, XSS possible!");</script>'
		} ),
		titleJSON = [
			{
				thumbnail: false,
				title: '<script>alert("oops, XSS possible!");</script>',
				terms: false,
				testDesc: 'Check against XSS in pageJSONParser.parse displaytitle (when title set)'
			},
			{
				thumbnail: false,
				pageprops: [],
				terms: {
					label: [
						'<script>alert("oops, XSS possible!");</script>'
					]
				},
				testDesc: 'Check against XSS in pageJSONParser.parse displaytitle (when Wikibase label set)'
			}
		];

	assert.strictEqual(
		p.getDisplayTitle(),
		'&lt;script&gt;alert(&quot;oops, XSS possible!&quot;);&lt;/script&gt;',
		'Check against XSS in Page.js constructor displaytitle (when title set)'
	);

	titleJSON.forEach( function ( json ) {
		const p = pageJSONParser.parse( json );

		assert.strictEqual(
			p.getDisplayTitle(),
			'&lt;script&gt;alert(&quot;oops, XSS possible!&quot;);&lt;/script&gt;',
			json.testDesc
		);
	} );
} );
