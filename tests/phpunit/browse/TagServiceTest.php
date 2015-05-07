<?php

namespace Tests\MobileFrontend\Browse;

use PHPUnit_Framework_TestCase;
use MobileFrontend\Browse\TagService;
use TitleValue;
use Title;

class TagServiceTest extends PHPUnit_Framework_TestCase {
	private $tagService;

	public function setUp() {
		parent::setUp();

		$this->tags = array(
			'landmarks in Germany' => array(
				'Aachen Cathedral',
			),
			'castles in Bavaria' => array(
				'Affing House',
			),
		);
		$this->tagService = new TagService( $this->tags );

	}

	public function test_a_title_outside_of_the_main_namespace_shouldnt_have_tags() {
		$title = Title::newFromText( 'Maybeshewill', NS_TALK );

		$this->assertEmpty( $this->tagService->getTags( $title ) );
	}

	public function test_a_title_with_matching_categories_should_have_tags() {
		$title = Title::newFromText( 'Affing House' );

		$this->assertEquals(
			array( 'castles in Bavaria' ),
			$this->tagService->getTags( $title )
		);
	}

	public function test_a_title_that_doesnt_match_shouldnt_have_tags() {
		$title = Title::newFromText( 'Maybeshewill' );

		$this->assertEquals( array(), $this->tagService->getTags( $title ) );
	}

	public function test_a_tag_that_doesnt_exist_shouldnt_have_titles() {
		$this->assertEquals( false, $this->tagService->getTitlesForTag( '' ) );
	}

	public function test_a_tag_that_exists_has_titles() {
		$titles = $this->tagService->getTitlesForTag( 'castles in Bavaria' );

		$this->assertEquals( 1, count( $titles ) );
		$this->assertEquals( 'Affing House', $titles[0]->getText() );
	}
}
