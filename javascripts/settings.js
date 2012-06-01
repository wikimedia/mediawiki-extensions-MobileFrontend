/*global document, window, MobileFrontend */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.settings = (function() {
	var u = MobileFrontend.utils,
		mobileTokenCookieName = 'mobiletoken';

	function saveMobileToken( mobileToken ) {
		var cookiePath = MobileFrontend.setting( 'useFormatCookiePath' ),
			mobileTokenCookieDomain = MobileFrontend.setting( 'useFormatCookieDomain' );
		MobileFrontend.banner.writeCookie( mobileTokenCookieName,
			mobileToken, 1, cookiePath, mobileTokenCookieDomain );
	}

	function updateQueryStringParameter( a, k, v ) {
		var re = new RegExp( "([?|&])" + k + "=.*?(&|$)", "i" ),
			rtn,
			separator = a.indexOf( '?' ) !== -1 ? "&" : "?";
		if ( a.match( re ) ) {
			rtn = a.replace( re, '$1' + k + "=" + v + '$2' );
		} else {
			rtn = a + separator + k + "=" + v;
		}
		return rtn;
	}

	function addCSRFToken( link, name, value ) {
		return updateQueryStringParameter( link, name, value );
	}

	function readMobileToken() {
		var mobileToken = MobileFrontend.banner.readCookie( mobileTokenCookieName );
		return mobileToken;
	}

	function updateMobileToken( responseXml ) {
		var mobileviewElements = responseXml.getElementsByTagName( 'mobileview' ),
			imagetoggle, mobileToken;
		if ( mobileviewElements[0] ) {
			mobileToken = mobileviewElements[0].getAttribute( 'mobiletoken' );
		}
		imagetoggle = document.getElementById( 'imagetoggle' );
		if ( mobileToken && imagetoggle.href ) {
			imagetoggle.setAttribute( 'href',
				addCSRFToken( imagetoggle.href, 'mobiletoken', mobileToken ) );
			saveMobileToken( mobileToken );
		}
	}

	function enhanceCheckboxes() {
	u( document.body ).addClass( 'mw-mf-checkboxes' );
		var inputs = document.getElementsByTagName( 'input' ), i, el, special;
		function clickChkBox() {
			var parent = this,
				box = parent.getElementsByTagName( 'input' )[ 0 ];

			if( !u( parent ).hasClass( 'checked' ) ) {
				u( parent ).addClass( 'checked' );
				box.checked = true;
			} else {
				u( parent ).removeClass( 'checked' );
				box.checked = false;
			}
		}
		for( i = 0; i < inputs.length; i++ ) {
			el = inputs[i];
			special = u( el.parentNode ).hasClass( 'mw-mf-checkbox-css3' );
			if( el.getAttribute( 'type' ) === 'checkbox' && special ) {
				u( el.parentNode ).bind( 'click', clickChkBox );
				if( el.checked ) {
					u( el.parentNode ).addClass( 'checked ');
				}
			}
		}
	}

	function init() {
		var mobileToken = readMobileToken(), imagetoggle, apiUrl = '/api.php',
			url;

		if ( !mobileToken ) {
			apiUrl = MobileFrontend.setting( 'scriptPath' ) + apiUrl;
			url = apiUrl + '?action=mobileview&page=mobiletoken&override=1&format=xml';
			u.ajax( { url: url,
				success: function( xml ) {
					updateMobileToken( xml );
				}
				} );
		} else {
			imagetoggle = document.getElementById( 'imagetoggle' );
			imagetoggle.setAttribute( 'href', addCSRFToken( imagetoggle.href, 'mobiletoken', mobileToken ) );
		}
		enhanceCheckboxes();
	}
	init();
}());
