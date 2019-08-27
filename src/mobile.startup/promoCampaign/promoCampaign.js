/**
 * @typedef {Object} PromoCampaign
 * @property {Function} showIfEligible
 * @property {Function} makeActionIneligible
 * @property {Function} makeAllActionsIneligible
 * @property {Function} isCampaignActive
 */

/**
 * Creates a campaign that makes showing promo drawers, modals, etc that should
 * only be shown once (using localStorage) per action (when page loads, when
 * user clicks on a link, etc) easier. The campaign executes a given
 * callback (e.g. showing a drawer or modal) for a specific action only when it
 * is eligible. A campaign can contain multiple arbitrary actions. The client
 * is responsible for calling this when an action should be deemed ineligible
 * via the exported `makeActionIneligible` and `makeAllActionsIneligible`
 * methods.
 *
 * @param {Function} onShow A callback intended to show something related to the
 * campaign (drawer, modal, etc) when executed. The callback will only execute
 * after the client calls `showIfEligible` and only if the passed in action is
 * eligible
 * @param {Object} actions Object of arbitrary actions (onPageLoad,
 * onHistoryLinkClick). For each action, the key and value should be the same
 * (e.g. "onLoad":"onLoad").
 * @param {string} campaignName Name of campaign. This is only used to form part
 * of the localStorage key for each action.
 * @param {boolean} campaignActive Is campaign active
 * @param {boolean} userEligible Is current user eligible
 * @param {mw.storage} mwStorage Used to mark actions as ineligible
 * into localStorage
 * @return {PromoCampaign}
 */
function createPromoCampaign(
	onShow,
	actions,
	campaignName,
	campaignActive,
	userEligible,
	mwStorage
) {
	// This object maps actions to localStorage keys
	const ACTIONS_TO_STORAGE_KEYS = {};
	var key, action;
	for ( key in actions ) {
		action = actions[key];
		ACTIONS_TO_STORAGE_KEYS[action] = `mobile-frontend-${campaignName}-ineligible-${action}`;
	}

	/**
	 * @return {boolean}
	 */
	function isCampaignActive() {
		return campaignActive;
	}

	/**
	 * @param {string} action
	 * @throws {Error} Throws an error if action is not valid.
	 */
	function validateAction( action ) {
		if ( !( action in actions ) ) {
			throw new Error(
				`Action '${action}' not found in 'actions' object. Please add this to
				the object when creating a campaign with promoCampaign.js if you believe
				this is a valid action.`
			);
		}
	}

	/**
	 * @param {string} action Will check the eligibility of this action. This
	 * should be a value in the actions object.
	 * @throws {Error} Throws an error if action is not valid.
	 * @return {boolean}
	 */
	function isActionEligible( action ) {
		validateAction( action );

		return isCampaignActive() &&
			userEligible &&
			mwStorage.get( ACTIONS_TO_STORAGE_KEYS[action] ) === null;
	}

	return {
		/**
		 * @param {string} action Should be one of the values in the
		 * actions param
		 * @throws {Error} Throws an error if action is not valid.
		 */
		showIfEligible: function ( action ) {
			if ( !isActionEligible( action ) ) {
				// If not eligible, there is no sense in continuing.
				return;
			}

			onShow( action );
		},
		/**
		 * @param {string} action
		 * @throws {Error} Throws an error if action is not valid.
		 * @return {boolean} Whether the save operation was successful
		 */
		makeActionIneligible: function ( action ) {
			validateAction( action );

			// The value here actually doesn't matter. The only thing that matters is
			// if this key exists in localStorage.
			return mwStorage.set( ACTIONS_TO_STORAGE_KEYS[action], '~' );
		},
		makeAllActionsIneligible: function () {
			var key, action;
			for ( key in actions ) {
				action = actions[key];
				this.makeActionIneligible( action );
			}
		},
		isCampaignActive: isCampaignActive
	};
}

module.exports = createPromoCampaign;
