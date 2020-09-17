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
		node = node.cloneNode( true );
		// Ignore non-content nodes, TemplateStyles and coordinates
		$( node ).find( '.ve-ce-branchNode-inlineSlug, .ve-ce-focusableNode-invisible, style, span#coordinates' ).remove();
		if ( isNotEmptyNode( node ) ) {
			return false;
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
