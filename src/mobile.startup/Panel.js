var
	mfExtend = require( './mfExtend' ),
	View = require( './View' );

/**
 * An abstract class for a {@link View} that comprises a simple panel.
 * @class Panel
 * @extends View
 *
 * @param {Object} options Configuration options
 */
function Panel() {
	View.apply( this, arguments );
}

mfExtend( Panel, View, {
	/**
	 * @inheritdoc
	 * @memberof Panel
	 * @instance
	 */
	className: 'panel',
	// in milliseconds
	minHideDelay: 10,
	events: {
		'click .cancel': 'onCancel'
	},

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
