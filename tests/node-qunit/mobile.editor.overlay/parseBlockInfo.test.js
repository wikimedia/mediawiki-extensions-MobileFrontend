let
	sandbox,
	blockInfo,
	blockinfo,
	ParseBlockInfo;

const
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	mw = require( '../utils/mw' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/parseBlockInfo', {
	beforeEach: function () {
		const moment = function ( expiry ) {
			return {
				to: ( arg ) => arg,
				format: ( str ) => str === 'LL' ? '30 June 2020, 12:00 AM' :
					'3 September 2020',
				diff: () => expiry === '2020-06-30' ? 86900 : 4
			};
		};
		sandbox = sinon.sandbox.create();
		mw.setUp( sandbox, global );
		dom.setUp( sandbox, global );
		global.window.moment = moment;

		sandbox.stub( global.mw, 'message' ).callsFake(
			( arg, value ) => {
				return {
					escaped: () => `(${arg}: ${value})`
				};
			}
		);
		ParseBlockInfo = require( '../../../src/mobile.editor.overlay/parseBlockInfo' );
		blockinfo = {
			blockid: 123,
			blockedbyid: 0
		};
	},
	afterEach: function () {
		sandbox.restore();
	}
} );

QUnit.test( 'blockInfo', function ( assert ) {
	blockinfo.blockexpiry = '2020-06-30';
	blockInfo = new ParseBlockInfo( blockinfo );

	assert.strictEqual(
		blockInfo.expiry,
		'(parentheses: 30 June 2020, 12:00 AM)',
		'Short blocks should have date and time in expiry message'
	);
} );

QUnit.test( 'blockInfo2', function ( assert ) {
	blockinfo.blockexpiry = '2020-09-03';
	blockInfo = new ParseBlockInfo( blockinfo );

	assert.strictEqual(
		blockInfo.expiry,
		'(parentheses: 3 September 2020)',
		'Long blocks should have only date in expiry message'
	);

} );
