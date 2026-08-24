<?php

use MobileFrontend\Tests\Utils;
use MobileFrontend\Transforms\QuickFactsTransform;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\Element;

/**
 * @group MobileFrontend
 */
class QuickFactsTransformTest extends \MediaWikiUnitTestCase {

	private function parseBody( string $html ): Element {
		return Utils::createBody( Utils::wrapParserOutput( $html ) );
	}

	private const LEAD_WITH_INFOBOX = <<<HTML
		<section data-mw-section-id="0">
			<p>Lead paragraph.</p>
			<table class="infobox"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
		</section>
		<section data-mw-section-id="1">
			<div class="mw-heading mw-heading2"><h2 id="Definition">Definition</h2></div>
			<p>Body.</p>
		</section>
HTML;

	/**
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::apply
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::identifyInfoboxes
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::buildHeadingWrapper
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::buildContent
	 */
	public function testMovesInfoboxIntoQuickFactsSection() {
		$body = $this->parseBody( self::LEAD_WITH_INFOBOX );
		( new QuickFactsTransform( 'Quick facts' ) )->apply( $body );

		$section = DOMCompat::querySelector( $body, 'section.mf-quick-facts' );
		$this->assertNotNull( $section, 'A Quick facts section is created.' );

		// It's positioned immediately after the lead section.
		$previous = DOMCompat::getPreviousElementSibling( $section );
		$this->assertNotNull( $previous );
		$this->assertSame( '0', $previous->getAttribute( 'data-mw-section-id' ),
			'The Quick facts section follows the lead section.' );

		// It carries a Parsoid style heading wrapper with the localized label.
		$heading = DOMCompat::querySelector( $section, '.mw-heading.mw-heading2 > h2' );
		$this->assertNotNull( $heading );
		$this->assertSame( 'Quick facts', trim( $heading->textContent ) );

		// The infobox now lives inside the Quick facts content, not the lead.
		$this->assertNotNull(
			DOMCompat::querySelector( $section, '.mf-quick-facts__content > .infobox' ),
			'The infobox is wrapped in a collapsible content div.'
		);
		$lead = DOMCompat::querySelector( $body, 'section[data-mw-section-id="0"]' );
		$this->assertNull(
			DOMCompat::querySelector( $lead, '.infobox' ),
			'The infobox is removed from the lead section.'
		);
	}

	private const LEAD_WITH_WRAPPED_INFOBOX = <<<HTML
		<section data-mw-section-id="0">
			<p>Lead paragraph.</p>
			<div class="mw-stack">
				<table class="infobox"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
			</div>
		</section>
		<section data-mw-section-id="1">
			<div class="mw-heading mw-heading2"><h2 id="Definition">Definition</h2></div>
			<p>Body.</p>
		</section>
HTML;

	/**
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::apply
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::identifyInfoboxes
	 */
	public function testMovesWrapperContainingInfobox() {
		$body = $this->parseBody( self::LEAD_WITH_WRAPPED_INFOBOX );
		( new QuickFactsTransform( 'Quick facts' ) )->apply( $body );

		$section = DOMCompat::querySelector( $body, 'section.mf-quick-facts' );
		$this->assertNotNull( $section );

		// The whole wrapper, not just the bare infobox, moves into the content div.
		$content = DOMCompat::querySelector( $section, '.mf-quick-facts__content' );
		$this->assertNotNull( $content );
		$wrapper = DOMCompat::querySelector( $content, '.mw-stack' );
		$this->assertNotNull( $wrapper, 'The wrapping element moves along with the infobox.' );
		$this->assertNotNull( DOMCompat::querySelector( $wrapper, '.infobox' ) );

		// Nothing infobox related remains in the lead.
		$lead = DOMCompat::querySelector( $body, 'section[data-mw-section-id="0"]' );
		$this->assertNull( DOMCompat::querySelector( $lead, '.mw-stack' ) );
	}

	private const LEAD_WITH_TWO_INFOBOXES = <<<HTML
		<section data-mw-section-id="0">
			<p>Lead paragraph.</p>
			<table class="infobox" id="first"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
			<p>More lead text.</p>
			<table class="infobox" id="second"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
		</section>
		<section data-mw-section-id="1">
			<div class="mw-heading mw-heading2"><h2 id="Definition">Definition</h2></div>
			<p>Body.</p>
		</section>
HTML;

	/**
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::apply
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::identifyInfoboxes
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::buildContent
	 */
	public function testMovesEveryInfoboxInTheLead() {
		$body = $this->parseBody( self::LEAD_WITH_TWO_INFOBOXES );
		( new QuickFactsTransform( 'Quick facts' ) )->apply( $body );

		$content = DOMCompat::querySelector( $body, '.mf-quick-facts__content' );
		$this->assertNotNull( $content );

		$infoboxes = iterator_to_array( DOMCompat::querySelectorAll( $content, '.infobox' ) );
		$this->assertCount( 2, $infoboxes, 'Both infoboxes are moved into Quick facts.' );
		$this->assertSame( 'first', $infoboxes[0]->getAttribute( 'id' ),
			'Infoboxes keep their original document order.' );
		$this->assertSame( 'second', $infoboxes[1]->getAttribute( 'id' ) );

		$lead = DOMCompat::querySelector( $body, 'section[data-mw-section-id="0"]' );
		$this->assertNull( DOMCompat::querySelector( $lead, '.infobox' ),
			'No infobox remains in the lead.' );
	}

	private const LEAD_WITH_SHARED_WRAPPER = <<<HTML
		<section data-mw-section-id="0">
			<p>Lead paragraph.</p>
			<div class="mw-stack">
				<table class="infobox" id="first"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
				<table class="infobox" id="second"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
			</div>
		</section>
		<section data-mw-section-id="1">
			<div class="mw-heading mw-heading2"><h2 id="Definition">Definition</h2></div>
			<p>Body.</p>
		</section>
HTML;

	/**
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::apply
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::identifyInfoboxes
	 */
	public function testInfoboxesSharingAWrapperMoveOnce() {
		$body = $this->parseBody( self::LEAD_WITH_SHARED_WRAPPER );
		( new QuickFactsTransform( 'Quick facts' ) )->apply( $body );

		$content = DOMCompat::querySelector( $body, '.mf-quick-facts__content' );
		$this->assertNotNull( $content );

		// The shared wrapper moves once, not once per infobox inside it.
		$wrappers = iterator_to_array( DOMCompat::querySelectorAll( $content, '.mw-stack' ) );
		$this->assertCount( 1, $wrappers );
		$this->assertCount( 2, iterator_to_array( DOMCompat::querySelectorAll( $wrappers[0], '.infobox' ) ) );
	}

	private const INFOBOX_OUTSIDE_LEAD = <<<HTML
		<section data-mw-section-id="0">
			<p>Lead paragraph.</p>
			<table class="infobox" id="lead-infobox"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
		</section>
		<section data-mw-section-id="1">
			<div class="mw-heading mw-heading2"><h2 id="Definition">Definition</h2></div>
			<table class="infobox" id="later-infobox"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>
		</section>
HTML;

	/**
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::apply
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::identifyInfoboxes
	 */
	public function testInfoboxOutsideTheLeadIsUntouched() {
		$body = $this->parseBody( self::INFOBOX_OUTSIDE_LEAD );
		( new QuickFactsTransform( 'Quick facts' ) )->apply( $body );

		$content = DOMCompat::querySelector( $body, '.mf-quick-facts__content' );
		$this->assertNotNull( $content );
		$this->assertNotNull( DOMCompat::querySelector( $content, '#lead-infobox' ),
			'The lead infobox moves into Quick facts.' );

		$laterSection = DOMCompat::querySelector( $body, 'section[data-mw-section-id="1"]' );
		$this->assertNotNull( DOMCompat::querySelector( $laterSection, '#later-infobox' ),
			'An infobox outside the lead stays exactly where it was.' );
	}

	/**
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::apply
	 */
	public function testNoOpWhenNoInfobox() {
		$html = '<section data-mw-section-id="0"><p>Some text.</p></section>';
		$body = $this->parseBody( $html );
		( new QuickFactsTransform( 'Quick facts' ) )->apply( $body );

		$this->assertNull(
			DOMCompat::querySelector( $body, 'section.mf-quick-facts' ),
			'No Quick facts section is created without an infobox.'
		);
	}

	/**
	 * @covers \MobileFrontend\Transforms\QuickFactsTransform::apply
	 */
	public function testNoOpWhenNotParsoidOutput() {
		// Flat DOM, no <section data-mw-section-id> wrapper: not Parsoid output.
		$html = '<p>Lead paragraph.</p>' .
			'<table class="infobox"><tbody><tr><th>Fact</th><td>Value</td></tr></tbody></table>';
		$body = $this->parseBody( $html );
		( new QuickFactsTransform( 'Quick facts' ) )->apply( $body );

		$this->assertNull( DOMCompat::querySelector( $body, 'section.mf-quick-facts' ) );
		$this->assertNotNull( DOMCompat::querySelector( $body, '.infobox' ),
			'The infobox is left untouched.' );
	}
}
