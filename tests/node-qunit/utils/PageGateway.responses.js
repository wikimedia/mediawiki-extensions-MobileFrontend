module.exports = {
	getPageHeadings: {
		input: {
			mobileview: {
				id: -1,
				displaytitle: 'Test',
				revId: 42,
				lastmodifiedby: {
					name: 'bob',
					gender: 'unknown'
				},
				protection: [],
				lastmodified: '2013-10-28T18:49:56Z',
				languagecount: 10,
				sections: [
					{
						id: 0,
						text: ''
					},
					{
						level: '1',
						line: '1',
						anchor: '1',
						id: 1,
						text: '<p>Text of 1\n</p>'
					},
					{
						level: '2',
						line: '<i>1.1</i>',
						anchor: '1.1',
						id: 2,
						text: '<p>Text of 1.1\n</p>'
					},
					{
						level: '1',
						line: '2',
						anchor: '2',
						id: 3,
						text: '<p>Text of 2\n</p>'
					},
					{
						level: '2',
						line: '2.1',
						anchor: '2.1',
						id: 4,
						text: '<p>Text of 2.1\n</p>'
					} ]
			}
		},
		output: {
			historyUrl: 'Test:History',
			lastModifiedUserName: 'bob',
			lastModifiedUserGender: 'unknown',
			lastModifiedTimestamp: 1382986196,
			title: 'Test',
			revId: 42,
			displayTitle: 'Test',
			id: -1,
			protection: {
				edit: [ '*' ]
			},
			isMainPage: false,
			languageCount: 10,
			hasVariants: false,
			lead: '',
			sections: [
				{
					level: '1',
					line: '1',
					anchor: '1',
					id: 1,
					text: '<p>Text of 1\n</p><h2 id="1.1"><i>1.1</i></h2>\n<p>Text of 1.1\n</p>',
					subsections: [
						{
							level: '2',
							line: '<i>1.1</i>',
							anchor: '1.1',
							id: 2,
							text: '<p>Text of 1.1\n</p>',
							subsections: []
						}
					]
				},
				{
					level: '1',
					line: '2',
					anchor: '2',
					id: 3,
					text: '<p>Text of 2\n</p><h2 id="2.1">2.1</h2>\n<p>Text of 2.1\n</p>',
					subsections: [
						{
							level: '2',
							line: '2.1',
							anchor: '2.1',
							id: 4,
							text: '<p>Text of 2.1\n</p>',
							subsections: []
						}
					]
				}
			]
		}
	},
	getPageLanguagesResponse: {
		input: {
			query: {
				pages: [
					{
						pageid: 94,
						ns: 0,
						title: 'San Francisco',
						langlinks: [
							{
								lang: 'es',
								url: 'http://es.wikipedia.org/wiki/San_Francisco_(California)',
								title: 'San Francisco (California)',
								autonym: 'espa\u00f1ol'
							},
							{
								lang: 'pl',
								url: 'http://pl.wikipedia.org/wiki/San_Francisco',
								title: 'San Francisco',
								autonym: 'polski'
							},
							{
								lang: 'sr',
								url: 'http://sr.wikipedia.org/wiki/%D0%A1%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%BE',
								title: '\u0421\u0430\u043d \u0424\u0440\u0430\u043d\u0446\u0438\u0441\u043a\u043e',
								autonym: '\u0441\u0440\u043f\u0441\u043a\u0438 / srpski'
							}
						]
					}
				],
				general: {
					variants: [
						{
							code: 'sr',
							name: 'sr'
						},
						{
							code: 'sr-ec',
							name: '\u040b\u0438\u0440\u0438\u043b\u0438\u0446\u0430'
						},
						{
							code: 'sr-el',
							name: 'Latinica'
						}
					],
					variantarticlepath: '/$2/$1'
				},
				languages: [
					{
						code: 'sr',
						name: 'српски / srpski'
					},
					{
						code: 'sr-ec',
						name: 'српски (ћирилица)'
					},
					{
						code: 'sr-el',
						name: 'srpski (latinica)‎'
					},
					{
						code: 'es',
						name: 'español'
					},
					{
						code: 'pl',
						name: 'polski'
					}
				]
			},
			limits: {
				langlinks: 500
			}
		},
		output: {
			languages: [
				{
					lang: 'es',
					url: 'http://es.wikipedia.org/wiki/San_Francisco_(California)',
					title: 'San Francisco (California)',
					autonym: 'espa\u00f1ol'
				},
				{
					lang: 'pl',
					url: 'http://pl.wikipedia.org/wiki/San_Francisco',
					title: 'San Francisco',
					autonym: 'polski'
				},
				{
					lang: 'sr',
					url: 'http://sr.wikipedia.org/wiki/%D0%A1%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%BE',
					title: '\u0421\u0430\u043d \u0424\u0440\u0430\u043d\u0446\u0438\u0441\u043a\u043e',
					autonym: '\u0441\u0440\u043f\u0441\u043a\u0438 / srpski'
				}
			],
			variants: [
				{
					lang: 'sr',
					autonym: 'sr',
					url: '/sr/Test'
				},
				{
					lang: 'sr-ec',
					autonym: '\u040b\u0438\u0440\u0438\u043b\u0438\u0446\u0430',
					url: '/sr-ec/Test'
				},
				{
					lang: 'sr-el',
					autonym: 'Latinica',
					url: '/sr-el/Test'
				}
			]
		}
	},
	getPageLanguagesCall: {
		output: {
			action: 'query',
			meta: 'siteinfo',
			siprop: 'general',
			prop: 'langlinks',
			llprop: 'url|autonym|langname',
			llinlanguagecode: 'fr',
			lllimit: 'max',
			titles: 'Title',
			formatversion: 2
		}
	},
	getAPIResponseFromHTML: {
		input: [
			{
				line: 'A1',
				level: '1',
				anchor: '1.0',
				text: ''
			},
			{
				line: 'A2.1',
				level: '2',
				anchor: '',
				text: ''
			},
			{
				line: 'A2.2',
				level: '2',
				anchor: '',
				text: ''
			},
			{
				line: 'A2',
				level: '1',
				anchor: '',
				text: ''
			},
			{
				line: 'A2.1',
				level: '2',
				anchor: '',
				text: ''
			}
		]
	}

};
