const
	toast = require( '../showOnPageReload' ),
	createPromoCampaign = require( '../promoCampaign/promoCampaign' ),
	amcOutreachDrawer = require( './amcOutreachDrawer' ),
	// MW constants should be kept in sync with onMakeGlobalVariableScript() from
	// MobileFrontendHooks.php
	MW_CONFIG_CAMPAIGN_ACTIVE_NAME = 'wgMFAmcOutreachActive',
	MW_CONFIG_USER_ELIGIBLE_NAME = 'wgMFAmcOutreachUserEligible',
	// This object contains arbitrary actions that are meant to only be shown one
	// time at most. Each action is either 'eligible' or 'ineligible' at any given
	// time.
	//
	// When a new action is desired, it should be added to this object.
	//
	// In other languages, this would be an enum. However, because JS doesn't
	// support enums, the keys/value names are identical in an attempt to mimic
	// some of their functionality. The names in this object are used by
	// promoCampaign to mark when an action has become 'ineligible'.
	ACTIONS = {
		onDesktopLink: 'onDesktopLink',
		onHistoryLink: 'onHistoryLink',
		onTalkLink: 'onTalkLink'
	},
	CAMPAIGN_NAME = 'amc-outreach';

// singleton;
let campaign;

module.exports = {
	/**
	 * @return {PromoCampaign}
	 */
	loadCampaign: () => {
		if ( campaign ) {
			return campaign;
		}

		campaign = createPromoCampaign(
			/**
			 * This callback is executed by promoCampaign's `showIfEligible` method.
			 * promoCampaign will only execute it when an action is 'eligible'.
			 *
			 * @param {string} action Name of one of the actions in the ACTIONS
			 * object. This is used by the drawer to notify promoCampaign when the
			 * action has become 'ineligible' (e.g. after enabling or dismissing the
			 * drawer).
			 * @param {onBeforeHide} onBeforeHide Callback exected after user
			 * dismisses drawer.
			 * @param {string} returnToTitle Title of page to redirect to after user enables
			 * AMC
			 * @param {string} [returnToQuery] Optional query params to add to redirected
			 * URL after user enables AMC. Can also include anchor (e.g.
			 * `foo=bar#/Talk`
			 * @return {Drawer|null}
			 */
			( action, onBeforeHide, returnToTitle, returnToQuery ) => {
				return amcOutreachDrawer(
					action,
					campaign,
					mw.message,
					mw.util,
					toast,
					mw.user.tokens.get( 'csrfToken' ),
					onBeforeHide,
					returnToTitle,
					returnToQuery
				);
			},
			ACTIONS,
			CAMPAIGN_NAME,
			// in minerva desktop, this config will not be set
			!!mw.config.get( MW_CONFIG_CAMPAIGN_ACTIVE_NAME ),
			!!mw.config.get( MW_CONFIG_USER_ELIGIBLE_NAME ),
			mw.storage
		);

		return campaign;
	},
	ACTIONS: ACTIONS
};
