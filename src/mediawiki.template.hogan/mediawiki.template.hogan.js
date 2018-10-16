var hogan = require( './hogan' );

// register hogan compiler with core
mw.template.registerCompiler( 'hogan', hogan );
