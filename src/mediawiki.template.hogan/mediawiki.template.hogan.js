// register hogan compiler with core
const mustache = mw.template.getCompiler( 'mustache' ),
	compiler = {
		compile: function () {
			mw.log.warn( 'Deprecated Hogan compiler called with following arguments:',
				arguments, 'Templates rendered as Mustache.',
				'Use the mustache compiler directly and confirm your template is compatible.' );
			return mustache.compile.apply( mustache, arguments );
		}
	};

mw.template.registerCompiler( 'hogan', compiler );
