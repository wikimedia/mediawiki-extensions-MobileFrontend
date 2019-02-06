var
	mfExtend = require( './mfExtend' ),
	util = require( './util' ),
	View = require( './View' );

/**
 * An abstract class for a {@link View} that comprises a simple panel.
 * @class Panel
 * @extends View
 *
 * @param {Object} [params] Configuration options
 */
function Panel( params ) {
	View.call( this, util.extend(
		{ className: 'panel' },
		params,
		{ events: util.extend( { 'click .cancel': 'onCancel' }, ( params || {} ).events ) } )
	);
}

mfExtend( Panel, View, {
	// in milliseconds
	minHideDelay: 10,

	/**
	 * Cancel event handler
	 * @memberof Panel
	 * @instance
	 * @param {Object} ev Event Object
	 */
	onCancel: function ( ev ) {
		ev.preventDefault();
		this.hide();
	},

	/**
	 * Shows panel after a slight delay
	 * @memberof Panel
	 * @instance
	 * @method
	 */
	show: function () {
		var self = this;

		if ( !self.isVisible() ) {
			// use setTimeout to allow the browser to redraw if render() was called
			// just before show(); this is important for animations to work
			// (0ms doesn't work on Firefox, 10ms is enough)
			//
			// FIXME: setTimeout should be reconsidered in T209129
			setTimeout( function () {
				self.$el.addClass( 'visible animated' );
				self.emit( 'show' );
			}, self.minHideDelay );
		}
	},

	/**
	 * Hides panel
	 * @memberof Panel
	 * @instance
	 */
	hide: function () {
		var self = this;

		// see comment in show()
		setTimeout( function () {
			self.$el.removeClass( 'visible' );
			self.emit( 'hide' );
		}, self.minHideDelay );
	},

	/**
	 * Determines if panel is visible
	 * @memberof Panel
	 * @instance
	 * @return {boolean} Panel is visible
	 */
	isVisible: function () {
		return this.$el.hasClass( 'visible' );
	},

	/**
	 * Shows or hides panel
	 * @memberof Panel
	 * @instance
	 */
	toggle: function () {
		if ( this.isVisible() ) {
			this.hide();
		} else {
			this.show();
		}
	}
} );

module.exports = Panel;
