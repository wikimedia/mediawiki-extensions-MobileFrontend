( function ( M, $ ) {
	var ImageOverlay = M.require( 'mobile.mediaViewer/ImageOverlay' );

	QUnit.module( 'MobileFrontend mobile.mediaViewer/ImageOverlay', {
		beforeEach: function () {
			this.image = {
				descriptionurl: 'https://commons.wikimedia.org/wiki/File:The_Montgomery,_San_Francisco.jpg',
				thumbheight: 1024,
				thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/The_Montgomery%2C_San_Francisco.jpg/676px-The_Montgomery%2C_San_Francisco.jpg',
				thumbwidth: 676,
				url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/The_Montgomery%2C_San_Francisco.jpg'
			};
			this.imageGateway = {
				getThumb: function () {
					return $.Deferred().resolve( {
						query: {
							pages: [
								{
									imageinfo: [ this.image ]
								}
							]
						}
					} );
				}
			};
			this.router = {
				getPath: function () {
					return '/media/File%3AA_cursiva.gif';
				}
			};
			this.thumbnails = [
				{
					filename: 'foo',
					getFileName: function () { return ''; },
					getPath: function () { return ''; },
					getDescription: function () { return ''; }
				},
				{
					filename: 'bar',
					getFileName: function () { return ''; },
					getPath: function () { return ''; },
					getDescription: function () { return ''; }
				}
			];
		}
	} );

	QUnit.test( 'Shows details bar and image with successful api response', function ( assert ) {
		var overlay = new ImageOverlay( {
			gateway: this.imageGateway,
			title: decodeURIComponent( this.image.url ),
			caption: 'The Montgomery in 2012.',
			router: this.router
		} );

		return this.imageGateway.getThumb().then( function () {
			assert.strictEqual( overlay.$el.find( 'img' ).length, 1, 'Image is present.' );
			assert.strictEqual( overlay.$el.find( '.load-fail-msg' ).length, 0, 'Load error msg is not visible' );
			assert.strictEqual( overlay.$el.find( '.details.is-visible' ).length, 1, 'Details bar present' );
		} );
	} );

	QUnit.test( 'Shows error message with failed api response', function ( assert ) {
		var overlay, imageGateway = {
			getThumb: function () {
				return $.Deferred().reject( 'Load Error' );
			}
		};

		overlay = new ImageOverlay( {
			gateway: imageGateway,
			title: decodeURIComponent( this.image.url ),
			caption: 'The Montgomery in 2012.',
			router: this.router
		} );

		return imageGateway.getThumb().catch( function () {
			assert.strictEqual( overlay.$el.find( '.load-fail-msg' ).length, 1, 'Load error msg is visible' );
			assert.strictEqual( overlay.$el.find( '.details.is-visible' ).length, 0, 'Details bar is hidden' );
		} );
	} );

	QUnit.test( 'Toggling of details is disabled when overlay has load failure', function ( assert ) {
		var overlay, imageGateway = {
			getThumb: function () {
				return $.Deferred().reject( 'Load Error' );
			}
		};

		overlay = new ImageOverlay( {
			gateway: imageGateway,
			title: decodeURIComponent( this.image.url ),
			caption: 'The Montgomery in 2012.',
			thumbnails: this.thumbnails,
			router: this.router
		} );

		return imageGateway.getThumb().catch( function () {
			assert.strictEqual( overlay.$el.find( '.details.is-visible' ).length, 0, 'Details bar is hidden' );
			assert.strictEqual( overlay.$el.find( '.details' ).css( 'display' ), '', 'Ensure display rule is not set' );
			assert.strictEqual( overlay.$el.find( '.cancel' ).css( 'display' ), '', 'Cancel button is shown' );
			assert.strictEqual( overlay.$el.find( '.prev' ).css( 'display' ), '', 'Slider buttons are shown' );

			overlay.$el.find( '.image-wrapper' ).trigger( 'click' );

			// Assert that toggle didn't occur (would add display: none)
			assert.strictEqual( overlay.$el.find( '.details' ).css( 'display' ), '', 'Details bar is still hidden' );
			assert.strictEqual( overlay.$el.find( '.cancel' ).css( 'display' ), '', 'Cancel button is still shown' );
			assert.strictEqual( overlay.$el.find( '.prev' ).css( 'display' ), '', 'Slider buttons are still shown' );
		} );
	} );

	QUnit.test( 'Toggling of details is enabled when overlay loads successfully', function ( assert ) {
		var overlay = new ImageOverlay( {
			gateway: this.imageGateway,
			title: decodeURIComponent( this.image.url ),
			caption: 'The Montgomery in 2012.',
			thumbnails: this.thumbnails,
			router: this.router
		} );

		return this.imageGateway.getThumb().then( function () {
			assert.strictEqual( overlay.$el.find( '.details.is-visible' ).length, 1, 'Details bar is shown' );
			assert.strictEqual( overlay.$el.find( '.details' ).css( 'display' ), '', 'Ensure display rule is not set' );
			assert.strictEqual( overlay.$el.find( '.cancel' ).css( 'display' ), '', 'Cancel button is shown' );
			assert.strictEqual( overlay.$el.find( '.prev' ).css( 'display' ), '', 'Slider buttons are shown' );

			overlay.$el.find( '.image-wrapper' ).trigger( 'click' );

			assert.strictEqual( overlay.$el.find( '.details' ).css( 'display' ), 'none', 'Details bar is hidden' );
			assert.strictEqual( overlay.$el.find( '.cancel' ).css( 'display' ), 'none', 'Cancel button is hidden' );
			assert.strictEqual( overlay.$el.find( '.slider-button' ).css( 'display' ), 'none', 'Slider buttons are hidden' );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
