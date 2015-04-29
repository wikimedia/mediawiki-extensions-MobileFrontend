( function ( M ) {
	var Class = M.require( 'Class' );

	QUnit.module( 'MobileFrontend Class' );

	QUnit.test( '.extend', 6, function ( assert ) {
		var Parent, Child, child;

		Parent = Class.extend( {
			prop: 'parent',
			parent: function () {
				return 'parent';
			},
			override: function () {
				return 'override';
			},
			callSuper: function () {
				return 'super';
			}
		} );

		Child = Parent.extend( {
			prop: 'child',
			override: function () {
				return 'overriden';
			},
			child: function () {
				return 'child';
			},
			callSuper: function () {
				var _super = Parent.prototype.callSuper;
				return _super.apply( this ) + ' duper';
			}
		} );

		child = new Child();
		assert.strictEqual( child.parent(), 'parent', 'inherit parent properties' );
		assert.strictEqual( child.override(), 'overriden', 'override parent properties' );
		assert.strictEqual( child.child(), 'child', 'add new properties' );
		assert.strictEqual( child.callSuper(), 'super duper', 'call parent\'s functions' );
		assert.strictEqual( child._parent.prop, 'parent', 'access parent\'s prototype through _parent' );
		assert.strictEqual( Child.extend, Class.extend, 'make Child extendeable' );
	} );

	QUnit.test( '#initialize', 1, function ( assert ) {
		var Thing, spy = this.sandbox.spy();

		Thing = Class.extend( {
			initialize: spy
		} );

		new Thing( 'abc', 123 );

		assert.ok( spy.calledWith( 'abc', 123 ), 'call #initialize when creating new instance' );
	} );

}( mw.mobileFrontend ) );
