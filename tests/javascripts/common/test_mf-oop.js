( function( M ) {

var oop = M.require( 'oop' );

QUnit.module( 'MobileFrontend oop' );

QUnit.test( '#extend', 5, function() {
	var Child, child;

	function Parent() {}

	Parent.prototype.parent = function() {
		return 'parent';
	};

	Parent.prototype.override = function() {
		return 'override';
	};

	Parent.prototype.callSuper = function() {
		return 'super';
	};

	Parent.extend = oop.extend;

	Child = Parent.extend( {
		override: function() {
			return 'overriden';
		},
		child: function() {
			return 'child';
		},
		callSuper: function() {
			return this._super() + ' duper';
		}
	} );

	child = new Child();
	strictEqual( child.parent(), 'parent', 'inherit parent properties' );
	strictEqual( child.override(), 'overriden', 'override parent properties' );
	strictEqual( child.child(), 'child', 'add new properties' );
	strictEqual( child.callSuper(), 'super duper', "call parent's functions" );
	strictEqual( Child.extend, oop.extend, 'make Child extendeable' );
} );

}( mw.mobileFrontend ) );
