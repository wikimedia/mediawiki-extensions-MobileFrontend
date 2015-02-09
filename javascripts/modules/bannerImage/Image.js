( function ( M, $ ) {

	var browser = M.require( 'browser' );

	/**
	 * An image that can be loaded.
	 *
	 * @class Image
	 */
	function Image( src, width, height ) {
		this.src = src;
		this.width = width;
		this.height = height;
	}

	/**
	 * Try to load image and resolve or fail when it loads / or not.
	 * @returns {jQuery.Deferred}
	 */
	Image.prototype.load = function () {
		var loaded = $.Deferred(),
			self = this;
		// Try to load it
		// There is an issue with reliably knowing if the
		// original image is wider than the thumbnail.
		// If so, that image will fail to load.
		$( '<img>' )
			.attr( 'src', this.src )
			.load( function () {
				if ( browser.isWideScreen() && $( this ).width() < 768 ) {
					loaded.reject();
				} else {
					loaded.resolve( self );
				}
				$( this ).remove();
			} )
			.error( function () {
				$( this ).remove();
				loaded.reject();
			} )
			.appendTo( $( 'body' ) )
			.hide();
		return loaded;
	};

	M.define( 'modules/bannerImage/Image', Image );

} ( mw.mobileFrontend, jQuery ) );
