<?php

class SkinMobileBase extends SkinMinerva {
	/**
	 * @var ExtMobileFrontend
	 */
	protected $extMobileFrontend;
	protected $hookOptions;

	/** @var array of classes that should be present on the body tag */
	private $pageClassNames = array();

	public function prepareData( BaseTemplate $tpl ) {
		parent::prepareData( $tpl );
		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();
		$menuHeaders = true;
		$search = $tpl->data['searchBox'];
		if ( $context->isAlphaGroupMember() ) {
			$search['placeholder'] = wfMessage( 'mobile-frontend-placeholder-alpha' )->escaped();
		} else if ( $inBeta ) {
			$search['placeholder'] = wfMessage( 'mobile-frontend-placeholder-beta' )->escaped();
		} else { // stable mode
			$menuHeaders = false;
		}
		$tpl->set( '_show_menu_headers', $menuHeaders );
		$tpl->set( 'searchBox', $search );

		if ( $inBeta ) {
			$this->prepareDataBeta( $tpl );
		}
	}

	/**
	 * Prepares data required by the mobile beta skin only. This runs after prepareData
	 * @param $tpl BaseTemplate
	 */
	protected function prepareDataBeta( BaseTemplate $tpl ) {
		$tpl->set( 'site_urls', array(
			array(
				'href' => Title::newFromText( 'About', NS_PROJECT )->getLocalUrl(),
				'text'=> $this->msg( 'mobile-frontend-main-menu-about' )->escaped(),
			),
			array(
				'href' => Title::newFromText( 'General_disclaimer', NS_PROJECT )->getLocalUrl(),
				'text'=> $this->msg( 'mobile-frontend-main-menu-disclaimer' )->escaped(),
			),
		) );

		// Reuse template data variable from SkinTemplate to construct page menu
		$menu = array();
		$actions = $tpl->data['content_navigation']['actions'];
		$namespaces = $tpl->data['content_navigation']['namespaces'];

		// empty placeholder for edit photos which both require js
		$menu['edit'] = array( 'id' => 'ca-edit', 'text' => '' );
		$menu['photo'] = array( 'id' => 'ca-upload', 'text' => '' );

		if ( isset( $namespaces['talk'] ) ) {
			$menu['talk'] = $namespaces['talk'];
			if ( isset( $tpl->data['_talkdata'] ) ) {
				$menu['talk']['text'] = $tpl->data['_talkdata']['text'];
				$menu['talk']['class'] = $tpl->data['_talkdata']['class'];
			}
		}

		$watchTemplate = array(
			'id' => 'ca-watch',
			'class' => 'watch-this-article',
		);
		// standardise watch article into one menu item
		if ( isset( $actions['watch'] ) ) {
			$menu['watch'] = array_merge( $actions['watch'], $watchTemplate );
		} else if ( isset( $actions['unwatch'] ) ) {
			$menu['watch'] = array_merge( $actions['unwatch'], $watchTemplate );
			$menu['watch']['class'] .= ' watched';
		} else {
			// placeholder for not logged in
			$menu['watch'] = $watchTemplate;
			// FIXME: makeLink (used by makeListItem) when no text is present defaults to use the key
			$menu['watch']['text'] = '';
			$menu['watch']['class'] = 'cta';
		}

		$tpl->set( 'page_actions', $menu );

		$this->prepareUserButton( $tpl );
	}

	/**
	 * Prepares the user button.
	 * @param $tpl BaseTemplate
	 */
	protected function prepareUserButton( $tpl ) {
		if ( class_exists( 'MWEchoNotifUser' ) ) {
			$user = $this->getUser();
			// FIXME: cap higher counts
			$count = $user->isLoggedIn() ? MWEchoNotifUser::newFromUser( $user )->getNotificationCount() : 0;

			$tpl->set( 'userButton',
				Html::openElement( 'a', array(
					'title' => wfMessage( 'mobile-frontend-user-button-tooltip' ),
					'href' => SpecialPage::getTitleFor( 'Notifications' )->getLocalURL(),
					'id'=> 'user-button',
				) ) .
				Html::element( 'span', array( 'class' => $count ? '' : 'zero' ), $count ) .
				Html::closeElement( 'a' )
			);
		}
	}

	public function getSkinConfigVariables() {
		global $wgCookiePath;
		$ctx = MobileContext::singleton();
		$wgUseFormatCookie = array(
			'name' => $ctx->getUseFormatCookieName(),
			'duration' => -1, // in days
			'path' => $wgCookiePath,
			'domain' => $this->getRequest()->getHeader( 'Host' ),
		);
		$vars = parent::getSkinConfigVariables();
		$vars['wgUseFormatCookie'] = $wgUseFormatCookie;
		return $vars;
	}
	/**
	 * This will be called by OutputPage::headElement when it is creating the
	 * "<body>" tag, - adds output property bodyClassName to the existing classes
	 * @param $out OutputPage
	 * @param $bodyAttrs Array
	 */
	public function addToBodyAttributes( $out, &$bodyAttrs ) {
		// does nothing by default
		$classes = $out->getProperty( 'bodyClassName' );
		$bodyAttrs[ 'class' ] .= ' ' . $classes;
	}

	/**
	 * @param string $className: valid class name
	 */
	private function addPageClass( $className ) {
		$this->pageClassNames[ $className ] = true;
	}

	/**
	 * Takes a title and returns classes to apply to the body tag
	 * @param $title Title
	 * @return String
	 */
	public function getPageClasses( $title ) {
		if ( $title->isMainPage() ) {
			$className = 'page-Main_Page ';
		} else if ( $title->isSpecialPage() ) {
			$className = 'mw-mf-special ';
		} else {
			$className = '';
		}
		return $className . implode( ' ', array_keys( $this->pageClassNames ) );
	}

	public function __construct( ExtMobileFrontend $extMobileFrontend ) {
		$this->setContext( $extMobileFrontend );
		$this->extMobileFrontend = $extMobileFrontend;
		$ctx = MobileContext::singleton();
		$this->addPageClass( 'mobile' );
		if ( $ctx->isAlphaGroupMember() ) {
			$this->addPageClass( 'alpha' );
		} else if ( $ctx->isBetaGroupMember() ) {
			$this->addPageClass( 'beta' );
		} else {
			$this->addPageClass( 'stable' );
		}
	}

	public function outputPage( OutputPage $out = null ) {
		global $wgMFNoindexPages;
		wfProfileIn( __METHOD__ );
		if ( !$out ) {
			$out = $this->getOutput();
		}
		if ( $wgMFNoindexPages ) {
			$out->setRobotPolicy( 'noindex,nofollow' );
		}

		$options = null;
		if ( wfRunHooks( 'BeforePageDisplayMobile', array( &$out, &$options ) ) ) {
			if ( is_array( $options ) ) {
				$this->hookOptions = $options;
			}
		}
		$html = $this->extMobileFrontend->DOMParse( $out );

		wfProfileIn( __METHOD__  . '-tpl' );
		$tpl = $this->prepareTemplate();
		$tpl->set( 'headelement', $out->headElement( $this ) );
		$tpl->set( 'bodytext', $html );
		$notice = '';
		wfRunHooks( 'GetMobileNotice', array( $this, &$notice ) );
		$tpl->set( 'notice', $notice );
		$tpl->set( 'reporttime', wfReportTime() );
		$tpl->execute();
		wfProfileOut( __METHOD__  . '-tpl' );

		wfProfileOut( __METHOD__ );
	}

	/**
	 * @return QuickTemplate
	 */
	protected function prepareTemplate() {
		wfProfileIn( __METHOD__ );

		$tpl = $this->setupTemplate( $this->template );
		$tpl->setRef( 'skin', $this );
		$tpl->set( 'wgScript', wfScript() );

		$this->initPage( $this->getOutput() );
		$tpl->set( 'searchField', $this->getRequest()->getText( 'search', '' ) );
		$this->loggedin = $this->getUser()->isLoggedIn();
		$content_navigation = $this->buildContentNavigationUrls();
		$tpl->setRef( 'content_navigation', $content_navigation );
		$tpl->set( 'language_urls', $this->mobilizeUrls( $this->getLanguages() ) );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}

	/**
	 * Takes an array of link elements and applies mobile urls to any urls contained in them
	 * @param $urls Array
	 * @return Array
	 */
	public function mobilizeUrls( $urls ) {
		return array_map( function( $url ) {
				$ctx = MobileContext::singleton();
				$url['href'] = $ctx->getMobileUrl( $url['href'] );
				return $url;
			},
			$urls );
	}
}
