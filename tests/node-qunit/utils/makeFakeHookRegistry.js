module.exports = function () {
	const registry = {};

	return function ( name ) {
		registry[ name ] = registry[ name ] || {
			handlers: [],
			add( fn ) {
				this.handlers.push( fn );
				return this;
			},
			remove( fn ) {
				this.handlers = this.handlers.filter(
					( h ) => h !== fn
				);
				return this;
			},
			fire( ...args ) {
				this.handlers.forEach(
					( fn ) => fn( ...args )
				);
				return this;
			}
		};

		return registry[ name ];
	};
};
