<?php

use Wikimedia\Rdbms\FakeResultWrapper;

/**
 * @group MobileFrontend
 */
class SpecialMobileWatchlistTest extends MediaWikiTestCase {
	/**
	 * @covers SpecialMobileWatchlist::addWatchlistHTML
	 * @dataProvider provideAddWatchlistHTML
	 */
	public function testAddWatchlistHTML( $results, $expected, $msg ) {
		$context = new DerivativeContext( RequestContext::getMain() );
		$context->setTitle( Title::newFromText( 'Special:Watchlist' ) );
		$wl = new SpecialMobileWatchlist();
		$wl->setContext( $context );
		$wl->addWatchlistHTML( $results, new User(), SpecialMobileWatchlist::VIEW_FEED, 'all' );
		$this->assertStringContainsString(
			$expected,
			$wl->getOutput()->getHTML(),
			$msg
		);
	}

	public function provideAddWatchlistHTML() {
		$fakeRow = [
			'rc_timestamp' => '20190425105407',
			'rc_namespace' => '0',
			'rc_title' => 'Watchers',
			'rc_minor' => '0',
			'rc_bot' => '0',
			'rc_source' => RecentChange::SRC_NEW,
			'rc_cur_id' => '2832',
			'rc_deleted' => 0,
			'rc_comment_text' => 'A comment',
			'rc_comment_cid' => '1',
			'rc_comment_data' => null,
			'rc_user' => null,
			'rc_user_text' => '0:0:0:0:0:0:0:1',
			'rc_this_oldid' => '2832',
			'rc_old_len' => '800',
			'rc_new_len' => '1000',
			'rc_id' => '2832',
		];

		return [
			[
				new FakeResultWrapper( [] ),
				'<div class="info empty-page"><p>There are no pages with recent changes.</p>',
				'empty message is displayed on feed'
			],
			[
				new FakeResultWrapper( [
					$fakeRow
				] ),
				'<p class="timestamp">10:54</p>',
				'A row is rendered'
			]
		];
	}
}
