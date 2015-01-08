( function ( M ) {
	/**
	 * Gets campaigns, claims, and labels from mw.config
	 * @class wikiGrokCampaigns
	 * @singleton
	 */
	var wikiGrokCampaigns = {
		/**
		 * Randomly pick a campaign for the current page
		 * @method
		 * @returns {Object|null} Object with campaign data. Includes these properties:
		 *     name: Name of the campaign chosen, e.g. 'album'
		 *     property: Wikidata ID for the relevant property, e.g. 'P31'
		 *     questions: object with item IDs and labels for claim suggestions
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

				// Support legacy WikiGrok data. Remove this code once all WikiGrok
				// articles have the new propertyId and propertyName properties.
				// See https://gerrit.wikimedia.org/r/#/c/181208/
				if ( campaign.propertyId === undefined ) {
					campaign.propertyId = campaign.property;
				}
				if ( campaign.propertyName === undefined ) {
					if (
						campaign.name === 'author' ||
						campaign.name === 'actor'
					) {
						campaign.propertyName = 'occupation';
					} else if ( campaign.name === 'album' ) {
						campaign.propertyName = 'instance of';
					}
				}
			}
			return campaign;
		},

		/**
		 * Return suggestions (questions) from all available campaigns
		 * @returns {Array} suggestion objects with id, label, and campaign properties
		 */
		getAllSuggestions: function () {
			var campaigns = getCampaigns(),
				campaignName,
				questions = [];

			for ( campaignName in campaigns ) {
				if ( campaigns.hasOwnProperty( campaignName ) ) {
					// let's keep campaignName, it's used in tests, also maybe useful in other cases
					campaigns[campaignName].name = campaignName;
					questions = questions.concat( getCampaignQuestions( campaigns[campaignName] ) );
				}
			}
			return questions;
		}
	};

	/**
	 * Get WikiGrok campaigns that are present on the page
	 * This is a method rather than a variable because we need it in tests
	 * @method
	 * @ignore
	 * @returns {Object|null} campaigns
	 */
	function getCampaigns() {
		return mw.config.get( 'wgWikiGrokCampaigns' );
	}

	/**
	 * Return campaign questions in the desirable format
	 * @param {Object} campaign
	 * @returns {Array} question objects with id, label, and campaign properties
	 */
	function getCampaignQuestions( campaign ) {
		var questionId,
			questions = [];

		for ( questionId in campaign.questions ) {
			if ( campaign.questions.hasOwnProperty( questionId ) ) {
				questions.push( {
					id: questionId,
					label: campaign.questions[questionId],
					campaign: campaign
				} );
			}
		}
		return questions;
	}

	/**
	 * Randomly pick a property
	 * @method
	 * @ignore
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

} ( mw.mobileFrontend ) );
