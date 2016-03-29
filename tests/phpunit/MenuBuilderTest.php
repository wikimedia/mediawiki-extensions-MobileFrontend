<?php

namespace Tests\MobileFrontend;

use MobileFrontend\MenuBuilder;

class MenuTest extends \PHPUnit_Framework_TestCase {
	private $homeComponent = array(
		'text' => 'Home',
		'href' => '/Main_page',
		'class' => 'mw-ui-icon mw-ui-icon-before mw-ui-icon-home',
		'data-event-name' => 'home',
	);

	private $nearbyComponent = array(
		'text' => 'Nearby',
		'href' => '/wiki/Special:Nearby',
		'class' => 'mw-ui-icon mw-ui-icon-before mw-ui-icon-nearby',
	);

	/**
	 * @covers MenuBuilder::getEntries
	 */
	public function test_it_shouldnt_have_entries_by_default() {
		$menu = new MenuBuilder();

		$this->assertEmpty( $menu->getEntries() );
	}

	/**
	 * @covers MenuBuilder::insert
	 * @covers MenuEntry::addComponent
	 * @covers MenuBuilder::getEntries
	 */
	public function test_inserting_an_entry() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' )
			->addComponent(
				$this->homeComponent['text'],
				$this->homeComponent['href'],
				$this->homeComponent['class'],
				array(
					'data-event-name' => $this->homeComponent['data-event-name']
				)
			);

		$expectedEntries = array(
			array(
				'name' => 'home',
				'components' => array( $this->homeComponent ),
			),
		);

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}

	/**
	 * @covers MenuBuilder::insert
	 * @covers MenuEntry::addComponent
	 * @covers MenuBuilder::getEntries
	 */
	public function test_inserting_an_entry_after_another() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' )
			->addComponent(
				$this->homeComponent['text'],
				$this->homeComponent['href'],
				$this->homeComponent['class'],
				array(
					'data-event-name' => $this->homeComponent['data-event-name']
				)
			);
		$menu->insert( 'another_home' )
			->addComponent(
				$this->homeComponent['text'],
				$this->homeComponent['href'],
				$this->homeComponent['class'],
				array(
					'data-event-name' => $this->homeComponent['data-event-name']
				)
			);
		$menu->insertAfter( 'home', 'nearby' )
			->addComponent(
				$this->nearbyComponent['text'],
				$this->nearbyComponent['href'],
				$this->nearbyComponent['class']
			);

		$expectedEntries = array(
			array(
				'name' => 'home',
				'components' => array( $this->homeComponent ),
			),
			array(
				'name' => 'nearby',
				'components' => array( $this->nearbyComponent ),
			),
			array(
				'name' => 'another_home',
				'components' => array( $this->homeComponent ),
			),
		);

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}

	/**
	 * @expectedException DomainException
	 * @expectedExceptionMessage The "home" entry doesn't exist.
	 * @covers MenuBuilder::insertAfter
	 * @covers MenuEntry::addComponent
	 */
	public function test_inserting_an_entry_after_that_doesnt_exist() {
		$menu = new MenuBuilder();
		$menu->insertAfter( 'home', 'nearby' )
			->addComponent(
				$this->nearbyComponent['text'],
				$this->nearbyComponent['href'],
				$this->nearbyComponent['class']
			);
	}

	/**
	 * @expectedException DomainException
	 * @expectedExceptionMessage The "home" entry already exists.
	 * @covers MenuBuilder::insert
	 */
	public function test_inserting_an_entry_with_an_existing_name() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' );
		$menu->insert( 'home' );
	}

	/**
	 * @expectedException DomainException
	 * @expectedExceptionMessage The "home" entry already exists.
	 * @covers MenuBuilder::insert
	 */
	public function test_inserting_an_entry_with_an_existing_name_after() {
		$menu = new MenuBuilder();
		$menu->insert( 'home' );
		$menu->insertAfter( 'home', 'home' );
	}

	/**
	 * @covers MenuBuilder::insert
	 * @covers MenuEntry::addComponent
	 * @covers MenuBuilder::getEntries
	 */
	public function test_inserting_an_entry_with_multiple_components() {
		$authLoginComponent = array(
			'text' => 'Phuedx (WMF)',
			'href' => '/wiki/User:Phuedx_(WMF)',
			'class' =>
				'mw-ui-icon mw-ui-icon-before mw-ui-icon-profile truncated-text primary-action',
		);
		$authLogoutComponent = array(
			'text' => 'Logout',
			'href' => '/wiki/Special:UserLogout',
			'class' =>
				'mw-ui-icon mw-ui-icon-element secondary-logout secondary-action truncated-text',
		);

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

		$expectedEntries = array(
			array(
				'name' => 'auth',
				'components' => array(
					$authLoginComponent,
					$authLogoutComponent
				),
			),
		);

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}

	/**
	 * @covers MenuBuilder::insert
	 * @covers MenuEntry::addComponent
	 * @covers MenuBuilder::getEntries
	 */
	public function test_inserting_a_javascript_only_entry() {
		$menu = new MenuBuilder();
		$menu->insert( 'nearby', $isJSOnly = true )
			->addComponent(
				$this->nearbyComponent['text'],
				$this->nearbyComponent['href'],
				$this->nearbyComponent['class']
			);

		$expectedEntries = array(
			array(
				'name' => 'nearby',
				'components' => array( $this->nearbyComponent ),
				'class' => 'jsonly'
			),
		);

		$this->assertEquals( $expectedEntries, $menu->getEntries() );
	}
}
