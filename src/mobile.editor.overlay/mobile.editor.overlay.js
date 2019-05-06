var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	SourceEditorOverlay = require( './SourceEditorOverlay' ),
	VisualEditorOverlay = require( './VisualEditorOverlay' ),
	schemaEditAttemptStep = require( './schemaEditAttemptStep' );

// Exposed for MobileFrontend mobile.init usage.
m.define( 'mobile.editor.overlay/SourceEditorOverlay', SourceEditorOverlay );
m.define( 'mobile.editor.overlay/VisualEditorOverlay', VisualEditorOverlay );
// setup schema:edit logging
schemaEditAttemptStep();
