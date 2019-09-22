const
	m = require( '../moduleLoaderSingleton' ),
	toast = require( '../toast' ),
	promoCampaign = require( '../promoCampaign/promoCampaign' ),
	currentPage = require( '../currentPage' ),
	// MW constants should be kept in sync with onMakeGlobalVariableScript() from
	// MobileFrontendHooks.php
	MW_CONFIG_CAMPAIGN_ACTIVE_NAME = 'wgMFAmcOutreachActive',
	MW_CONFIG_USER_ELIGIBLE_NAME = 'wgMFAmcOutreachUserEligible',
	ACTIONS = {
		onLoad: 'onLoad'
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

		campaign = promoCampaign(
			( action ) => {
				mw.loader.using( 'mobile.amcOutreachDrawer' ).then( () => {
					const drawer = m.require( 'mobile.amcOutreachDrawer' ).amcOutreachDrawer(
						action,
						campaign,
						mw.message,
						mw.util,
						currentPage(),
						toast,
						mw.user.tokens.get( 'csrfToken' )
					);

					drawer.show();
				} );
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
