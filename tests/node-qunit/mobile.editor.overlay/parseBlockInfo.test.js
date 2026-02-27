const
	jQuery = require( '../utils/jQuery' ),
	util = require( '../../../src/mobile.startup/util' ),
	oo = require( '../utils/oo' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	sinon = require( 'sinon' );
let
	sandbox,
	parseBlockInfo;

QUnit.module( 'MobileFrontend mobile.editor.overlay/parseBlockInfo', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		parseBlockInfo = require( '../../../src/mobile.editor.overlay/parseBlockInfo' );

		const stubTitle = {
			getUrl: function () {
				return '/w/index.php?title=User:Test';
			},
			getPrefixedText: function () {
				return 'User:Test';
			}
		};
		sandbox.stub( mw.Title, 'makeTitle' ).returns( stubTitle );
		sandbox.stub( mw.Title, 'newFromText' ).returns( stubTitle );
		sandbox.stub( mw.Api.prototype, 'get' ).callsFake( ( request ) => {
			if ( request.action !== 'parse' ) {
				throw new Error( 'Unexpected API call' );
			}
			return util.Deferred().resolve( {
				parse: {
					text: 'PARSED: ' + request.text
				}
			} );
		} );
		sandbox.stub( mw, 'message' ).callsFake( ( name ) => ( {
			escaped: () => `[${ name }]`
		} ) );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

function provideCases() {
	const blockCDN = {
		blockid: 24920538,
		blockedby: 'JJMC89',
		blockedbyid: 24812038,
		blockreason: 'CDN blocked: Fastly',
		blockedtimestamp: '2024-04-22T01:18:44Z',
		blockexpiry: '2027-04-22T01:18:44Z',
		blockpartial: false,
		blocknocreate: false,
		blockanononly: true,
		blockemail: false,
		blockowntalk: false,
		blockautoblocking: false,
		blockedtimestampformatted: '18:18, 21 April 2024',
		blockexpiryformatted: '18:18, 21 April 2027',
		blockexpiryrelative: 'in 1 year'
	};
	const blockProxy = {
		blockid: 3310921,
		blockedby: 'XXBlackburnXx',
		blockedbyid: 20823699,
		blockreason: 'No open proxies',
		blockedtimestamp: '2025-04-08T15:50:59Z',
		blockexpiry: '2028-04-08T15:50:59Z',
		blockpartial: false,
		blocknocreate: true,
		blockanononly: false,
		blockemail: false,
		blockowntalk: true,
		blockedtimestampformatted: '08:50, 8 April 2025',
		blockexpiryformatted: '08:50, 8 April 2028',
		blockexpiryrelative: 'in 2 years'
	};
	return [
		{
			blockinfo: blockCDN,
			expectedInfo: {
				partial: false,
				noCreateAccount: false,
				anonOnly: true,
				creator: {
					name: 'JJMC89',
					url: '/w/index.php?title=User:Test'
				},
				duration: 'in 1 year',
				reason: 'CDN blocked: Fastly',
				blockId: 24920538,
				parsedReason: 'PARSED: CDN blocked: Fastly'
			},
			message: 'simple block, anon only'
		},
		{
			blockinfo: blockProxy,
			expectedInfo: {
				partial: false,
				noCreateAccount: true,
				anonOnly: false,
				creator: {
					name: 'XXBlackburnXx',
					url: '/w/index.php?title=User:Test'
				},
				duration: 'in 2 years',
				reason: 'No open proxies',
				blockId: 3310921,
				parsedReason: 'PARSED: No open proxies'
			},
			message: 'simple block, no account creation'
		},
		{
			blockinfo: {
				blockid: 24920538,
				blockedby: 'JJMC89',
				blockedbyid: 24812038,
				blockreason: false,
				blockedtimestamp: '2024-04-22T01:18:44Z',
				blockexpiry: '2027-04-22T01:18:44Z',
				blockpartial: false,
				blocknocreate: false,
				blockanononly: true,
				blockemail: false,
				blockowntalk: false,
				blockautoblocking: false,
				blockedtimestampformatted: '18:18, 21 April 2024',
				blockexpiryformatted: '18:18, 21 April 2027',
				blockexpiryrelative: 'in 1 year'
			},
			expectedInfo: {
				partial: false,
				noCreateAccount: false,
				anonOnly: true,
				creator: {
					name: 'JJMC89',
					url: '/w/index.php?title=User:Test'
				},
				duration: 'in 1 year',
				reason: '[mobile-frontend-editor-generic-block-reason]',
				blockId: 24920538,
				parsedReason: '[mobile-frontend-editor-generic-block-reason]'
			},
			message: 'simple block, no reason given'
		},
		{
			blockinfo: {
				blockid: null,
				blockedby: '',
				blockedbyid: 0,
				blockreason: 'There are multiple blocks against your account and/or IP address',
				blockedtimestamp: '2024-04-22T01:18:44Z',
				blockexpiry: '2028-04-08T15:50:59Z',
				blockpartial: false,
				blocknocreate: true,
				blockanononly: false,
				blockemail: false,
				blockowntalk: true,
				blockedtimestampformatted: '18:18, 21 April 2024',
				blockexpiryformatted: '08:50, 8 April 2028',
				blockexpiryrelative: 'in 2 years',
				blockcomponents: [ blockCDN, blockProxy ]
			},
			expectedInfo: {
				partial: false,
				noCreateAccount: true,
				anonOnly: false,
				creator: {
					name: '',
					url: ''
				},
				reason: 'There are multiple blocks against your account and/or IP address',
				duration: 'in 2 years',
				blockId: null,
				parsedReason: 'PARSED: There are multiple blocks against your account and/or IP address\nPARSED: CDN blocked: Fastly\nPARSED: No open proxies'
			},
			message: 'composite block'
		},
		{
			blockinfo: {
				blockid: null,
				blockedby: '',
				blockedbyid: 0,
				blockreason: 'There are multiple blocks against your account and/or IP address',
				blockedtimestamp: '2024-04-22T01:18:44Z',
				blockexpiry: '2028-04-08T15:50:59Z',
				blockpartial: false,
				blocknocreate: true,
				blockanononly: false,
				blockemail: false,
				blockowntalk: true,
				blockedtimestampformatted: '18:18, 21 April 2024',
				blockexpiryformatted: '08:50, 8 April 2028',
				blockexpiryrelative: 'in 2 years',
				blockcomponents: [
					blockCDN,
					{
						blockid: 3310921,
						blockedby: 'XXBlackburnXx',
						blockedbyid: 20823699,
						blockreason: false,
						blockedtimestamp: '2025-04-08T15:50:59Z',
						blockexpiry: '2028-04-08T15:50:59Z',
						blockpartial: false,
						blocknocreate: true,
						blockanononly: false,
						blockemail: false,
						blockowntalk: true,
						blockedtimestampformatted: '08:50, 8 April 2025',
						blockexpiryformatted: '08:50, 8 April 2028',
						blockexpiryrelative: 'in 2 years'
					}
				]
			},
			expectedInfo: {
				partial: false,
				noCreateAccount: true,
				anonOnly: false,
				creator: {
					name: '',
					url: ''
				},
				reason: 'There are multiple blocks against your account and/or IP address',
				duration: 'in 2 years',
				blockId: null,
				parsedReason: 'PARSED: There are multiple blocks against your account and/or IP address\nPARSED: CDN blocked: Fastly\n<div>[mobile-frontend-editor-generic-block-reason]</div>'
			},
			message: 'composite block'
		}
	];
}

QUnit.test( 'parseBlockInfo', ( assert ) => {
	const cases = provideCases();

	cases.forEach( ( caseItem ) => {
		const done = assert.async();
		const parsedInfo = parseBlockInfo( caseItem.blockinfo );
		parsedInfo.parsedReason.then( ( parsedReason ) => {
			assert.deepEqual(
				{
					partial: parsedInfo.partial,
					noCreateAccount: parsedInfo.noCreateAccount,
					anonOnly: parsedInfo.anonOnly,
					creator: parsedInfo.creator,
					duration: parsedInfo.duration,
					reason: parsedInfo.reason,
					blockId: parsedInfo.blockId,
					parsedReason: parsedReason
				},
				caseItem.expectedInfo,
				caseItem.message
			);
			done();
		} );
	} );
} );
