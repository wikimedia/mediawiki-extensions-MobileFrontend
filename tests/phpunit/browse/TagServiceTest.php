<?php

namespace Tests\MobileFrontend\Browse;

use PHPUnit_Framework_TestCase;
use MobileFrontend\Browse\TagService;
use TitleValue;
use Title;

class StubTitle extends Title {
	private $mParentCategories;

	public function __construct( $namespace, $parentCategories = array() ) {
		$this->mNamespace = $namespace;
		$this->mParentCategories = $parentCategories;
	}

	public function getParentCategories() {
		return $this->mParentCategories;
	}
}

class TagServiceTest extends PHPUnit_Framework_TestCase {
	private $tagService;

	public function setUp() {
		parent::setUp();

		$this->tags = array(
			'Category:Castles in Bavaria' => 'Castles in Bavaria',
			'Category:Landmarks in Germany' => 'Landmarks in Germany',
		);
		$this->tagService = new TagService( $this->tags );

	}

	public function test_a_title_outside_of_the_main_namespace_shouldnt_have_tags() {
		$title = new StubTitle( NS_TALK );

		$this->assertEmpty( $this->tagService->getTags( $title ) );
	}

	public function test_a_title_with_no_categories_shouldnt_have_tags() {
		$title = new StubTitle( NS_MAIN );

		$this->assertEquals( array(), $this->tagService->getTags( $title ) );
	}

	public function test_a_title_with_matching_categories_should_have_tags() {
		$title = new StubTitle( NS_MAIN, array(
			'Category:English post-rock groups' => 'English post-rock groups',
			'Category:Castles in Bavaria' => 'Castles in Bavaria',
		) );

		$this->assertEquals(
			array( 'Castles in Bavaria' ),
			$this->tagService->getTags( $title )
		);
	}
}
