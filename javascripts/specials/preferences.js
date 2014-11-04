jQuery( function ( $ ) {
	var $header, $tabHeadings, $tabs, $activeBtn, val,
		$form = $( '#mw-prefs-form' ),
		action = $form.attr( 'action' ),
		// Load from user preference if available
		hash = window.location.hash;

	$header = $( '<div class="content-header">' ).insertBefore( '#content' );
	$tabHeadings = $( '<ul class="button-bar">' ).appendTo( $header );
	$tabs = $( '#preferences > fieldset' );

	function handler( ev ) {
		var $this = $( this ),
			hash = $this.attr( 'href' );
		// Ensure that the browser does not jump to the section in the DOM
		ev.preventDefault();
		// However make sure the address bar changes
		window.location.hash = hash;
		$tabs.hide();
		$tabHeadings.find( '.active' ).removeClass( 'active' );
		$this.parent().addClass( 'active' );
		$this.data( 'tab' ).show();
		// Ensure on a save the hash is passed.
		$form.attr( 'action', action + hash );
	}

	$tabs.each( function () {
		var $this = $( this ),
			legend = $this.find( 'legend' ).eq( 0 ),
			$li = $( '<li>' ).appendTo( $tabHeadings ),
			id = $this.attr( 'id' );

		$( '<a class="button">' ).attr( 'href', '#' + id )
			.data( 'tab', $this ).text( legend.text() )
			.on( 'click', handler ).appendTo( $li );
	} );
	$tabs.hide();

	// Preserve active tab when switching from another skin to Minerva
	// FIXME: [Core] this is a terrible abuse of the web.
	if ( !hash && window.sessionStorage ) {
		val = window.sessionStorage.getItem( 'mediawikiPreferencesTab' );
		if ( val ) {
			hash = '#mw-prefsection-' + val;
		}
	}

	$activeBtn = $tabHeadings.find( '[href="' + hash + '"]' );
	if ( $activeBtn.length === 0 ) {
		// click the first tab button
		$tabHeadings.find( '.button' ).eq( 0 ).trigger( 'click' );
	} else {
		$activeBtn.trigger( 'click' );
	}
} );
