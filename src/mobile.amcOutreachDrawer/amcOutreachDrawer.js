const
	Drawer = require( '../mobile.startup/Drawer' ),
	Anchor = require( '../mobile.startup/Anchor' ),
	util = require( '../mobile.startup/util' ),
	AmcEnableForm = require( './AmcEnableForm' ),
	// These constants should be kept in sync with SpecialMobileOptions.php
	AMC_ENABLE_FIELD_NAME = 'enableAMC',
	AMC_ENABLE_FIELD_VALUE = '1';

/**
 * @param {string} action
 * @param {PromoCampaign} promoCampaign
 * @param {mw.message} mwMessage Used for i18n
 * @param {mw.util} mwUtil Used to determine POST url for the enable form
 * @param {Page} currentPage Used to determine what page to redirect to after form submission
 * @param {Toast} toast Displays success message after user submits enable form
 * @param {string} editToken Used as a CSRF token
 * @return {Drawer} Returns the drawer that is shown
 */
function amcOutreachDrawer(
	action,
	promoCampaign,
	mwMessage,
	mwUtil,
	currentPage,
	toast,
	editToken
) {
	return new Drawer( {
		className: 'amc-outreach-drawer',
		closeOnScroll: false,
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
					returnto: currentPage.title
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
						value: editToken
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
			toast.show( mwMessage( 'mobile-frontend-amc-outreach-dismissed-message' ).text() );
		}
	} );
}

module.exports = amcOutreachDrawer;
