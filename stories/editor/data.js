const blockInfo = {
	blockid: 1,
	partial: true,
	blockedby: 'Jon',
	reason: 'Constant vandalism',
	duration: '10 days',
	expiry: 'Sept 1st'
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
