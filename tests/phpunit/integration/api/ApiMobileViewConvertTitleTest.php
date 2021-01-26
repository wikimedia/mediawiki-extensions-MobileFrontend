<?php

/**
 * @group Database
 * @group MobileFrontend
 * @group medium
 */
class ApiMobileViewConvertTitleTest extends ApiTestCase {

	/** @var string */
	private $simplifiedTitle = '天闻角川';
	/** @var string */
	private $traditionalTitle = '天聞角川';

	protected function setUp() : void {
		parent::setUp();
		$this->setUserLang( 'zh' );
		$this->setMwGlobals( 'wgLanguageCode', 'zh' );
		$this->editPage( $this->simplifiedTitle, 'foo',  'test page' );
	}

	/**
	 * @covers \MobileFrontend\Api\ApiMobileView::execute
	 */
	public function testRequestConverted() {
		$result = $this->doApiRequest( [
			'action' => 'mobileview',
			'page' => $this->traditionalTitle,
			'prop' => 'text',
			'sections' => 'all',
		] );

		$this->assertArrayHasKey( 'mobileview', $result[0] );
		$this->assertArrayHasKey( 'converted', $result[0]['mobileview'] );
		$convertedFrom = $result[0]['mobileview']['converted']['from'];
		$convertedTo = $result[0]['mobileview']['converted']['to'];
		$this->assertEquals( $convertedTo, $this->simplifiedTitle );
		$this->assertEquals( $convertedFrom, $this->traditionalTitle );
	}

	/**
	 * @covers \MobileFrontend\Api\ApiMobileView::execute
	 */
	public function testRequestNotConverted() {
		$result = $this->doApiRequest( [
			'action' => 'mobileview',
			'page' => $this->simplifiedTitle,
			'prop' => 'text',
			'sections' => 'all',
		] );

		$this->assertArrayHasKey( 'mobileview', $result[0] );
		$this->assertArrayNotHasKey( 'converted', $result[0]['mobileview'] );
	}
}
