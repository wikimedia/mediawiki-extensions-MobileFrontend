const
	icons = require( './icons' ),
	View = require( './View' );

/**
 * Internal for use inside Echo, GrowthExperiments only.
 * It's a view that spins until the promise resolves!
 * If the promise successfully resolves, the newView will be shown. if the
 * promise rejects and rejects to a view, the errorView will be shown.
 *
 * @function promisedView
 * @memberof module:mobile.startup
 * @param {jQuery.Promise} promise
 * @return {module:mobile.startup/View}
 */
module.exports = function promisedView( promise ) {
	const view = new View( {
		className: 'promised-view'
	} );
	view.$el.append( icons.spinner().$el );
	promise.then( ( newView ) => {
		view.$el.replaceWith( newView.$el );
		// update the internal reference.
		view.$el = newView.$el;
	}, ( errorView ) => {
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
};
