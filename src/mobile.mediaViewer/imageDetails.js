const
	View = require( '../mobile.startup/View' ),
	Button = require( '../mobile.startup/Button' ),
	util = require( '../mobile.startup/util' );

/**
 * Image details bar
 *
 * @param {Object} props
 * @param {string} [props.additionalClassNames] Additional CSS classes to add to
 * the parent element
 * @param {string} [props.caption] A string shown as the caption
 * @param {string} [props.author] A string shown as the author
 * @param {Object} [props.licenseLink] An object containing href and text
 * properties shown as the license link
 * @param {Object} [props.detailsLink] An object containing an href property
 * shown as the details button link
 * @return {View}
 */
function imageDetails( props ) {
	props = util.extend( {
		additionalClassNames: '',
		caption: false,
		author: false,
		licenseLink: false,
		detailsLink: false
	}, props );

	const
		children = [],
		$license = util.parseHTML( '<p class="license"></p>' );

	if ( props.detailsLink ) {
		children.push(
			new Button( {
				label: mw.msg( 'mobile-frontend-media-details' ),
				additionalClassNames: 'button',
				progressive: true,
				href: props.detailsLink.href
			} ).$el
		);
	}

	if ( props.caption ) {
		const $caption = util.parseHTML( '<p class="truncated-text"></p>' );
		$caption.text( props.caption );

		children.push( $caption );
	}

	if ( props.author ) {
		$license.prepend( props.author + ' &bull; ' );
	}

	if ( props.licenseLink ) {
		$license
			.append( '<a></a>' )
			.find( 'a' )
			.text( props.licenseLink.text )
			.attr( 'href', props.licenseLink.href );
	}

	if ( props.author || props.licenseLink ) {
		children.push( $license );
	}

	return View.make( {
		className: 'image-details ' + props.additionalClassNames
	}, children );
}

module.exports = imageDetails;
