( function( M ) {

	var Class = M.require( 'Class' );

	QUnit.module( 'MobileFrontend Class' );

	QUnit.test( '.extend', 5, function( assert ) {
		var Parent, Child, child;

		Parent = Class.extend( {
			parent: function() {
				return 'parent';
			},
			override: function() {
				return 'override';
			},
			callSuper: function() {
				return 'super';
			}
		} );

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
		assert.strictEqual( child.parent(), 'parent', 'inherit parent properties' );
		assert.strictEqual( child.override(), 'overriden', 'override parent properties' );
		assert.strictEqual( child.child(), 'child', 'add new properties' );
		assert.strictEqual( child.callSuper(), 'super duper', "call parent's functions" );
		assert.strictEqual( Child.extend, Class.extend, 'make Child extendeable' );
	} );

	QUnit.test( '#initialize', 1, function( assert ) {
		var Thing, spy = sinon.spy();

		Thing = Class.extend( {
			initialize: spy
		} );

		new Thing( 'abc', 123 );

		assert.ok( spy.calledWith( 'abc', 123 ), 'call #initialize when creating new instance' );
	} );

}( mw.mobileFrontend ) );
