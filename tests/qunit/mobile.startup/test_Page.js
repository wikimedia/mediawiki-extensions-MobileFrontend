( function ( M, $ ) {
	var Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend Page' );

	QUnit.test( '#isMainPage', 2, function ( assert ) {
		var p = new Page( {
				title: 'Main Page',
				isMainPage: true
			} ),
			p2 = new Page( {
				title: 'Foo'
			} );
		assert.strictEqual( p.isMainPage(), true, 'check main page flag is updated' );
		assert.strictEqual( p2.isMainPage(), false, 'check not marked as main page' );
	} );

	QUnit.test( '#getThumbnails', 5, function ( assert ) {
		var p, textPage, pLegacyUrls, thumbs;

		p = new Page( {
			el: $( '<div><a href="/wiki/File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
		} );
		textPage = new Page( {
			el: $( '<div />' )
		} );
		pLegacyUrls = new Page( {
			el: $( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
		} );
		thumbs = p.getThumbnails();

		assert.strictEqual( thumbs.length, 1, 'Found expected number of thumbnails.' );
		assert.strictEqual( thumbs[0].getFileName(), 'File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg',
			'Found expected filename.' );

		thumbs = textPage.getThumbnails();
		assert.strictEqual( thumbs.length, 0, 'This page has no thumbnails.' );

		thumbs = pLegacyUrls.getThumbnails();
		assert.strictEqual( thumbs.length, 1, 'Found expected number of thumbnails.' );
		assert.strictEqual( thumbs[0].getFileName(), 'File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg',
			'Found expected filename.' );

	} );

	QUnit.test( '#getNamespaceId', 8, function ( assert ) {
		var testCases = [
			[ 'Main Page', 0 ],
			[ 'San Francisco', 0 ],
			[ 'San Francisco: Talk:2', 0 ],
			[ 'San Francisco: The Sequel', 0 ],
			[ 'Talk:Foo', 1 ],
			[ 'Project:Bar', 4 ],
			[ 'User talk:Jon', 3 ],
			[ 'Special:Nearby', -1 ]
		];
		testCases.forEach( function ( tc ) {
			var p = new Page( {
				title: tc[ 0 ]
			} );
			assert.strictEqual( p.getNamespaceId(), tc[ 1 ], 'Check namespace is as expected' );
		} );
	} );

	QUnit.test( '#isTalkPage', 8, function ( assert ) {
		var testCases = [
			[ 'Main Page', false ],
			[ 'San Francisco', false ],
			[ 'San Francisco: Talk:2', false ],
			[ 'San Francisco: The Sequel', false ],
			[ 'Talk:Foo', true ],
			[ 'Project talk:Bar', true ],
			[ 'User talk:Jon', true ],
			[ 'Special:Nearby', false ]
		];
		testCases.forEach( function ( tc ) {
			var p = new Page( {
				title: tc[ 0 ]
			} );
			assert.strictEqual( p.isTalkPage(), tc[ 1 ], 'Check test is as expected' );
		} );
	} );

	QUnit.test( '#allowsXSS', 3, function ( assert ) {
		var p = new Page( {
				title: '<script>alert("oops, XSS possible!");</script>'
			} ),
			titleJSON = [
				{
					thumbnail: false,
					title: '<script>alert("oops, XSS possible!");</script>',
					terms: false,
					testDesc: 'Check against XSS in Page.newFromJSON displaytitle (when title set)'
				},
				{
					thumbnail: false,
					pageprops: [],
					terms: {
						label: [
							'<script>alert("oops, XSS possible!");</script>'
						]
					},
					testDesc: 'Check against XSS in Page.newFromJSON displaytitle (when Wikibase label set)'
				}
			];

		assert.strictEqual(
			p.getDisplayTitle(),
			'&lt;script&gt;alert(&quot;oops, XSS possible!&quot;);&lt;/script&gt;',
			'Check against XSS in Page.js constructor displaytitle (when title set)'
		);

		titleJSON.forEach( function ( json ) {
			p = Page.newFromJSON( json );

			assert.strictEqual(
				p.getDisplayTitle(),
				'&lt;script&gt;alert(&quot;oops, XSS possible!&quot;);&lt;/script&gt;',
				json.testDesc
			);
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
