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

	QUnit.test( '#getThumbnails', 11, function ( assert ) {
		var p, textPage, pLegacyUrls, thumbs, pNoViewer, pMetadata, pLazyImages, metadataTable,
			pLazyImagesTypo, pMetadataNested;

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
		pNoViewer = new Page( {
			el: $( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box noviewer"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
		} );
		pMetadata = new Page( {
			el: $( '<div><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" class="metadata" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
		} );
		pMetadataNested = new Page( {
			el: $( '<div class="noviewer"><a href="/wikpa/index.php?title=File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" class="image view-border-box"><img alt="Cyanolimnas cerverai by Allan Brooks cropped.jpg" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg/300px-Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg" width="300" height="303" data-file-width="454" data-file-height="459"></a></div>' )
		} );
		pLazyImages = new Page( {
			el: $( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><noscript><img alt="icon" src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" width="28" height="28" class="noviewer" data-file-width="151" data-file-height="151"></noscript><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="noviewer">&nbsp;</span></a></div>' )
		} );
		pLazyImagesTypo = new Page( {
			el: $( '<div><a href="/wiki/File:Design_portal_logo.jpg" class="image"><noscript><img alt="icon" src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" width="28" height="28" class="noviewer" data-file-width="151" data-file-height="151"></noscript><span class="lazy-image-placeholder" style="width: 28px;height: 28px;" data-src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Design_portal_logo.jpg/28px-Design_portal_logo.jpg" data-alt="icon" data-width="28" data-height="28" data-class="wot noviewerz bar">&nbsp;</span></a></div>' )
		} );
		metadataTable = new Page( {
			el: $( '<div><table class="plainlinks metadata ambox ambox-content ambox-Unreferenced" role="presentation"><tr><td class="mbox-image"><div style="width:52px"><a href="/wiki/File:Question_book-new.svg" class="image"><noscript><img alt="" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Question_book-new.svg/50px-Question_book-new.svg.png" width="50" height="39" data-file-width="262" data-file-height="204"></noscript><span class="lazy-image-placeholder" style="width: 50px;height: 39px;" data-src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Question_book-new.svg/50px-Question_book-new.svg.png" data-alt="" data-width="50" data-height="39" data-srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Question_book-new.svg/75px-Question_book-new.svg.png 1.5x, https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Question_book-new.svg/100px-Question_book-new.svg.png 2x"> </span></a></div></td></tr></table>' )
		} );

		assert.strictEqual( thumbs.length, 1, 'Found expected number of thumbnails.' );
		assert.strictEqual( thumbs[0].getFileName(), 'File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg',
			'Found expected filename.' );

		thumbs = textPage.getThumbnails();
		assert.strictEqual( thumbs.length, 0, 'This page has no thumbnails.' );

		thumbs = pLegacyUrls.getThumbnails();
		assert.strictEqual( thumbs.length, 1, 'Found expected number of thumbnails.' );
		assert.strictEqual( thumbs[0].getFileName(), 'File:Cyanolimnas_cerverai_by_Allan_Brooks_cropped.jpg',
			'Found expected filename.' );

		thumbs = pNoViewer.getThumbnails();
		assert.strictEqual( thumbs.length, 0, 'This page has no thumbnails.' );

		thumbs = pMetadata.getThumbnails();
		assert.strictEqual( thumbs.length, 0, 'This page has no thumbnails.' );

		thumbs = pMetadataNested.getThumbnails();
		assert.strictEqual( thumbs.length, 0,
			'Images inside a container with the class are not included. Images inside tables for example.' );

		thumbs = pLazyImages.getThumbnails();
		assert.strictEqual( thumbs.length, 0,
			'Consider whether the class is on an image which has not been lazy loaded.' );

		thumbs = metadataTable.getThumbnails();
		assert.strictEqual( thumbs.length, 0,
			'Consider whether the lazy loaded image is inside a .metadata container.' );

		thumbs = pLazyImagesTypo.getThumbnails();
		assert.strictEqual( thumbs.length, 1,
			'Thumbnail found if there is a typo.' );
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
