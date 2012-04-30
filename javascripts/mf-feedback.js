/*global document, window, MobileFrontend, navigator, placeholder */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.feedback = (function() {
	var u = MobileFrontend.utils,
		form = document.getElementById( 'mf-feedback-form' );

	u( form ).bind( 'submit', function( ev ) {
		ev.preventDefault();
		var i, j, el, name, val, domCache = {},
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
				domCache[ name ] = el;
			}
		}

		function createMessage( container, msg, isError, id, child ) {
			var el = document.createElement( 'div' ),
				label = document.createTextNode( msg );
			id = id || 'mf-feedback-message';
			el.setAttribute( 'id', id );
			u( el ).addClass( 'message' );
			if( isError ) {
				u( el ).addClass( 'error' );
			}
			el.appendChild( label );
			container.insertBefore( el, child || container.firstChild );
			window.location.hash = '#' + id;
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
			error: function( xhr, status, errors ) {
				var i, name, error, id, el;
				// TODO: fallback for browsers that do not support JSON
				// see http://www.browserscope.org/?category=security&v=top-m
				if( JSON ) {
					errors = JSON.parse( errors );
					for( i = 1; i < errors.length; i++ ) {
						name = errors[i][0];
						error = errors[i][1];
						if( domCache[ name ] ) {
							id = 'mf-feedback-message-' + name;
							el = document.getElementById( id );
							u( el ).remove();
							u( domCache[ name ] ).addClass( 'error' );
							createMessage( form, error, true, id, domCache[ name ] );
						}
					}
					// do generic error
					el = document.getElementById( 'mf-feedback-message' );
					u( el ).remove();
					createMessage( form, errors[0], true );
				}
			}
		} );
	});
	
}());
