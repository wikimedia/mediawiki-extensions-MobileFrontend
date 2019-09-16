const blockInfo = {
	blockid: 1,
	partial: true,
	blockedby: 'Jon',
	reason: 'Constant vandalism',
	duration: '10 days',
	expiry: 'Sept 1st'
};

export const abuseFilterWarning = {
	errors: [
		{
			code: 'abusefilter-warning',
			html: '<b>Warning:</b> This action has been automatically identified as harmful.\nUnconstructive actions will be quickly reverted,\nand egregious or repeated unconstructive editing will result in your account or IP address being blocked.\nIf you believe this action to be constructive, you may submit it again to confirm it.\nA brief description of the abuse rule which your action matched is: Test filter warn',
			data: {
				abusefilter: {
					id: 4,
					description: 'Test filter warn',
					actions: [
						'warn'
					]
				}
			},
			module: 'edit'
		}
	],
	docref: 'See http://localhost:3080/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.'
};

export const abuseFilterDisallowed = {
	errors: [
		{
			code: 'abusefilter-disallowed',
			html: 'This action has been automatically identified as harmful, and therefore disallowed.\nIf you believe your action was constructive, please inform an administrator of what you were trying to do.\nA brief description of the abuse rule which your action matched is: Test filter disallow',
			data: {
				abusefilter: {
					id: 3,
					description: 'Test filter disallow',
					actions: [
						'disallow'
					]
				}
			},
			module: 'edit'
		}
	],
	docref: 'See http://localhost:3080/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.'
};

export const spamBlacklist = {
	errors: [
		{
			code: 'spamblacklist',
			html: 'The text you wanted to save was blocked by the spam filter. <b>Woohoo!</b> This is probably caused by a link to a blacklisted external site.\nThe following text is what triggered our spam filter: example.com/test',
			data: {
				spamblacklist: {
					matches: [
						'example.com/test'
					]
				}
			},
			module: 'edit'
		}
	],
	docref: 'See http://localhost:3080/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.'
};

export const editConflict = {
	errors: [
		{
			code: 'editconflict',
			html: 'Edit conflict: $1',
			module: 'edit'
		}
	],
	docref: 'See http://localhost:3080/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.'
};

export const readOnly = {
	errors: [
		{
			code: 'readonly',
			html: 'The wiki is currently in read-only mode.',
			data: {
				readonlyreason: 'Test'
			},
			module: 'main'
		}
	],
	docref: 'See http://localhost:3080/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.'
};

export const captcha = {
	edit: {
		captcha: {
			type: 'image',
			mime: 'image/png',
			id: '1893858722',
			url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/CAPTCHA_wikibook.png'
		},
		result: 'Failure'
	}
};

export const previewResponse = {
	parse: {
		text: {
			'*': '<p>The preview of your edit goes here <strong>Banana</strong></p>'
		}
	}
};

export const revisionResponse = {
	query: {
		pages: [
			{
				revisions: [
					{
						content: '{{about|bananas generally|the genus to which banana plants belong|Musa (genus)|starchier bananas used in cooking|Cooking banana|other uses|Banana (disambiguation)}}',
						timestamp: '2019-08-21T22:14:18Z'
					}
				]
			}
		]
	}
};

export const blockResponse = {
	query: {
		pages: [
			{
				actions: {
					edit: [ {
						data: {
							blockinfo: blockInfo
						},
						code: 'blocked'
					} ]
				},
				revisions: [
					{
						content: '{{about|bananas generally|the genus to which banana plants belong|Musa (genus)|starchier bananas used in cooking|Cooking banana|other uses|Banana (disambiguation)}}',
						timestamp: '2019-08-21T22:14:18Z'
					}
				]
			}
		]
	}
};

export const saveSuccessResponse = {
	edit: {
		result: 'Success'
	}
};
