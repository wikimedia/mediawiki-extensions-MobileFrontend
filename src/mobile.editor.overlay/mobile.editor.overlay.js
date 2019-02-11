var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	EditorOverlay = require( './EditorOverlay' ),
	VisualEditorOverlay = require( './VisualEditorOverlay' ),
	schemaEditAttemptStep = require( './schemaEditAttemptStep' );

// Exposed for MobileFrontend mobile.init usage.
m.define( 'mobile.editor.overlay/EditorOverlay', EditorOverlay );
m.define( 'mobile.editor.overlay/VisualEditorOverlay', VisualEditorOverlay );
// setup schema:edit logging
schemaEditAttemptStep();
