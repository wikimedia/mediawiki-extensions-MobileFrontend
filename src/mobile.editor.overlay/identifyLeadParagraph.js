/* global $ */
/**
 * Find first paragraph that has text content, i.e. paragraphs that are not empty.
 * Keep in sync with MoveLeadParagraphTransform::identifyLeadParagraph().
 *
 * @param {jQuery} $body Where to search for paragraphs
 * @return {Node|null} The lead paragraph
 */
module.exports = function identifyLeadParagraph( $body ) {
	var $paragraphs, i, node;

	// Keep in sync with MoveLeadParagraphTransform::isNotEmptyNode()
	function isNotEmptyNode( node ) {
		// Ignore VE whitespace characters
		return !/^[\s↵➞]*$/.test( node.textContent );
	}

	// Keep in sync with MoveLeadParagraphTransform::isNonLeadParagraph()
	function isNonLeadParagraph( node ) {
		var $coords;
		node = node.cloneNode( true );
		// Ignore non-content nodes
		$( node ).find( '.ve-ce-branchNode-inlineSlug, .ve-ce-focusableNode-invisible' ).remove();
		if ( isNotEmptyNode( node ) ) {
			$coords = $( node ).find( 'span#coordinates' );
			if ( !$coords.length ) {
				return false;
			}
			if ( node.textContent ) {
				return node.textContent === $coords[ 0 ].textContent;
			}
		}
		return true;
	}

	$paragraphs = $body.children( 'p' );
	for ( i = 0; i < $paragraphs.length; i++ ) {
		node = $paragraphs[ i ];
		if ( !isNonLeadParagraph( node ) ) {
			return node;
		}
	}
	return null;
};
