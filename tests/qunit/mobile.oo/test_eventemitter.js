( function ( M ) {

	var EventEmitter = M.require( 'eventemitter' );

	QUnit.module( 'MobileFrontend EventEmitter' );

	QUnit.test( '#on', 1, function ( assert ) {
		var e = new EventEmitter(),
			spy = this.sandbox.spy();
		e.on( 'testEvent', spy );
		e.emit( 'testEvent', 'first', 2 );
		assert.ok( spy.calledWith( 'first', 2 ), 'run callback when event runs' );
	} );

	QUnit.test( '#one', 2, function ( assert ) {
		var e = new EventEmitter(),
			spy = this.sandbox.spy();
		e.once( 'testEvent', spy );
		e.emit( 'testEvent', 'first', 2 );
		e.emit( 'testEvent', 'second', 2 );
		assert.ok( spy.calledWith( 'first', 2 ), 'run callback when event runs' );
		assert.ok( spy.calledOnce, 'run callback once' );
	} );

}( mw.mobileFrontend ) );
