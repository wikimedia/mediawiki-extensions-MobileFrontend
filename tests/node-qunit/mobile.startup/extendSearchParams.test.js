let sandbox, extendSearchParams;
const
	jQuery = require( '../utils/jQuery' ),
	mediaWiki = require( '../utils/mw' ),
	dom = require( '../utils/dom' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend extendSearchParams.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		mediaWiki.setUp( sandbox, global );
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		sandbox.stub( mw.config, 'get' )
			.withArgs( 'wgMFSearchAPIParams' ).returns(
				{
					foo: 'bar'
				}
			)
			.withArgs( 'wgMFDisplayWikibaseDescriptions' ).returns(
				{
					search: true,
					nearby: false
				}
			)
			.withArgs( 'wgMFQueryPropModules' ).returns( [ 'baz' ] );
		extendSearchParams = require( '../../../src/mobile.startup/extendSearchParams' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'it throws if the feature is invalid', function ( assert ) {
	const expectedError = new Error( '"foo" isn\'t a feature that shows Wikibase descriptions.' );

	assert.throws( function () {
		extendSearchParams( 'foo', {} );
	}, expectedError );
} );

QUnit.test( 'it extends the parameters', function ( assert ) {
	const params = extendSearchParams( 'search', {
			qux: 'quux',
			prop: [ 'corge' ]
		} ),
		expectedParams = {
			action: 'query',
			formatversion: 2,
			qux: 'quux',
			foo: 'bar', // from wgMFSearchAPIParams
			prop: [ 'corge', 'baz', 'description' ] // from wgMFQueryPropModules and Wikibase-specific
		};

	assert.propEqual( params, expectedParams );
} );

QUnit.test( 'it doesn\'t include Wikibase-specific parameters if the feature is disabled', function ( assert ) {
	const params = extendSearchParams( 'nearby', {
		qux: 'quux'
	} );

	assert.strictEqual( params.prop.indexOf( 'description' ), -1 );
	assert.strictEqual( params.wbptterms, undefined );
} );

QUnit.test( 'it adds the MobileFrontend configuration to given terms types', function ( assert ) {
	const params = extendSearchParams( 'search', {
		wbptterms: 'grault'
	} );

	assert.strictEqual(
		params.wbptterms,
		'grault',
		'The given "wbptterms" is added to the default.'
	);
} );

QUnit.test( 'it prioritizes MobileFrontend configuration', function ( assert ) {
	const params = extendSearchParams( 'search', {
			foo: 'quux'
		} ),
		expectedParams = {
			action: 'query',
			formatversion: 2,
			foo: 'bar',
			prop: [ 'baz', 'description' ]
		};

	assert.propEqual(
		params,
		expectedParams,
		'The value of "foo" is overridden by the configuration.'
	);
} );

QUnit.test( 'it is variadic', function ( assert ) {
	const params = extendSearchParams(
			'search',
			{
				baz: 'qux'
			},
			{
				quux: 'corge'
			}
		),
		expectedParams = {
			action: 'query',
			formatversion: 2,
			foo: 'bar',
			baz: 'qux',
			quux: 'corge',
			prop: [ 'baz', 'description' ]
		};

	assert.propEqual( params, expectedParams );
} );
