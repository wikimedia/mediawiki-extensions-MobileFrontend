jQuery( function( $ ) {
var $header, $tabHeadings, $tabs, hash = window.location.hash, $activeBtn;

$header = $( '<div class="header">' ).insertBefore( '#content' );
$tabHeadings = $( '<ul class="button-bar">' ).appendTo( $header );
$tabs = $( '#preferences > fieldset' );

function handler() {
	var $this = $( this );
	$tabs.hide();
	$tabHeadings.find( '.active' ).removeClass( 'active' );
	$this.parent().addClass( 'active' );
	$this.data( 'tab' ).show();
}

$tabs.each( function( i ) {
	var $this = $( this ),
		legend = $this.find( 'legend' ).eq( 0 ),
		$li = $( '<li>' ).appendTo( $tabHeadings ),
		id = 'pref' + i;

	$( '<a class="button">' ).attr( 'href', '#' + id ).
		data( 'tab', $this ).text( legend.text() ).
		on( 'click', handler ).appendTo( $li );
} );
$tabs.hide();

$activeBtn = $tabHeadings.find( '[href="' + hash + '"]' );
if ( $activeBtn.length === 0 ) {
	$tabHeadings.find( '[href="#pref0"]' ).trigger( 'click' );
} else {
	$activeBtn.trigger( 'click' );
}
} );
