var
	icons = require( './icons' ),
	View = require( './View' );

/**
 * It's a view that spins until the promise resolves!
 * The promise MUST resolve successfully
 * otherwise a spinner will show indefinitely.
 *
 * @param {jQuery.Promise} promise
 * @return {View}
 */
function promisedView( promise ) {
	var view = new View( {
		className: 'promised-view'
	} );
	view.$el.append( icons.spinner().$el );
	promise.then( function ( newView ) {
		view.$el.replaceWith( newView.$el );
		// update the internal reference.
		view.$el = newView.$el;
	} );
	return view;
}

module.exports = promisedView;
