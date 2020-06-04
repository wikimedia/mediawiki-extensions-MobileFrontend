const
	Drawer = require( '../Drawer' ),
	Anchor = require( '../Anchor' ),
	util = require( '../util' ),
	AmcEnableForm = require( './AmcEnableForm' ),
	// These constants should be kept in sync with SpecialMobileOptions.php
	AMC_ENABLE_FIELD_NAME = 'enableAMC',
	AMC_ENABLE_FIELD_VALUE = '1';

/**
 * Callback intended to allow the client run extra logic (e.g. show a modal)
 * after the drawer is dismissed.
 *
 * @callback onBeforeHide
 */

/**
 * @param {string} action Used by the drawer to notify promoCampaign when the
 * action has become 'ineligible' (e.g. after enabling or dismissing the drawer).
 * @param {PromoCampaign} promoCampaign
 * @param {mw.message} mwMessage Used for i18n
 * @param {mw.util} mwUtil Used to determine POST url for the enable form
 * @param {Toast} toast Displays success message after user submits enable form
 * @param {string} csrfToken
 * @param {onBeforeHide} onBeforeHide
 * @param {string} returnToTitle Title to redirect to after user enables
 * AMC
 * @param {string} [returnToQuery] Optional query params to add to redirected
 * URL after user enables AMC
 * @return {Drawer} Returns the drawer that is shown
 */
function amcOutreachDrawer(
	action,
	promoCampaign,
	mwMessage,
	mwUtil,
	toast,
	csrfToken,
	onBeforeHide,
	returnToTitle,
	returnToQuery
) {
	return new Drawer( {
		className: 'amc-outreach-drawer',
		children: [
			util.parseHTML( '<div>' ).addClass( 'amc-outreach-image' ),
			util.parseHTML( '<p>' ).append(
				util.parseHTML( '<strong>' ).text(
					mwMessage( 'mobile-frontend-amc-outreach-intro' ).text()
				)
			),
			util.parseHTML( '<p>' ).text(
				mwMessage( 'mobile-frontend-amc-outreach-description' ).text()
			),
			new AmcEnableForm( {
				postUrl: mwUtil.getUrl( 'Special:MobileOptions', {
					returnto: returnToTitle,
					returntoquery: returnToQuery || ''
				} ),
				fields: [
					{
						name: 'updateSingleOption',
						value: AMC_ENABLE_FIELD_NAME
					},
					{
						name: 'enableAMC',
						value: AMC_ENABLE_FIELD_VALUE
					},
					{
						name: 'token',
						value: csrfToken
					}
				],
				buttonLabel: mwMessage( 'mobile-frontend-amc-outreach-enable' ).text(),
				events: {
					submit: () => {
						promoCampaign.makeActionIneligible( action );
						toast.showOnPageReload( mwMessage( 'mobile-frontend-amc-outreach-enabled-message' ).text() );
					}
				}
			} ).$el,
			new Anchor( {
				href: '#',
				additionalClassNames: 'cancel',
				progressive: true,
				label: mwMessage( 'mobile-frontend-amc-outreach-no-thanks' ).text()
			} ).$el
		],
		onBeforeHide: () => {
			promoCampaign.makeActionIneligible( action );
			onBeforeHide();
		}
	} );
}

module.exports = amcOutreachDrawer;
