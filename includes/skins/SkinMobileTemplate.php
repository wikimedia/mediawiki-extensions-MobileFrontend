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
	<div class='show <?php $this->html( 'articleClass' ); ?>' id='content_wrapper'>
		<?php if ( !$this->data[ 'isSpecialPage' ] ) { ?>
			<div id="content" class="content">
		<?php } ?>
			<?php $this->html( 'prebodytext' ) ?>
			<?php $this->html( 'bodytext' ) ?>
			<?php $this->html( 'postbodytext' ) ?>
		<?php if ( !$this->data[ 'isSpecialPage' ] ) { ?>
			</div><!-- close #content -->
		<?php } ?>
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
		if ( $this->data['isAlphaGroupMember'] ) {
			$this->set( 'bodyClasses', 'mobile alpha' );
		} else {
			$this->data['isBetaGroupMember'] ? $this->set( 'bodyClasses', 'mobile beta' ) :
				$this->set( 'bodyClasses', 'mobile live' );
		}

		$htmlClass = '';
		if ( $this->data[ 'isSpecialPage' ] ) {
			$htmlClass .= ' specialPage';
		}
		if ( $this->data['renderLeftMenu'] ) {
			$htmlClass .= ' navigationEnabled navigationFullScreen';
		}
		if ( $this->data['action'] == 'edit' ) {
			$htmlClass .= ' actionEdit';
		}
		$this->set( 'htmlClasses', trim( $htmlClass ) );

		?><!doctype html>
	<html lang="<?php $this->text('code') ?>" dir="<?php $this->html( 'dir' ) ?>" class="<?php $this->text( 'htmlClasses' )  ?>">
	<head>
		<title><?php $this->text( 'pagetitle' ) ?></title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<?php $this->html( 'robots' ) ?>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=<?php $this->text( 'viewport-scaleable' ) ?>">
		<?php $this->html( 'touchIcon' ) ?>
		<?php if ( $this->data['supports_jquery'] ) { ?>
		<script type="text/javascript">
			document.documentElement.className += ' jsEnabled page-loading';
		</script>
		<?php } ?>
		<?php $this->html( 'preamble' ) ?>
		<link rel="canonical" href="<?php $this->html( 'canonicalUrl' ) ?>" >
	</head>
	<body class="<?php $this->text( 'bodyClasses' ) ?>">
		<?php $this->renderArticleSkin(); ?>
		<?php $this->html( 'bcHack' ) ?>
		<?php $this->html( 'bottomScripts' ) ?>
	</body>
	</html><?php
	}

	public function navigationStart() {
		global $wgMFNearby;

		?>
		<div id="mw-mf-viewport">
		<div id="mw-mf-page-left">
		<div id='mw-mf-content-left'>
		<ul id="mw-mf-menu-main">
			<li class="icon-home"><a href="<?php $this->text( 'mainPageUrl' ) ?>"
				title="<?php $this->msg( 'mobile-frontend-home-button' ) ?>">
				<?php $this->msg( 'mobile-frontend-home-button' ) ?></a></li>
			<li class="icon-random"><a href="<?php $this->text( 'randomPageUrl' ) ?>#mw-mf-page-left" id="randomButton"
				title="<?php $this->msg( 'mobile-frontend-random-button' ) ?>"
				><?php $this->msg( 'mobile-frontend-random-button' ) ?></a></li>
			<?php if ( $this->data['supports_jquery'] && $this->data['isAlphaGroupMember'] && $wgMFNearby ) { ?>
			<li class='icon-nearby'>
				<a href="<?php $this->text( 'nearbyURL' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?>
				</a>
			</li>
			<?php } ?>
			<?php if ( $this->data['supports_jquery'] ) { ?>
			<li class='icon-watchlist'>
				<a href="<?php $this->text( 'watchlistUrl' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-watchlist' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-watchlist' ) ?>
				</a>
			</li>
			<?php } ?>
			<?php if ( $this->data['supports_jquery'] && $this->data['isBetaGroupMember'] ) { ?>
			<li class='icon-uploads'>
					<a href="<?php $this->text( 'donateImageUrl' ) ?>"
						class="noHijack"
						title="<?php $this->msg( 'mobile-frontend-main-menu-upload' ) ?>">
					<?php $this->msg( 'mobile-frontend-main-menu-upload' ) ?>
					</a>
				</li>
			<?php } ?>
			<li class='icon-settings'>
				<a href="<?php $this->text( 'settingsUrl' ) ?>"
					title="<?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?>">
				<?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?>
				</a>
			</li>
			<?php if ( $this->data['supports_jquery'] ) { ?>
			<li class='icon-loginout'>
				<?php $this->html( 'logInOut' ) ?>
			</li>
			<?php } ?>
		</ul>
		</div>
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
		if ( $this->data['wgAppleTouchIcon'] !== false ) {
			$link = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $this->data['wgAppleTouchIcon'] ) );
		} else {
			$link = '';
		}
		$this->set( 'touchIcon', $link );

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
				<input type="search" name="search" id="mw-mf-search" size="22" value="<?php $this->text( 'searchField' )
					?>" autocomplete="off" maxlength="1024" class="search"
					placeholder="<?php echo $placeholder ?>"
					/>
				<input class='searchSubmit' type="submit" value="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
			</div>
		</form>
		<div id="mw-mf-menu-page"></div>
		<?php
	}

	private function footer() {
		?>
	<div id="footer">
		<?php
		// @todo: make license icon and text dynamic
		?>
	<h2 class="section_heading" id="section_footer">
		<?php $this->html( 'license' ) ?>
	</h2>
	<div class="content_block" id="content_footer">
		<ul class="settings">
			<li>
				<span class="left separator"><a id="mw-mf-display-toggle" href="<?php $this->text( 'viewNormalSiteURL' ) ?>"><?php
					$this->msg( 'mobile-frontend-view-desktop' ) ?></a></span><span class="right"><?php
				$this->msg( 'mobile-frontend-view-mobile' ) ?></span>
			</li>
			<li class="notice">
				<?php $this->html( 'historyLink' ) ?><br>
				<?php echo wfMessage( 'mobile-frontend-footer-license-text' )->parse() ?>
				<span>| <?php echo wfMessage( 'mobile-frontend-terms-use-text' )->parse() ?></span>
			</li>
		</ul>
		<ul class="links">
			<?php if ( !$this->data['isBetaGroupMember'] ) { ?>
			<li>
			<a href='<?php $this->text( 'leaveFeedbackURL' ) ?>'>
				<?php $this->msg( 'mobile-frontend-main-menu-contact' ) ?>
			</a>
			</li><li>
			<?php } else { ?>
				<li>
			<?php } ?>
			<?php $this->html( 'privacyLink' ) ?></li><li>
			<?php $this->html( 'aboutLink' ) ?></li><li>
			<?php $this->html( 'disclaimerLink' ) ?></li>
		</ul>
	</div><!-- close footer.div / #content_footer -->
	</div><!-- close #footer -->
	<?php
	}
}
