/*global document, window, MobileFrontend, navigator, placeholder */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.feedback = (function() {
	var u = MobileFrontend.utils,
		form = document.getElementById( 'mf-feedback' );

	u( form ).bind( 'submit', function( ev ) {
		ev.preventDefault();
		var i, j, el, name, val,
			nodeLists, nodeList, data = {}, formValues = [];

		nodeLists = [].concat( form.getElementsByTagName( 'select' ) ).
			concat( form.getElementsByTagName( 'textarea' ) ).concat( form.getElementsByTagName( 'input' ) );
		for( i = 0; i < nodeLists.length; i++ ) {
			nodeList = nodeLists[ i ];
			for( j = 0; j < nodeList.length; j++ ) {
				formValues.push( nodeList[ j ] );
			}
		}

		for( i = 0; i < formValues.length; i++ ) {
			el = formValues[ i ];
			name = el.getAttribute('name');
			val = el.value;
			if( name ) {
				data[ name ] = val;
			}
		}

		function createMessage( container, msg, isError ) {
			var el = document.createElement( 'div' ),
				label = document.createTextNode( msg );
			el.setAttribute( 'id', 'mf-feedback-message' );
			u( el ).addClass( 'message' );
			if( isError ) {
				u( el ).addClass( 'error' );
			}
			el.appendChild( label );
			container.insertBefore( el, container.firstChild );
			window.location.hash = '#mf-feedback-message';
			return el;
		}
	
		u.ajax( {
			type: 'post',
			url: form.getAttribute( 'action' ),
			data: data,
			success: function( msg ) {
				// assumes a message is sent back in response text
				form.innerHTML = '';
				createMessage( form, msg );
			},
			error: function( xhr, status, error ) {
				var el = document.getElementById( 'mf-feedback-message' );
				u( el ).remove();
				createMessage( form, error, true );
			}
		} );
	});
	
}());
