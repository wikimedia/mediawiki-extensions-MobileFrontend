( function( M ) {

var oop = M.require( 'oop' );

QUnit.module( 'MobileFrontend oop' );

QUnit.test( '#extend', 4, function() {
	var Child, child;

	function Parent() {}

	Parent.prototype.parent = function() {
		return 'parent';
	};

	Parent.prototype.override = function() {
		return 'override';
	};

	Parent.extend = oop.extend;

	Child = Parent.extend( {
		override: function() {
			return 'overriden';
		},
		child: function() {
			return 'child';
		}
	} );

	child = new Child();
	strictEqual( child.parent(), 'parent', 'inherit parent properties' );
	strictEqual( child.override(), 'overriden', 'override parent properties' );
	strictEqual( child.child(), 'child', 'add new properties' );
	strictEqual( Child.extend, oop.extend, 'make Child extendeable' );
} );

}( mw.mobileFrontend ) );
