/* global $ */
/**
 * Find first paragraph that has text content, i.e. paragraphs that are not empty.
 * Keep in sync with MoveLeadParagraphTransform::identifyLeadParagraph().
 *
 * @private
 * @param {jQuery} $body Where to search for paragraphs
 * @return {Node|null} The lead paragraph
 */
module.exports = function identifyLeadParagraph( $body ) {
	// Keep in sync with MoveLeadParagraphTransform::isNotEmptyNode()
	function isNotEmptyNode( node ) {
		// Ignore VE whitespace characters
		return !/^[\s↵➞]*$/.test( node.textContent );
	}

	// Keep in sync with MoveLeadParagraphTransform::isNonLeadParagraph()
	function isNonLeadParagraph( node ) {
		node = node.cloneNode( true );
		const $node = $( node );
		// The paragraph itself can be an invisible template (T293834)
		if ( $node.hasClass( 've-ce-focusableNode-invisible' ) ) {
			return true;
		}
		// Ignore non-content nodes, TemplateStyles and coordinates
		$node.find( '.ve-ce-branchNode-inlineSlug, .ve-ce-focusableNode-invisible, style, span#coordinates' ).remove();
		if ( isNotEmptyNode( node ) ) {
			return false;
		}
		return true;
	}

	const $paragraphs = $body.children( 'p' );
	for ( let i = 0; i < $paragraphs.length; i++ ) {
		const p = $paragraphs[ i ];
		if ( !isNonLeadParagraph( p ) ) {
			return p;
		}
	}
	return null;
};
