var
	WatchstarGateway = require( '../../../../src/mobile.startup/watchstar/WatchstarGateway' ),
	// setup dependencies
	dom = require( '../../utils/dom' ),
	jQuery = require( '../../utils/jQuery' ),
	sinon = require( 'sinon' ),
	mediawiki = require( '../../utils/mw' ),
	util = require( '../../../../src/mobile.startup/util' ),
	GET_RESPONSE = {
		batchcomplete: true,
		query: {
			pages: [ {
				pageid: 123,
				ns: 0,
				title: 'An unwatched page',
				contentmodel: 'wikitext',
				pagelanguage: 'en',
				pagelanguagehtmlcode: 'en',
				pagelanguagedir: 'ltr',
				touched: '2018-05-01T01:39:12Z',
				lastrevid: 10,
				length: 3,
				new: true,
				watched: false
			}, {
				pageid: 456,
				ns: 0,
				title: 'A watched page',
				contentmodel: 'wikitext',
				pagelanguage: 'en',
				pagelanguagehtmlcode: 'en',
				pagelanguagedir: 'ltr',
				touched: '2018-05-01T01:43:31Z',
				lastrevid: 24,
				length: 3,
				new: true,
				watched: true
			} ]
		}
	},
	sandbox;

QUnit.module( 'MobileFrontend: WatchstarGateway.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'getStatuses(nonempty)', function ( assert ) {
	var
		subject,
		expected,
		api,
		mockAPI;

	api = { get: function () {} };
	mockAPI = sandbox.mock( api );

	mockAPI
		.expects( 'get' )
		.withArgs( sandbox.match.has( 'pageids' ) )
		.once()
		.returns( util.Deferred().resolve( {
			batchcomplete: true,
			query: { pages: [ GET_RESPONSE.query.pages[0] ] }
		} ) );
	mockAPI
		.expects( 'get' )
		.withArgs( sandbox.match.has( 'titles' ) )
		.once()
		.returns( util.Deferred().resolve( {
			batchcomplete: true,
			query: { pages: [ GET_RESPONSE.query.pages[1] ] }
		} ) );

	subject = new WatchstarGateway( api );
	return subject.getStatuses(
		[ '123' ], [ 'A watched page' ]
	).then( function ( actual ) {
		expected = {
			'An unwatched page': false,
			'A watched page': true
		};
		assert.propEqual( actual, expected, 'The correct result is returned.' );
		mockAPI.verify();
	} );
} );

QUnit.test( 'getStatuses(empty)', function ( assert ) {
	var
		subject,
		expected,
		api,
		mockAPI;

	api = { get: function () {} };
	mockAPI = sandbox.mock( api )
		.expects( 'get' )
		// No HTTP requests are issued.
		.never();

	subject = new WatchstarGateway( api );
	return subject.getStatuses( [], [] ).then( function ( actual ) {
		expected = {};
		assert.propEqual( actual, expected, 'An empty result is returned.' );
		mockAPI.verify();
	} );
} );

QUnit.test( 'getStatusesByID(nonempty)', function ( assert ) {
	var
		subject,
		expected,
		api,
		mockAPI;

	api = { get: function () {} };
	mockAPI = sandbox.mock( api )
		.expects( 'get' )
		.once()
		// One HTTP request is issued.
		.returns( util.Deferred().resolve( GET_RESPONSE ) );

	subject = new WatchstarGateway( api );
	return subject.getStatusesByID( [ '123', 456 ] ).then( function ( actual ) {
		expected = {
			'An unwatched page': false,
			'A watched page': true
		};
		assert.propEqual( actual, expected, 'The correct result is returned.' );
		mockAPI.verify();
	} );
} );

QUnit.test( 'getStatusesByID(empty)', function ( assert ) {
	var
		subject,
		expected,
		api,
		mockAPI;

	api = { get: function () {} };
	mockAPI = sandbox.mock( api )
		.expects( 'get' )
		// No HTTP requests are issued.
		.never();

	subject = new WatchstarGateway( api );
	return subject.getStatusesByID( [] ).then( function ( actual ) {
		expected = {};
		assert.propEqual( actual, expected, 'An empty result is returned.' );
		mockAPI.verify();
	} );
} );

QUnit.test( 'getStatusesByTitle(nonempty)', function ( assert ) {
	var
		subject,
		expected,
		api,
		mockAPI;

	api = { get: function () {} };
	mockAPI = sandbox.mock( api )
		.expects( 'get' )
		.once()
		// One HTTP request is issued.
		.returns( util.Deferred().resolve( GET_RESPONSE ) );

	subject = new WatchstarGateway( api );
	return subject.getStatusesByTitle( [
		'An unwatched page', 'An unwatched page'
	] ).then( function ( actual ) {
		expected = {
			'An unwatched page': false,
			'A watched page': true
		};
		assert.propEqual( actual, expected, 'The correct result is returned.' );
		mockAPI.verify();
	} );
} );

QUnit.test( 'getStatusesByTitle(empty)', function ( assert ) {
	var
		subject,
		expected,
		api,
		mockAPI;

	api = { get: function () {} };
	mockAPI = sandbox.mock( api )
		.expects( 'get' )
		// No HTTP requests are issued.
		.never();

	subject = new WatchstarGateway( api );
	return subject.getStatusesByTitle( [] ).then( function ( actual ) {
		expected = {};
		assert.propEqual( actual, expected, 'An empty result is returned.' );
		mockAPI.verify();
	} );
} );

QUnit.test( '_unmarshalGetResponse(nonempty)', function ( assert ) {
	var
		subject,
		actual,
		expected;

	subject = new WatchstarGateway( new mw.Api() );
	actual = subject._unmarshalGetResponse( GET_RESPONSE );
	expected = {
		'An unwatched page': false,
		'A watched page': true
	};
	assert.propEqual(
		actual,
		expected,
		'GET API:Info nonempty responses are unmarshalled correctly.'
	);
} );

QUnit.test( '_unmarshalGetResponse(empty)', function ( assert ) {
	var
		subject,
		actual,
		expected;

	subject = new WatchstarGateway( new mw.Api() );
	actual = subject._unmarshalGetResponse( {} );
	expected = {};
	assert.propEqual(
		actual,
		expected,
		'GET API:Info empty responses are unmarshalled correctly.'
	);
} );
