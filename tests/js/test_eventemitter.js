( function( M ) {

  var EventEmitter = M.require( 'eventemitter' );

  module( 'MobileFrontend EventEmitter' );

  test( '#on', function() {
    var e = new EventEmitter(), spy = sinon.spy();
    e.on( 'testEvent', spy );
    e.emit( 'testEvent', 'first', 2 );
    ok( spy.calledWith( 'first', 2 ), 'run callback when event runs' );
  } );

}( mw.mobileFrontend ));
