/*global document, window, mw, navigator, jQuery, FileReader, FormData */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M,  $ ) {

var dirty, module;
$( function() {

	function confirmExit() {
		if ( dirty ) {
			return M.message( 'mobile-frontend-saving-exit-page' );
		}
	}

	window.onbeforeunload = confirmExit;
} );

module = (function() {
	var supported = typeof FileReader !== 'undefined' && M.isLoggedIn() && typeof FormData !== 'undefined',
		endPoint = M.setting( 'photo-upload-endpoint' ),
		spinnerImg = M.setting( 'ajaxLoader' );

	function generateFileName( file ) {
		var name = 'Lead_Photo_For_' + M.setting( 'title' ) + Math.random(),
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

	function save( filename, caption, $container ) {
		var $img = $container.find( 'img' ),
			src = $img.attr( 'src' ),
			$form = $container.find( 'form' ),
			formData = new FormData();
		formData.append( 'filename', filename );
		formData.append( 'comment', 'Added photo for use on article [Via Mobile]' );
		formData.append( 'file', $form.find( 'input[type=file]' )[ 0 ].files[ 0 ] );
		dirty = true;

		function saveWikiText( image, caption, token ) {
			$.ajax( {
				url: M.getApiUrl(),
				type: 'POST',
				data: {
					format: 'json',
					action: 'edit',
					title: M.setting( 'title' ),
					token: token,
					comment: 'Added photo to article [Via Mobile]',
					prependtext: '[[File:' + image.filename + '|thumbnail|' + caption + ']]\n\n'
				},
				success: function() {
					$img.attr( 'src', image.imageinfo.url );
					$container.removeClass( 'uploading' ).removeClass( 'error' );
					dirty = false;
				}
			} );
		}

		function savePhoto( caption, token ) {
			formData.append( 'token', token );

			// set spinner
			$img.attr( 'src', spinnerImg );
			$container.addClass( 'uploading' );

			$.ajax( {
				// ios seems to ignore the cache parameter so sending r parameter
				url: endPoint + M.getApiUrl() + '?action=upload&format=json&r=' + Math.random(),
				type: 'post',
				cache: false,
				contentType: false,
				processData: false,
				data: formData
			} ).done( function( data ) {
				if ( data && data.upload ) {
					saveWikiText( data.upload, caption, token );
				} else {
					// do error
					$container.removeClass( 'uploading' );
					$container.addClass( 'error' );
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
		} );
	}

	function addPhotoUploader( container ) {
		var $container = $( '<div class="thumb photouploader">' ).prependTo( container ),
			$editArea, $form, $img, $file,
			template = '<div class="camera">' +
				'<div class="errormsg">' + M.message( 'mobile-frontend-photo-upload-error' ) + '</div>' +
				'<form>' +
				'<p>' + M.message( 'mobile-frontend-photo-upload' ) + '</p>' +
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
				$img.attr( 'src', spinnerImg );

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

			$img = $( '<img>' ).
				attr( 'alt', M.message( 'mobile-frontend-image-loading' ) ).
				attr( 'src', spinnerImg ).
				appendTo( $editArea );

			$( '<input type="text">' ).
				attr( 'placeholder', M.message( 'mobile-frontend-photo-caption-placeholder' ) ).
				appendTo( $editArea );

			$( '<button class="red">' ).text( '✘' ).click( function() {
					$container.find( '.editArea' ).hide();
					$container.find( '.camera' ).show();
					focusFilePicker();
				} ).appendTo( $editArea );

			$( '<button class="green">' ).text( '✔' ).
				click( function() {
					var file = $container.find( 'input[type=file]' )[ 0 ],
						filename = generateFileName( file ),
						caption = $container.find( 'input[type=text]' ).val();

					save( filename, caption, $container );
					$container.find( '.editArea input,button' ).hide();
					focusFilePicker();

					// render caption
					$( '<div class="thumbcaption">' ).text( caption ).
						appendTo( $container );
				} ).appendTo( $editArea );
	}

	function init( ev, container ) {
		var lead = $( '#content_0' )[ 0 ];
		if ( $( lead ).find( 'img' ).length === 0 && supported ) {
			addPhotoUploader( lead );
		}
	}

	$( window ).on( 'mw-mf-page-loaded', init );
}() );

M.registerModule( 'photos', module );

}( mw.mobileFrontend, jQuery ) );
