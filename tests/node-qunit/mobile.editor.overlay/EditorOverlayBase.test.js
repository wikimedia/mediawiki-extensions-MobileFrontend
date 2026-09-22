let EditorOverlayBase, returnToApp, sandbox;
const
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	makeFakeHookRegistry = require( '../utils/makeFakeHookRegistry' ),
	mustache = require( '../utils/mustache' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/EditorOverlayBase', {
	beforeEach() {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		EditorOverlayBase = require( '../../../src/mobile.editor.overlay/EditorOverlayBase' );
		returnToApp = require( '../../../src/mobile.returnToApp/returnToApp' );
		this.originalHookFactory = mw.hook;
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
		mw.hook = this.originalHookFactory;
	}
} );

QUnit.test.each(
	'#constructor, returnToApp option',
	{
		'enabled in returnToApp, requested here': { enabled: true, requested: true, expected: true },
		'enabled in returnToApp, not requested here': { enabled: true, requested: false, expected: false },
		'disabled in returnToApp, requested here': { enabled: false, requested: true, expected: null },
		'disabled in returnToApp, not requested here': { enabled: false, requested: false, expected: false }
	},
	( assert, { enabled, expected, requested } ) => {
		sandbox.stub( returnToApp, 'isEnabled' ).returns( enabled );
		const overlay = new EditorOverlayBase( { returnToApp: requested } );
		assert.strictEqual( overlay.options.returnToApp, expected, "The returnToApp option is passed through when enabled in returnToApp, but forced null if it's disabled there." );
	}
);

QUnit.test.each(
	'#onExit',
	{
		// These test cases omit a situation that shouldn't happen in practice,
		// where switching editor types and saved are both true.
		'not switching, not saved': [ false, false ],
		'switching, not saved': [ true, false ],
		'not switching, saved': [ false, true ]
	},
	( assert, [ switching, saved ] ) => {
		const hookListener = sandbox.spy();
		const overlay = new EditorOverlayBase( {} );

		mw.hook = makeFakeHookRegistry();
		mw.hook( 'mobileFrontend.editorClosed' ).add( hookListener );
		overlay.saved = saved;
		overlay.switching = switching;
		overlay.onExit();
		assert.true(
			hookListener.calledOnceWithExactly( switching, saved ),
			"The hook mobileFrontend.editorClosed is fired with the overlay's switching and saved state."
		);
	}
);
