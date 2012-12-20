( function( M,  $ ) {

var dirty, module,
	NS_MAIN = 0, NS_TALK = 1, // FIXME: make global
	THUMBNAIL_SIZE_PX = 300;

$( function() {

	function confirmExit() {
		if ( dirty ) {
			return M.message( 'mobile-frontend-saving-exit-page' );
		}
	}

	window.onbeforeunload = confirmExit;
} );

module = ( function() {
	var
		ns = M.getConfig( 'namespace' ), // FIXME: use wgNamespaceNumber ?,
		supported = M.isLoggedIn() &&
			typeof FileReader !== 'undefined' && typeof FormData !== 'undefined' &&
			!M.getConfig( 'imagesDisabled', false ) &&
			( ns === NS_MAIN || ns === NS_TALK ) && // limit to talk and article namespaces
			// webkit only for time being
			window.navigator.userAgent.indexOf( 'WebKit' ) > -1,
		endPoint = M.getConfig( 'photo-upload-endpoint' ),
		spinnerImg = M.getConfig( 'ajaxLoader' );

	function generateFileName( file ) {
		// FIXME: deal with long and invalid names
		var name = 'Lead_Photo_For_' + M.getConfig( 'title' ) + Math.random(),
			extension;

		name = name.replace( String.fromCharCode( 27 ), '-' );
		name = name.replace( /[\x7f\.\[#<>\[\]\|\{\}\/:]/g, '-' );
		extension = file.value.slice( file.value.lastIndexOf( '.' ) + 1 );
		return name + '.' + extension;
	}

	function getDataUrl( file, callback ) {
		var reader = new FileReader();
		reader.onload = function( ev ) {
			callback( ev.target.result );
		};

		reader.readAsDataURL( file );
	}

	// FIXME: Kill the need for this horrible function by giving me a nicer API
	function getImageFromQueryResult( pages ) {
		var key, result;
		for ( key in pages ) {
			if ( pages.hasOwnProperty( key ) ) {
				result = pages[ key ];
			}
		}
		return result;
	}

	function showSpinner( $container ) {
		// set spinner
		$container.find( 'img' ).attr( 'src', spinnerImg );
	}

	function save( filename, caption, $container, saveWikiTextFlag ) {
		var $img = $container.find( 'img' ),
			$a = $container.find( 'a' ),
			$form = $container.find( 'form' ),
			formData = new FormData();
		formData.append( 'filename', filename );
		formData.append( 'comment', M.message( 'mobile-frontend-photo-article-edit-comment' ) );
		formData.append( 'file', $form.find( 'input[type=file]' )[ 0 ].files[ 0 ] );
		dirty = true;

		function saveWikiText( name, caption, token ) {
			return $.ajax( {
				url: M.getApiUrl(),
				type: 'POST',
				data: {
					format: 'json',
					action: 'edit',
					title: M.getConfig( 'title' ),
					token: token,
					comment: M.message( 'mobile-frontend-photo-upload-comment' ),
					prependtext: '[[File:' + name + '|thumbnail|' + caption + ']]\n\n'
				}
			} );
		}

		// FIXME: Kill the need to make yet another request for the thumbnail by giving me a nicer API..
		// this should be a synchronous function that takes imageinfo as an argument
		function displayPhoto( filename ) {
			var api = endPoint || M.getApiUrl();
			$.ajax( {
				url: api,
				dataType: 'json',
				data: {
					action: 'query',
					prop: 'imageinfo',
					iiprop: 'url',
					iiurlwidth: THUMBNAIL_SIZE_PX,
					titles: 'File:' + filename,
					format: 'json'
				}
			} ).done( function( data ) {
				var pages = data.query && data.query.pages ? data.query.pages : {},
					image = getImageFromQueryResult( pages ),
					info = image ? image.imageinfo[ 0 ] : false;

				if ( info ) {
					$a.attr( 'href', info.descriptionurl );
					$img.attr( 'src', info.thumburl );
				}
			} );

			$container.removeClass( 'uploading' ).removeClass( 'error' );
			dirty = false;
		}

		function savePhoto( caption, token ) {
			var api = endPoint || M.getApiUrl();
			formData.append( 'token', token );
			formData.append( 'text', '== {{int:filedesc}} ==\n' + caption +'\n\n== {{int:license-header}} ==\n{{self|cc-by-sa-3.0}}' );

			showSpinner( $container );
			$container.addClass( 'uploading' );

			$.ajax( {
				// ios seems to ignore the cache parameter so sending r parameter
				url: api + '?action=upload&format=json&r=' + Math.random() + '&origin=' + M.getOrigin(),
				type: 'post',
				xhrFields: {
					'withCredentials': true
				},
				cache: false,
				contentType: false,
				processData: false,
				data: formData
			} ).done( function( data ) {
				var d, name;

				if ( data && data.upload ) {

					name = data.upload.filename || data.upload.warnings.duplicate[ '0' ];
					if ( saveWikiTextFlag ) {
						M.getToken( 'edit', function( tokenData ) {
							d = saveWikiText( name, caption, tokenData.tokens.edittoken );
							d.done( function() {
								displayPhoto( name );
							} );
						} );
					} else {
						displayPhoto( name );
					}
				} else {
					// do error
					$container.removeClass( 'uploading' );
					$container.addClass( 'error' );
					if ( data.error && data.error.info ) {
						$container.find( '.errormsg' ).text( data.error.info );
					}
					$container.find( '.camera' ).show();
					$container.find( '.editArea' ).hide();
					$container.find( '.thumbcaption' ).remove();
					dirty = false;
				}
			} );
		}

		M.getToken( 'edit', function( data ) {
			var token = data.tokens.edittoken;
			savePhoto( caption, token );
		}, endPoint );
	}

	function addPhotoUploader( $container, saveWikiTextFlag, msg ) {
		msg = msg || 'mobile-frontend-photo-upload';
		$container = $( '<div class="thumb photouploader">' ).prependTo( $container );
		var
			$editArea, $form, $img, $file, $license,
			$a,
			template = '<div class="camera">' +
				'<div class="errormsg">' + M.message( 'mobile-frontend-photo-upload-error' ) + '</div>' +
				'<form>' +
				'<p>' + M.message( msg ) + '</p>' +
				'<input class="photoupload" name="file" type="file">' +
				'</form>' +
				'</div>';

			$( template ).appendTo( $container );
			$form = $container.find( 'form' );

			$file = $form.find( 'input[type=file]' );
			function focusFilePicker() {
				window.scrollTo( $file[ 0 ] );
			}

			$file.on( 'change', function() {
				var file = this.files[ 0 ];
				showSpinner( $container );

				getDataUrl( file, function( url ) {
					$img.attr( 'src', url ); // FIXME: use thumbnail instead
				} );
				$container.find( '.editArea' ).show();
				$container.find( '.camera' ).hide();
			} ).attr( 'accept', 'image/*;' ); // must be set via attr otherwise cannot use camera on android

			$editArea = $( '<div class="editArea">' ).
				hide().appendTo( $container );
			$( '<div class="msg">' ).
				text( M.message( 'mobile-frontend-photo-upload-progress' ) ).
				appendTo( $editArea );

			$a = $( '<a>' ).appendTo( $editArea );
			$img = $( '<img>' ).
				attr( 'alt', M.message( 'mobile-frontend-image-loading' ) ).
				appendTo( $a );

			$( '<input type="text">' ).
				attr( 'placeholder', M.message( 'mobile-frontend-photo-caption-placeholder' ) ).
				appendTo( $editArea );

			$license = $( '<div class="license">' ).html( M.message( 'mobile-frontend-photo-license' ) ).appendTo( $editArea );
			$license.find( 'a' ).attr( 'target', '_blank' ); // FIXME: wikitext should be able to do this for us

			$( '<button class="cancel">' ).text( '✘' ).click( function() {
					$container.find( '.editArea' ).hide();
					$container.find( '.camera' ).show();
					focusFilePicker();
				} ).appendTo( $editArea );

			$( '<button class="confirm">' ).text( '✔' ).
				click( function() {
					var file = $container.find( 'input[type=file]' )[ 0 ],
						filename = generateFileName( file ),
						caption = $container.find( 'input[type=text]' ).val();

					save( filename, caption, $container, saveWikiTextFlag );
					$container.find( '.editArea input,button,.license' ).hide();
					focusFilePicker();

					// render caption
					$( '<div class="thumbcaption">' ).text( caption ).
						appendTo( $container );
				} ).appendTo( $editArea );
	}

	function articleNeedsPhoto( $container ) {
		return $container.find( '#content_0 .thumb img, .navbox, .infobox' ).length === 0;
	}

	function init() {
		if ( supported && articleNeedsPhoto( $( '#content' ) ) ) {
			addPhotoUploader( $( '#content_0' ), true );
		}
	}

	$( window ).on( 'mw-mf-page-loaded', init );
	return {
		addPhotoUploader: addPhotoUploader,
		articleNeedsPhoto: articleNeedsPhoto,
		isSupported: supported
	};
}() );

M.registerModule( 'photos', module );

}( mw.mobileFrontend, jQuery ) );
