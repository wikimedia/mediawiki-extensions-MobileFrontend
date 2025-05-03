let sandbox, ImageGateway;
const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	jQuery = require( '../utils/jQuery' ),
	util = require( '../../../src/mobile.startup/util' );

QUnit.module( 'MobileFrontend mobile.mediaViewer/ImageGateway', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		ImageGateway = require( '../../../src/mobile.mediaViewer/ImageGateway' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#findSizeBucket', ( assert ) => {
	assert.strictEqual( ImageGateway.findSizeBucket( 300 ), 320, 'value lower than bucket' );
	assert.strictEqual( ImageGateway.findSizeBucket( 800 ), 800, 'exact value' );
	assert.strictEqual( ImageGateway.findSizeBucket( 9999 ), 2880, 'value greater than last bucket' );
} );

QUnit.test( 'ImageGateway#getThumb (missing page)', ( assert ) => {
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
		( err ) => err.message.includes( 'The API failed' ),
		'A missing page throws an error which the client must handle'
	);
} );
