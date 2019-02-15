var Button = require( '../mobile.startup/Button' ),
	util = require( '../mobile.startup/util' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Overlay = require( '../mobile.startup/Overlay' );

/**
 * Overlay that shows a message about abuse.
 * This overlay is rendered when the error code from the API
 * is related to the abusefilter extension.
 * @class AbuseFilterOverlay
 * @extends Overlay
 * @param {Object} props
 */
function AbuseFilterOverlay( props ) {
	Overlay.call( this,
		util.extend( {
			className: 'overlay abusefilter-overlay'
		}, props )
	);
}

mfExtend( AbuseFilterOverlay, Overlay, {
	/**
	 * @memberof AbuseFilterOverlay
	 * @instance
	 * @mixes Overlay#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {Object} defaults.confirmButton options for a confirm Button
	 */
	defaults: util.extend( {}, Overlay.prototype.defaults, {
		confirmButton: new Button( {
			additionalClassNames: 'cancel',
			progressive: true
		} ).options
	} ),
	/**
	 * @memberof AbuseFilterOverlay
	 * @instance
	 */
	templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
		button: Button.prototype.template,
		content: mw.template.get( 'mobile.editor.overlay', 'AbuseFilterOverlay.hogan' )
	} ),
	/**
	 * @inheritdoc
	 * @memberof AbuseFilterOverlay
	 * @instance
	 */
	postRender: function () {
		Overlay.prototype.postRender.apply( this );
		// make links open in separate tabs
		this.$el.find( 'a' ).attr( 'target', '_blank' );
	}
} );

module.exports = AbuseFilterOverlay;
