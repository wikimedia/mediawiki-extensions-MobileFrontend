let sandbox, ImageGateway, findSizeBucket;
const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	jQuery = require( '../utils/jQuery' ),
	util = require( '../../../src/mobile.startup/util' );

QUnit.module( 'MobileFrontend mobile.mediaViewer/ImageGateway', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		ImageGateway = require( '../../../src/mobile.mediaViewer/ImageGateway' );
		findSizeBucket = ImageGateway._findSizeBucket;
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#findSizeBucket', function ( assert ) {
	assert.strictEqual( findSizeBucket( 300 ), 320, 'value lower than bucket' );
	assert.strictEqual( findSizeBucket( 800 ), 800, 'exact value' );
	assert.strictEqual( findSizeBucket( 9999 ), 2880, 'value greater than last bucket' );
} );

QUnit.test( 'ImageGateway#getThumb (missing page)', function ( assert ) {
	const api = {
			get: function () {
				return util.Deferred().resolve( {
					query: {
						pages: [
							{
								title: 'Hello',
								missing: true
							}
						]
					}
				} );
			}
		},
		gateway = new ImageGateway( { api: api } );
	assert.rejects(
		gateway.getThumb( 'Missing' ),
		function ( err ) {
			return err.message.indexOf( 'The API failed' ) !== -1;
		},
		'A missing page throws an error which the client must handle'
	);
} );
