var
	icons = require( './icons' ),
	View = require( './View' );

/**
 * It's a view that spins until the promise resolves!
 * If the promise successfully resolves, the newView will be shown. if the
 * promise rejects and rejects to a view, the errorView will be shown.
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
	}, function ( errorView ) {
		if ( !errorView || !errorView.$el ) {
			// return early to keep backwards compatibility with clients of
			// promisedView that do not reject to an error view
			return;
		}

		view.$el.replaceWith( errorView.$el );
		// update the internal reference.
		view.$el = errorView.$el;
	} );

	return view;
}

module.exports = promisedView;
