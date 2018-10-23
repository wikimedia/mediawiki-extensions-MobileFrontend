var Hogan = require( 'hogan.js' );

// register hogan compiler with core
mw.template.registerCompiler( 'hogan', {
	compile: Hogan.compile.bind( Hogan )
} );
