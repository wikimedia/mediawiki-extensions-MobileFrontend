<?php

class SkinMobileTemplate extends BaseTemplate {
	public function renderArticleSkin() {
		$this->navigationStart();
		?>
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<?php $this->html( 'notice' ) ?>
		<?php if ( $this->data[ 'enableSiteNotice' ] ) { ?>
			<div id="siteNotice"></div>
		<?php } ?>
		<?php $this->renderArticleHeader() ?>
	<div class='show' id='content_wrapper'>
			<div id="content" class="content">
			<?php $this->html( 'prebodytext' ) ?>
			<?php $this->html( 'bodytext' ) ?>
			<?php $this->html( 'postbodytext' ) ?>
			</div><!-- close #content -->
	</div><!-- close #content_wrapper -->
		<?php
		if ( !$this->data[ 'isSpecialPage' ] ) {
			$this->footer();
		} ?>
		<?php
			$this->navigationEnd();
	}

	public function renderArticleHeader() {
		echo '<div id="mw-mf-header">';
		if ( $this->data['htmlHeader'] ) {
			$this->html( 'menuButton' );
			echo $this->data['htmlHeader'];
		} else {
			$this->searchBox();
		}
		echo '</div>';
	}

	public function execute() {
		$this->prepareData();
		$this->html( 'headelement' );
		$this->renderArticleSkin();
		$this->html( 'bcHack' );
		$this->html( 'bottomScripts' ) ?>
	</body>
	</html><?php
	}

	public function navigationStart() {
		global $wgMFNearby;

		?>
		<div id="mw-mf-viewport">
		<div id="mw-mf-page-left">
		<ul id="mw-mf-menu-main">
			<li class="icon-home"><a href="<?php $this->text( 'mainPageUrl' ) ?>"
				title="<?php $this->msg( 'mobile-frontend-home-button' ) ?>">
				<?php $this->msg( 'mobile-frontend-home-button' ) ?></a></li>
			<li class="icon-random"><a href="<?php $this->text( 'randomPageUrl' ) ?>#mw-mf-page-left" id="randomButton"
				title="<?php $this->msg( 'mobile-frontend-random-button' ) ?>"
				><?php $this->msg( 'mobile-frontend-random-button' ) ?></a></li>
			<?php if ( $this->data['isAlphaGroupMember'] && $wgMFNearby ) { ?>
			<li class='icon-nearby'>
				<a href="<?php $this->text( 'nearbyURL' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?>
				</a>
			</li>
			<?php } ?>
			<li class='icon-watchlist'>
				<a href="<?php $this->text( 'watchlistUrl' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-watchlist' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-watchlist' ) ?>
				</a>
			</li>
			<li class='icon-uploads'>
					<a href="<?php $this->text( 'donateImageUrl' ) ?>"
						class="noHijack"
						title="<?php $this->msg( 'mobile-frontend-main-menu-upload' ) ?>">
					<?php $this->msg( 'mobile-frontend-main-menu-upload' ) ?>
					</a>
				</li>
			<li class='icon-settings'>
				<a href="<?php $this->text( 'settingsUrl' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?>
				</a>
			</li>
			<li class='icon-loginout'>
				<?php $this->html( 'logInOut' ) ?>
			</li>
		</ul>
		</div>
		<div id='mw-mf-page-center'>
		<?php
	}

	public function navigationEnd() {
		//close #mw-mf-page-center then viewport;
		?>
		</div><!-- close #mw-mf-page-center -->
		</div><!-- close #mw-mf-viewport -->
		<?php
	}

	public function prepareData() {
		global $wgExtensionAssetsPath,
			$wgMobileFrontendLogo;

		wfProfileIn( __METHOD__ );
		$this->setRef( 'wgExtensionAssetsPath', $wgExtensionAssetsPath );
		$this->set( 'wgMobileFrontendLogo', $wgMobileFrontendLogo );

		wfProfileOut( __METHOD__ );
	}

	private function searchBox() {
		if ( $this->data['isAlphaGroupMember'] ) {
			$placeholder = wfMessage( 'mobile-frontend-placeholder-alpha' )->text();
		} else if ( $this->data['isBetaGroupMember'] ) {
			$placeholder = wfMessage( 'mobile-frontend-placeholder-beta' )->text();
		} else {
			$placeholder = wfMessage( 'mobile-frontend-placeholder' )->text();
		}
		?>
		<?php $this->html( 'menuButton' ) ?>
		<form id="mw-mf-searchForm" action="<?php $this->text( 'scriptUrl' ) ?>" class="search-box" method="get">
			<input type="hidden" value="Special:Search" name="title" />
			<div id="mw-mf-sq" class="divclearable">
				<input type="search" name="search" id="searchInput" size="22" value="<?php $this->text( 'searchField' )
					?>" autocomplete="off" maxlength="1024" class="search"
					placeholder="<?php echo $placeholder ?>"
					/>
				<input class='searchSubmit' type="submit" value="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
			</div>
		</form>
		<ul id="mw-mf-menu-page"></ul>
		<?php
	}

	private function footer() {
		?>
		<div id="footer">
			<h2 id="section_footer">
				<?php $this->html( 'sitename' ); ?>
			</h2>
			<div id="content_footer">
		<?php
			foreach( $this->getFooterLinks() as $category => $links ):
		?>
				<ul class="footer-<?php echo $category; ?>">
					<?php foreach( $links as $link ): ?><li id="footer-<?php echo $category ?>-<?php echo $link ?>"><?php $this->html( $link ) ?></li><?php endforeach; ?>
				</ul>
			<?php endforeach; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Returns an array of footerlinks trimmed down to only those footer links that
	 * are valid.
	 * $option currently unused in mobile
	 * @return array|mixed
	 */
	public function getFooterLinks( $option = null ) {
		return array(
			'notice' => array(
				'mobile-switcher',
				'mobile-notice',
			),
			'places' => array(
				'privacy',
				'about',
				'disclaimer',
			),
		);
	}
}
