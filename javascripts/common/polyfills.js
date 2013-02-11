if ( typeof console === 'undefined' ) {
	console = { log: function() {} };
}

if ( typeof Array.prototype.forEach === 'undefined' ) {
	Array.prototype.forEach = function( callback ) {
		var i;
		for ( i = 0; i < this.length; i++ ) {
			callback( this[ i ], i );
		}
	};
}
