( function ( M, $ ) {
	/**
	 * Gets campaigns, claims, and labels from mw.config
	 * @class wikiGrokCampaigns
	 */
	var wikiGrokCampaigns = {
		/**
		 * Randomly pick a campaign for the current page
		 * @returns {Object|null} Object with campaign data. Includes these properties:
		 *     name: Name of the campaign chosen, e.g. 'album'
		 *     property: Wikidata ID for the relevant property, e.g. 'P31'
		 *     questions: object with item IDs and labels for claim suggestions
		 *     suggestions: array of Wikidata item IDs corresponding to claim suggestions
		 *     randomClaimId: Wikidata item ID of a randomly chosen suggestion
		 */
		getRandomCampaign: function () {
			var campaignName,
				campaigns = getCampaigns(),
				campaign = null;

			if ( campaigns ) {
				campaignName = getRandomProperty( campaigns );
				campaign = campaigns[campaignName];
				campaign.name = campaignName;
				campaign.randomClaimId = getRandomProperty( campaign.questions );

				// make suggestions
				// FIXME: Refactor dialog code to use questions param instead
				campaign.suggestions =  $.map( campaign.questions, function ( value, key ) {
					return key;
				} );
			}
			return campaign;
		}
	};

	/*
	 * Get WikiGrok campaigns that are present on the page
	 * This is a method rather than a variable because we need it in tests
	 * @returns {Object|null} campaigns
	 */
	function getCampaigns() {
		return mw.config.get( 'wgWikiGrokCampaigns' );
	}

	/*
	 * Randomly pick a property
	 * @param {Object} object
	 * @returns {String} object's property
	 */
	function getRandomProperty( object ) {
		var result,
			property,
			count = 0;

		for ( property in object ) {
			if ( object.hasOwnProperty( property ) ) {
				if ( Math.random() <= 1 / ++count ) {
					result = property;
				}
			}
		}
		return result;
	}

	M.define( 'modules/wikigrok/wikiGrokCampaigns', wikiGrokCampaigns );

} ( mw.mobileFrontend, jQuery ) );
