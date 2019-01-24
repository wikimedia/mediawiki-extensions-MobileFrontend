/* global $ */
module.exports = function ProgressBarWidget() {
	this.$bar = $( '<div>' )
		.addClass( 'mobile-progressBarWidget-bar' );
	this.$element = $( '<div>' )
		.addClass( 'mobile-progressBarWidget' )
		.append( this.$bar );
};
