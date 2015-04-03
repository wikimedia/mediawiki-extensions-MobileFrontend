( function ( M ) {
	/**
	 * Button with a spinner indicator
	 * Behaves the same as OO.ui.Button widget. Also defines custom methods that show and hide
	 * the spinner.
	 * @param {Object} config
	 * @constructor
	 */
	var ButtonWithSpinner = function ( config ) {
		ButtonWithSpinner.super.call( this, config );
	};
	OO.inheritClass( ButtonWithSpinner, OO.ui.ButtonWidget );

	/**
	 * Show the spinner and hide the label (and save the label for future use)
	 */
	ButtonWithSpinner.prototype.showSpinner = function () {
		var originalWidth = this.$button.width();

		this.defaultLabel = this.getLabel();
		// Don't let the button width change
		this.$button.width( originalWidth );
		this
			.setIndicator( 'spinner' )
			.setLabel( '' )
			.setDisabled( true );
	};

	/**
	 * Hide the spinner and show the default label
	 */
	ButtonWithSpinner.prototype.hideSpinner = function () {
		this
			.setIndicator( null )
			.setLabel( this.defaultLabel )
			.setDisabled( false );
	};

	M.define( 'ButtonWithSpinner', ButtonWithSpinner );
} ( mw.mobileFrontend ) );
