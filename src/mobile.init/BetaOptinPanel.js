var Button = require( '../mobile.startup/Button' ),
	util = require( '../mobile.startup/util' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Panel = require( '../mobile.startup/Panel' ),
	user = mw.user;

/**
 * @class BetaOptinPanel
 * @extends Panel
 * @param {Object} props
 */
function BetaOptinPanel( props ) {
	Panel.call( this,
		util.extend( {
			className: 'panel panel-inline visible'
		}, props )
	);
}

mfExtend( BetaOptinPanel, Panel, {
	/**
	 * @memberof BetaOptinPanel
	 * @instance
	 */
	templatePartials: util.extend( {}, Panel.prototype.templatePartials, {
		button: Button.prototype.template
	} ),
	/**
	 * @memberof BetaOptinPanel
	 * @instance
	 */
	template: mw.template.get( 'mobile.init', 'Panel.hogan' ),
	/**
	 * @memberof BetaOptinPanel
	 * @instance
	 */
	defaults: util.extend( {}, Panel.prototype.defaults, {
		postUrl: undefined,
		editToken: user.tokens.get( 'editToken' ),
		text: mw.msg( 'mobile-frontend-panel-betaoptin-msg' ),
		buttons: [
			new Button( {
				progressive: true,
				additionalClassNames: 'optin',
				label: mw.msg( 'mobile-frontend-panel-ok' )
			} ).options,
			new Button( {
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-panel-cancel' )
			} ).options
		]
	} ),
	/**
	 * @memberof BetaOptinPanel
	 * @instance
	 */
	events: util.extend( {}, Panel.prototype.events, {
		'click .optin': 'onOptin'
	} ),
	/**
	 * Cancel event handler
	 * @memberof BetaOptinPanel
	 * @instance
	 * @param {jQuery.Event} ev
	 */
	onOptin: function ( ev ) {
		this.$( ev.currentTarget ).closest( 'form' ).submit();
	}
} );

module.exports = BetaOptinPanel;
