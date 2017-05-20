<?php

namespace Tests\MediaWiki\Minerva;

use MediaWiki\Minerva\MenuBuilder;
use MediaWiki\Minerva\MenuEntry;

/**
 * @group MobileFrontend
 */
class MenuTest extends \PHPUnit_Framework_TestCase {
	private $homeComponent = [
		'text' => 'Home',
		'href' => '/Main_page',
		'class' => 'mw-ui-icon mw-ui-icon-before mw-ui-icon-home',
		'data-event-name' => 'home',
	];

	private $nearbyComponent = [
		'text' => 'Nearby',
		'href' => '/wiki/Special:Nearby',
		'class' => 'mw-ui-icon mw-ui-icon-before mw-ui-icon-nearby',
	];

	/**
	 * @covers \MediaWiki\Minerva\MenuBuilder::getEntries
	 */
	public function testItShouldntHaveEntriesByDefault() {
		$menu = new MenuBuilder();

		$this->assertEmpty( $menu->getEntries() );
	}

	/**
	 * @covers \MediaWiki\Minerva\MenuBuilder::insert
	 * @covers \MediaWiki\Minerva\MenuBuilder::search
	 * @covers \MediaWiki\Minerva\MenuBuilder::getEntries
	 * @covers \MediaWiki\Minerva\MenuEntry::addComponent
	 */
	public function testInsertingAnEntry() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' )
			->addComponent(
				$this->homeComponent['text'],
				$this->homeComponent['href'],
				$this->homeComponent['class'],
				[
					'data-event-name' => $this->homeComponent['data-event-name']
				]
			);

		$expectedEntries = [
			[
				'name' => 'home',
				'components' => [ $this->homeComponent ],
			],
		];

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}

	/**
	 * @covers \MediaWiki\Minerva\MenuBuilder::insert
	 * @covers \MediaWiki\Minerva\MenuBuilder::search
	 * @covers \MediaWiki\Minerva\MenuBuilder::getEntries
	 * @covers \MediaWiki\Minerva\MenuEntry::addComponent
	 */
	public function testInsertingAnEntryAfterAnother() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' )
			->addComponent(
				$this->homeComponent['text'],
				$this->homeComponent['href'],
				$this->homeComponent['class'],
				[
					'data-event-name' => $this->homeComponent['data-event-name']
				]
			);
		$menu->insert( 'another_home' )
			->addComponent(
				$this->homeComponent['text'],
				$this->homeComponent['href'],
				$this->homeComponent['class'],
				[
					'data-event-name' => $this->homeComponent['data-event-name']
				]
			);
		$menu->insertAfter( 'home', 'nearby' )
			->addComponent(
				$this->nearbyComponent['text'],
				$this->nearbyComponent['href'],
				$this->nearbyComponent['class']
			);

		$expectedEntries = [
			[
				'name' => 'home',
				'components' => [ $this->homeComponent ],
			],
			[
				'name' => 'nearby',
				'components' => [ $this->nearbyComponent ],
			],
			[
				'name' => 'another_home',
				'components' => [ $this->homeComponent ],
			],
		];

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}

	/**
	 * @expectedException \DomainException
	 * @expectedExceptionMessage The "home" entry doesn't exist.
	 * @covers \MediaWiki\Minerva\MenuBuilder::insertAfter
	 * @covers \MediaWiki\Minerva\MenuBuilder::search
	 * @covers \MediaWiki\Minerva\MenuEntry::addComponent
	 */
	public function testInsertAfterWhenTargetEntryDoesntExist() {
		$menu = new MenuBuilder();
		$menu->insertAfter( 'home', 'nearby' )
			->addComponent(
				$this->nearbyComponent['text'],
				$this->nearbyComponent['href'],
				$this->nearbyComponent['class']
			);
	}

	/**
	 * @expectedException \DomainException
	 * @expectedExceptionMessage The "car" entry already exists.
	 * @covers \MediaWiki\Minerva\MenuBuilder::insertAfter
	 */
	public function testInsertAfterWithAnEntryWithAnExistingName() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' );
		$menu->insert( 'car' );
		$menu->insertAfter( 'home', 'car' );
	}

	/**
	 * @expectedException \DomainException
	 * @expectedExceptionMessage The "home" entry already exists.
	 * @covers \MediaWiki\Minerva\MenuBuilder::insert
	 */
	public function testInsertingAnEntryWithAnExistingName() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' );
		$menu->insert( 'home' );
	}

	/**
	 * @covers \MediaWiki\Minerva\MenuBuilder::insert
	 * @covers \MediaWiki\Minerva\MenuBuilder::insertAfter
	 */
	public function testInsertingAnEntryAfterAnotherOne() {
		$menu = new MenuBuilder();
		$menu->insert( 'first' );
		$menu->insert( 'last' );
		$menu->insertAfter( 'first', 'middle' );
		$items = $menu->getEntries();
		$this->assertCount( 3, $items );
		$this->assertSame( 'first', $items[0]['name'] );
		$this->assertSame( 'middle', $items[1]['name'] );
		$this->assertSame( 'last', $items[2]['name'] );
	}

	/**
	 * @covers \MediaWiki\Minerva\MenuBuilder::insert
	 * @covers \MediaWiki\Minerva\MenuBuilder::getEntries
	 * @covers \MediaWiki\Minerva\MenuEntry::addComponent
	 */
	public function testinsertingAnEntryWithMultipleComponents() {
		$authLoginComponent = [
			'text' => 'Phuedx (WMF)',
			'href' => '/wiki/User:Phuedx_(WMF)',
			'class' =>
				'mw-ui-icon mw-ui-icon-before mw-ui-icon-profile truncated-text primary-action',
		];
		$authLogoutComponent = [
			'text' => 'Logout',
			'href' => '/wiki/Special:UserLogout',
			'class' =>
				'mw-ui-icon mw-ui-icon-element secondary-logout secondary-action truncated-text',
		];

		$menu = new MenuBuilder();
		$menu->insert( 'auth' )
			->addComponent(
				$authLoginComponent['text'],
				$authLoginComponent['href'],
				$authLoginComponent['class']
			)
			->addComponent(
				$authLogoutComponent['text'],
				$authLogoutComponent['href'],
				$authLogoutComponent['class']
			);

		$expectedEntries = [
			[
				'name' => 'auth',
				'components' => [
					$authLoginComponent,
					$authLogoutComponent
				],
			],
		];

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}

	/**
	 * @covers \MediaWiki\Minerva\MenuBuilder::insert
	 * @covers \MediaWiki\Minerva\MenuBuilder::getEntries
	 * @covers \MediaWiki\Minerva\MenuEntry::addComponent
	 */
	public function testInsertingAJavascriptOnlyEntry() {
		$menu = new MenuBuilder();
		$menu->insert( 'nearby', $isJSOnly = true )
			->addComponent(
				$this->nearbyComponent['text'],
				$this->nearbyComponent['href'],
				$this->nearbyComponent['class']
			);

		$expectedEntries = [
			[
				'name' => 'nearby',
				'components' => [ $this->nearbyComponent ],
				'class' => 'jsonly'
			],
		];

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}

	/**
	 * @covers \MediaWiki\Minerva\MenuEntry::__construct
	 * @covers \MediaWiki\Minerva\MenuEntry::getName()
	 * @covers \MediaWiki\Minerva\MenuEntry::isJSOnly()
	 * @covers \MediaWiki\Minerva\MenuEntry::getComponents()
	 */
	public function testMenuEntryConstruction() {
		$name = 'test';
		$isJSOnly = true;
		$entry = new MenuEntry( $name, $isJSOnly );
		$this->assertSame( $name, $entry->getName() );
		$this->assertSame( $isJSOnly, $entry->isJSOnly() );
		$this->assertSame( [], $entry->getComponents() );
	}
}
