MobileFrontend.settings = (function() {
	var u = MobileFrontend.utils,
		mobileTokenCookieName = 'mobiletoken';

	function saveMobileToken( mobileToken ) {
		var cookiePath = MobileFrontend.setting( 'useFormatCookiePath' );
		var mobileTokenCookieDomain = MobileFrontend.setting( 'useFormatCookieDomain' );
		MobileFrontend.banner.writeCookie( mobileTokenCookieName,
			mobileToken, 1, cookiePath, mobileTokenCookieDomain );
	}

	function readMobileToken() {
		var mobileToken = MobileFrontend.banner.readCookie( mobileTokenCookieName );
		return mobileToken;
	}

	function updateMobileToken( responseXml ) {
		var mobileviewElements = responseXml.getElementsByTagName( 'mobileview' );
		if ( mobileviewElements[0] ) {
			var mobileToken = mobileviewElements[0].getAttribute( 'mobiletoken' );
		}
		var imagetoggle = document.getElementById( 'imagetoggle' );
		if ( mobileToken && imagetoggle.href ) {
			imagetoggle.href = addCSRFToken( imagetoggle.href, 'mobiletoken', mobileToken );
			saveMobileToken( mobileToken );
		}
	}

	function updateQueryStringParameter( a, k, v ) {
		var re = new RegExp( "([?|&])" + k + "=.*?(&|$)", "i" ),
			separator = a.indexOf( '?' ) !== -1 ? "&" : "?";
		if ( a.match( re ) ) {
			return a.replace( re, '$1' + k + "=" + v + '$2' );
		} else {
			return a + separator + k + "=" + v;
		}
	}

	function addCSRFToken( link, name, value ) {
		return updateQueryStringParameter( link, name, value );
	}

	function init() {
		var mobileToken = readMobileToken(), imagetoggle, apiUrl = '/api.php';

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
			imagetoggle.href = addCSRFToken( imagetoggle.href, 'mobiletoken', mobileToken );
		}
	}
	init();

}());
