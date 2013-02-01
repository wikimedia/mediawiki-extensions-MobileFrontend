( function( M, $ ) {

	function extend( prototype ) {
		var Parent = this;
		function Child() {
			return Parent.apply( this, arguments );
		}
		function Surrogate() {}
		Surrogate.prototype = Parent.prototype;
		Child.prototype = new Surrogate();

		$.extend( Child.prototype, prototype );
		Child.extend = extend;
		return Child;
	}

	M.define( 'oop', {
		extend: extend
	} );

}( mw.mobileFrontend, jQuery ) );
