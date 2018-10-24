var util = require( '../mobile.startup/util' ),
	View = require( '../mobile.startup/View' );

/**
 * A board of talk topics
 * @param {Section[]} sections
 * @return {View}
 */
function talkBoard( sections ) {
	var board,
		explanation = sections.length > 0 ?
			mw.msg( 'mobile-frontend-talk-explained' ) :
			mw.msg( 'mobile-frontend-talk-explained-empty' );

	board = new View( {
		className: 'talk-board'
	} );
	board.append( [
		util.parseHTML( '<p class="content-header">' ).text( explanation ),
		// FIXME: Substitute with a TopicTitleList (T173534)
		util.parseHTML( '<ul class="topic-title-list">' ).append(
			sections.map( function ( section ) {
				return util.parseHTML( '<li>' ).append(
					util.parseHTML( '<a>' )
						.attr( 'href', '#/talk/' + section.id )
						.text( section.line )
				);
			} )
		)
	] );
	return board;
}

module.exports = talkBoard;
