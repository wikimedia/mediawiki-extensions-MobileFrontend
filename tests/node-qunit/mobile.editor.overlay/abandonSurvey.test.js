let sandbox, getContentStub, previewResolve,
	EditorGateway, SourceEditorOverlay;
const
	jQuery = require( '../utils/jQuery' ),
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),
	oo = require( '../utils/oo' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );

// eslint-disable-next-line no-unused-vars
let abandonSurvey, Drawer;

QUnit.module( 'MobileFrontend mobile.editor.overlay/abandonSurvey', {
	beforeEach: function () {
		/* eslint-disable-next-line camelcase */
		global.__non_webpack_require__ = require( '../webpackRequire.stub' );
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		global.OO.ui.ButtonWidget = function ( config ) {
			this.$element = global.$( '<span>' ).addClass( 'oo-ui-buttonWidget' );
			this.$button = global.$( '<button type="button">' )
				.addClass( 'oo-ui-buttonElement-button' )
				.text( config.label || '' );
			this.$element.append( this.$button );
			this.on = ( eventName, handler ) => {
				if ( eventName === 'click' ) {
					this.$button.on( 'click', handler );
				}
			};
		};
		global.OO.ui.FieldLayout = function ( widget ) {
			this.$element = global.$( '<div>' ).addClass( 'oo-ui-fieldLayout' );
			this.$messages = global.$( '<div>' ).addClass( 'oo-ui-fieldLayout-messages' );
			this.$element.append( widget.$element, this.$messages );
			this.setErrors = ( errors ) => {
				const text = ( errors || [] ).join( ' ' );
				this.$messages.text( text );
			};
		};
		global.OO.ui.RadioOptionWidget = function ( config ) {
			this.data = config.data;
			this.$element = global.$( '<label>' ).addClass( 'oo-ui-optionWidget' );
			this.$input = global.$( '<input type="radio">' ).val( config.data );
			this.$element.append(
				global.$( '<span>' ).addClass( 'oo-ui-radioInputWidget' ).append( this.$input )
			);
			this.getData = () => this.data;
		};
		global.OO.ui.RadioSelectWidget = function () {
			this.selectedItem = null;
			this.chooseHandlers = [];
			this.$element = global.$( '<div>' ).addClass( 'oo-ui-radioSelectWidget' );
			this.on = ( eventName, handler ) => {
				if ( eventName === 'choose' ) {
					this.chooseHandlers.push( handler );
				}
			};
			this.addItems = ( items ) => {
				items.forEach( ( item ) => {
					this.$element.append( item.$element );
					item.$input.on( 'click', () => {
						this.selectedItem = item;
						this.chooseHandlers.forEach( ( fn ) => fn( item ) );
					} );
				} );
			};
			this.findSelectedItem = () => this.selectedItem;
		};
		sandbox.stub( mw, 'msg' ).withArgs( 'mobile-frontend-editor-continue' ).returns( 'Continue' )
			.withArgs( 'mobile-frontend-editor-save' ).returns( 'Save' )
			.withArgs( 'mobile-frontend-editor-publish' ).returns( 'Publish' );

		EditorGateway = require( '../../../src/mobile.editor.overlay/EditorGateway' );
		SourceEditorOverlay = require( '../../../src/mobile.editor.overlay/SourceEditorOverlay' );

		// prevent event logging requests
		sandbox.stub( SourceEditorOverlay.prototype, 'log' ).returns( util.Deferred().resolve() );

		getContentStub = sandbox.stub( EditorGateway.prototype, 'getContent' );
		sandbox.stub( mw, 'confirmCloseWindow' ).returns( {
			release: function () {}
		} );

		// requestAnimationFrame doesn't exist in Node
		global.requestAnimationFrame = setTimeout;

		sandbox.stub( window, 'scrollTo' );
		sandbox.stub( mw.util, 'getUrl' ).returns( '/w/index.php?title=User:Test' );
		sandbox.stub( mw.storage, 'get' ).returns( null );
		sandbox.stub( mw.storage, 'set' );
		sandbox.stub( mw.config, 'get' )
			.withArgs( 'wgPageName' ).returns( 'User:Test' )
			.withArgs( 'wgRelevantPageName' ).returns( 'User:Test' )
			.withArgs( 'wgRevisionId' ).returns( 123 )
			.withArgs( 'wgArticleId' ).returns( 321 )
			.withArgs( 'wgNamespaceNumber' ).returns( 2 )
			.withArgs( 'wgIsMainPage' ).returns( false )
			.withArgs( 'wgFormattedNamespaces' ).returns( { 2: 'User' } )
			.withArgs( 'wgNamespaceIds' ).returns( { user: 2 } )
			.withArgs( 'wgVisualEditorConfig' ).returns( { namespaces: [ 1, 2 ] } )
			.withArgs( 'wgMFEnableAbandonSurvey' ).returns( true );
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
		getContentStub.returns( util.Deferred().resolve( {
			text: 'section 0',
			blockinfo: null
		} ) );
		previewResolve = util.Deferred().resolve( { text: '\npreviewtest' } );
		sandbox.stub( EditorGateway.prototype, 'getPreview' )
			.returns( previewResolve );

		abandonSurvey = require(
			'../../../src/mobile.editor.overlay/abandonSurvey'
		);

		// Dynamically import Drawer to use fresh sandboxed dependencies.
		Drawer = require( '../../../src/mobile.startup/Drawer' );
	},
	afterEach: function () {
		Drawer = undefined;
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'abandonSurvey', async ( assert ) => {
	let lastLoggedData = null;
	const drawer = abandonSurvey( {
		logFeatureUse: ( data ) => {
			lastLoggedData = data;
		}
	} );

	// Assert the factory method returns a Drawer with listeners set-up
	// for the show and hide events that reposition the popup.
	assert.strictEqual( drawer.constructor.name, 'Drawer' );
	assert.strictEqual( typeof drawer.options.onShow, 'function' );
	assert.strictEqual( typeof drawer.options.onBeforeHide, 'function' );
	assert.strictEqual( drawer.drawerClassName, 'drawer abandon-survey' );

	await drawer.show();
	assertVisible( drawer );

	assert.deepEqual( lastLoggedData, {
		feature: 'abandon-survey',
		action: 'shown'
	} );

	assert.strictEqual( drawer.$el.find( '.oo-ui-fieldLayout-messages' ).text(), '', 'Error is initially hidden' );

	drawer.$el.find( '.oo-ui-buttonElement-button' ).click();
	assert.strictEqual( drawer.$el.find( '.oo-ui-fieldLayout-messages' ).text(), 'Please select a reason', 'Error is shown' );

	drawer.$el.find( '.oo-ui-radioInputWidget input' ).first().trigger( 'click' ).trigger( 'change' );
	assert.strictEqual( drawer.$el.find( '.oo-ui-fieldLayout-messages' ).text(), '', 'Error is cleared after a selection' );

	await drawer.hide();
	assertHidden( drawer );

	assert.deepEqual( lastLoggedData, {
		feature: 'abandon-survey',
		action: 'closed'
	} );
} );

function assertVisible( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /.*\bvisible\b.*/ );
}

function assertHidden( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /^((?!\bvisible\b).)*$/ );
}
