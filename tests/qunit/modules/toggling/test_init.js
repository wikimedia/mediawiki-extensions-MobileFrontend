( function ( M, $ ) {

	var sectionHtml = mw.template.get( 'mobile.toggling.tests', 'section.hogan' ).render(),
		settings = M.require( 'settings' ),
		browser = M.require( 'browser' ),
		toggle = M.require( 'toggle' );

	/**
	 * Mobile toggling
	 *
	 *
	 **/
	QUnit.module( 'MobileFrontend toggle.js: Mobile mode.', {
		setup: function () {
			this.$container = $( '<div>' ).html( sectionHtml );
			this.$section0 = this.$container.find( 'h2' ).eq( 0 );
			this.sandbox.stub( browser, 'isWideScreen' ).returns( false );
			toggle.enable( this.$container );
			toggle.toggle( this.$section0 );
		},
		teardown: function () {
			window.location.hash = '#';
			settings.remove( 'expandedSections', false );
		}
	} );

	QUnit.test( 'Toggle section', 5, function ( assert ) {
		var $section = this.$section0,
			$content = this.$container.find( '.collapsible-block' ).eq( 0 );

		assert.strictEqual( $section.hasClass( 'open-block' ), true, 'open-block class present' );
		toggle.toggle( $section );
		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content gets closed on a toggle' );
		assert.strictEqual( $section.hasClass( 'open-block' ), false, 'check section is closed' );

		// Perform second toggle
		toggle.toggle( $section );
		assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content reopened' );
		assert.strictEqual( $section.hasClass( 'open-block' ), true, 'check section has reopened' );
	} );

	QUnit.test( 'Clicking a hash link to reveal an already open section', 2, function ( assert ) {
		assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is open' );
		toggle.reveal( 'First_Section', this.$container );
		assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is still open' );
	} );

	QUnit.test( 'Reveal element', 2, function ( assert ) {
		toggle.reveal( 'First_Section' );
		assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 0 ).hasClass( 'open-block' ), true, 'check content is visible' );
		assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is open' );
	} );

	QUnit.test( 'Clicking hash links', 2, function ( assert ) {
		this.$container.find( '[href=#First_Section]' ).trigger( 'click' );
		assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 0 ).hasClass( 'open-block' ), true, 'check content is visible' );
		assert.strictEqual( this.$section0.hasClass( 'open-block' ), true, 'check section is open' );
	} );

	QUnit.test( 'Tap event toggles section', 2, function ( assert ) {
		var $content = this.$container.find( '.collapsible-block' ).eq( 1 );

		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

		this.$container.find( '#section_1' ).trigger( 'click' );

		assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is shown on a toggle' );
	} );

	QUnit.test( 'Verify aria attributes', 9, function ( assert ) {
		var $section = this.$container.find( '#section_1' ),
			$content = this.$container.find( '.collapsible-block' ).eq( 1 );

		// Test the initial state produced by the init function
		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );
		assert.strictEqual( $content.attr( 'aria-pressed' ), 'false', 'check aria-pressed is false at start' );
		assert.strictEqual( $content.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false at start' );

		// Test what the toggle() function gives us when hiding the section
		$section.trigger( 'click' );
		assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is visible after toggling' );
		assert.strictEqual( $content.attr( 'aria-pressed' ), 'true', 'check aria-pressed is true after toggling' );
		assert.strictEqual( $content.attr( 'aria-expanded' ), 'true', 'check aria-expanded is true after toggling' );

		// Test what the toggle() function gives us when showing the section
		$section.trigger( 'click' );
		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden after toggling' );
		assert.strictEqual( $content.attr( 'aria-pressed' ), 'false', 'check aria-pressed is false after toggling' );
		assert.strictEqual( $content.attr( 'aria-expanded' ), 'false', 'check aria-expanded is false after toggling' );
	} );

	/**
	 * Tablet toggling
	 *
	 *
	 **/
	QUnit.module( 'MobileFrontend toggle.js: tablet mode', {
		setup: function () {
			this.$container = $( '<div>' ).html( sectionHtml );
			this.sandbox.stub( browser, 'isWideScreen' ).returns( true );
			toggle.enable( this.$container );
		},
		teardown: function () {
			window.location.hash = '#';
			settings.remove( 'expandedSections', false );
		}
	} );

	QUnit.test( 'Open by default', 1, function ( assert ) {
		assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 1 ).hasClass( 'open-block' ),
			true, 'check section is visible at start' );
	} );

	/**
	 * Expand sections user setting
	 *
	 *
	 **/

	QUnit.module( 'MobileFrontend toggle.js: user setting', {
		setup: function () {
			settings.save( 'expandSections', 'true', true );
			this.$container = $( '<div>' ).html( sectionHtml );
			toggle.enable( this.$container );
		},
		teardown: function () {
			window.location.hash = '#';
			settings.save( 'expandSections', '', true );
			settings.remove( 'expandedSections', false );
		}
	} );

	QUnit.test( 'Open by default', 1, function ( assert ) {
		assert.strictEqual( this.$container.find( '.collapsible-block' ).eq( 1 ).hasClass( 'open-block' ), true, 'check section is visible at start' );
	} );

	/**
	 * Accessibility
	 *
	 *
	 **/

	QUnit.module( 'MobileFrontend toggle.js: accessibility', {
		setup: function () {
			this.$container = $( '<div>' ).html( sectionHtml );
			this.sandbox.stub( browser, 'isWideScreen' ).returns( false );
			toggle.enable( this.$container );
		},
		teardown: function () {
			window.location.hash = '#';
			settings.remove( 'expandSections', true );
			settings.remove( 'expandedSections', false );
		}
	} );

	QUnit.test( 'Pressing space/ enter toggles a heading', 3, function ( assert ) {
		var $section = this.$container.find( '#section_1' ),
			$content = this.$container.find( '.collapsible-block' ).eq( 1 ),
			ev = jQuery.Event( 'keypress' );

		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

		// Open the section with pressing space
		ev.which = 32;
		$section.trigger( ev );
		assert.strictEqual( $content.hasClass( 'open-block' ), true, 'check content is shown after pressing space' );

		// Enter should close the section again
		ev.which = 13;
		$section.trigger( ev );
		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden after pressing enter' );
	} );

	QUnit.test( 'Clicking a link within a heading isn\'t triggering a toggle', 2, function ( assert ) {
		var $section = $( '#section_1' ),
			$content = $( '.collapsible-block' ).eq( 1 );

		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is hidden at start' );

		$section.find( '> a' ).eq( 0 ).trigger( 'mouseup' );
		assert.strictEqual( $content.hasClass( 'open-block' ), false, 'check content is still being hidden after clicking on the link' );
	} );

	QUnit.module( 'MobileFrontend toggle.js: remember expanded sections', {
		setup: function () {
			this.sandbox.stub( mw.config, 'get' ).withArgs( 'wgMFCollapseSectionsByDefault' ).returns( true );
			this.sandbox.stub( browser, 'isWideScreen' ).returns( false );
			this.$container = $( '<div>' ).html( sectionHtml );
			toggle.enable( this.$container );
			this.$section = this.$container.find( 'h2' );
			this.headline = this.$section.find( 'span' ).attr( 'id' );
			this.pageTitle = toggle._currentPageTitle;
			this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		},
		teardown: function () {
			window.location.hash = '#';
			settings.remove( 'expandedSections', false );
			settings.remove( 'expandSections', true );
		}
	} );

	QUnit.test( 'Toggling a section stores its state.', 3, function ( assert ) {
		assert.strictEqual( $.isEmptyObject( this.expandedSections[ this.pageTitle ] ),
			true,
			'no user setting about an expanded section exists already'
		);

		toggle.toggle( this.$section );
		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( typeof this.expandedSections[ this.pageTitle ][ this.headline ],
			'number',
			'the just toggled section state has been saved'
		);

		toggle.toggle( this.$section );
		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( this.expandedSections[ this.pageTitle ][ this.headline ],
			undefined,
			'the just toggled section state has been removed'
		);
	} );

	QUnit.test( 'Check for and remove obsolete stored sections.', 2, function ( assert ) {
		this.expandedSections[ this.pageTitle ][ this.headline ] = ( new Date( 1990, 1, 1 ) ).getTime();
		settings.save( 'expandedSections',
			JSON.stringify( this.expandedSections )
		);
		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( typeof this.expandedSections[ this.pageTitle ][ this.headline ],
			'number',
			'manually created section state has been saved correctly'
		);

		toggle._cleanObsoleteStoredSections();
		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( this.expandedSections[ this.pageTitle ][ this.headline ],
			undefined,
			'section, whose store time is manually changed to an older date,' +
			'has been removed from storage correctly'
		);
	} );

	QUnit.test( 'Expanding already expanded section does not toggle it.', 5, function ( assert ) {
		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( $.isEmptyObject( this.expandedSections[ this.pageTitle ] ),
			true,
			'no expanded sections are stored in localStorage yet'
		);

		assert.strictEqual(
			this.$section.hasClass( 'open-block' ),
			false,
			'section does not have open-block class'
		);

		// manually toggle the second section
		toggle.toggle( this.$section );

		assert.strictEqual(
			this.$section.hasClass( 'open-block' ),
			true,
			'revealed section has open-block class'
		);

		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( typeof this.expandedSections[ this.pageTitle ][ this.headline ],
			'number',
			'manually revealed section state has been correctly saved in localStorage'
		);

		toggle._expandStoredSections( this.$container );

		assert.strictEqual(
			this.$section.hasClass( 'open-block' ),
			true,
			'already revealed section still has open-block class after expanding sections'
		);
	} );

	QUnit.module( 'MobileFrontend toggle.js: restore expanded sections', {
		setup: function () {
			this.sandbox.stub( mw.config, 'get' ).withArgs( 'wgMFCollapseSectionsByDefault' ).returns( true );
			this.sandbox.stub( browser, 'isWideScreen' ).returns( false );
			this.$container = $( '<div>' ).html( sectionHtml );
			// Restore expanded sections only works on headings that are also section headings
			this.$container.find( 'h2' ).addClass( 'section-heading' );
			this.$section = this.$container.find( 'h2' ).eq( 0 );
			this.headline = 'First_Section';
			this.pageTitle = toggle._currentPageTitle;
			this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		},
		teardown: function () {
			window.location.hash = '#';
			settings.remove( 'expandedSections', false );
			settings.remove( 'expandSections', true );
		}
	} );

	QUnit.test( 'Expand stored sections.', 5, function ( assert ) {
		assert.strictEqual( this.$section.hasClass( 'open-block' ), false, 'Section is collapsed.' );

		assert.strictEqual( $.isEmptyObject( this.expandedSections[ this.pageTitle ] ),
			true,
			'no user setting about an expanded section exists already'
		);

		// save a toggle state manually
		this.expandedSections[ this.pageTitle ][ this.headline ] = ( new Date() ).getTime();
		settings.save( 'expandedSections', JSON.stringify( this.expandedSections ), false );
		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( typeof this.expandedSections[ this.pageTitle ][ this.headline ],
			'number',
			'manually created section state has been saved correctly'
		);

		toggle.enable( this.$container );

		this.expandedSections = toggle._getExpandedSections( this.pageTitle );
		assert.strictEqual( typeof this.expandedSections[ this.pageTitle ][ this.headline ],
			'number',
			'manually created section state is still active after toggle.init()'
		);
		assert.strictEqual( this.$section.hasClass( 'open-block' ), true,
			'Saved section has been auto expanded.' );

	} );

}( mw.mobileFrontend, jQuery ) );
