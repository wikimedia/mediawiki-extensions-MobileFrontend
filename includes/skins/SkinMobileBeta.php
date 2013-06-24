<?php

class SkinMobileBeta extends SkinMobile {
	public $template = 'MobileTemplateBeta';
	protected $mode = 'beta';

	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder-beta' )->escaped();
	}

	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
		$out->addModuleStyles( 'mobile.styles.beta' );
	}

	public function prepareData( BaseTemplate $tpl ) {
		parent::prepareData( $tpl );
		$this->prepareDataBeta( $tpl );
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
	protected function prepareUserButton( BaseTemplate $tpl ) {
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

	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['beta'] = array( 'mobile.beta' );

		return $modules;
	}

}
