<?php
/**
 * MinervaTemplate.php
 */

/**
 * Extended Template class of BaseTemplate for mobile devices
 */
class MinervaTemplate extends BaseTemplate {
	/** @var boolean Specify whether the page is a special page */
	protected $isSpecialPage;

	/** @var boolean Whether or not the user is on the Special:MobileMenu page */
	protected $isSpecialMobileMenuPage;

	/** @var boolean Specify whether the page is main page */
	protected $isMainPage;

	/** @var boolean Whether to insert the page actions before the heading in HTML */
	protected $shouldDisplayPageActionsBeforeHeading = true;

	/**
	 * Gets the header content for the top chrome.
	 * @param array $data Data used to build the page
	 * @return string
	 */
	protected function getChromeHeaderContentHtml( $data ) {
		return $this->getSearchForm( $data );
	}

	/**
	 * Generates the HTML required to render the search form.
	 *
	 * @param array $data The data used to render the page
	 * @return string
	 */
	protected function getSearchForm( $data ) {
		return Html::openElement( 'form',
				array(
					'action' => $data['wgScript'],
					'class' => 'search-box',
				)
			) .
			$this->makeSearchInput( $this->getSearchAttributes() ) .
			$this->makeSearchButton(
				'fulltext',
				array(
					'class' => MobileUI::buttonClass( 'progressive', 'fulltext-search no-js-only' ),
				)
			) .
			Html::closeElement( 'form' );
	}

	/**
	 * Start render the page in template
	 */
	public function execute() {
		$title = $this->getSkin()->getTitle();
		$this->isSpecialPage = $title->isSpecialPage();
		$this->isSpecialMobileMenuPage = $this->isSpecialPage &&
			$title->equals( SpecialPage::getTitleFor( 'MobileMenu' ) );
		$this->isMainPage = $title->isMainPage();
		Hooks::run( 'MinervaPreRender', array( $this ) );
		$this->render( $this->data );
	}

	/**
	 * Returns available page actions
	 * @return array
	 */
	public function getPageActions() {
		return $this->isFallbackEditor() ? array() : $this->data['page_actions'];
	}

	/**
	 * Returns footer links
	 * @param string $option
	 * @return array
	 */
	public function getFooterLinks( $option = null ) {
		return $this->data['footerlinks'];
	}

	/**
	 * Get attributes to create search input
	 * @return array Array with attributes for search bar
	 */
	protected function getSearchAttributes() {
		$searchBox = array(
			'id' => 'searchInput',
			'class' => 'search',
			'autocomplete' => 'off',
			// The placeholder gets fed to HTML::element later which escapes all
			// attribute values, so need to escape the string here.
			'placeholder' => $this->getMsg( 'mobile-frontend-placeholder' )->text(),
		);
		return $searchBox;
	}

	/**
	 * Get the HTML for rendering the footer elements
	 * @param array $data Data used to build the footer
	 * @return string html
	 */
	protected function getFooterHtml( $data ) {
		$footer = '<div id="footer" class="post-content">';
		foreach ( $this->getFooterLinks() as $category => $links ) {
			$footer .= Html::openElement( 'ul', array( 'class' => 'footer-' . $category ) );
			foreach ( $links as $link ) {
				if ( isset( $this->data[$link] ) && $this->data[$link] !== '' ) {
					$footer .= Html::rawElement( 'li',
						array( 'id' => "footer-{$category}-{$link}" ), $data[$link] );
				}
			}
			$footer .= '</ul>';
		}
		$footer .= '</div>';
		return $footer;
	}

	/**
	 * Get the HTML for rendering the available page actions
	 * @param array $data Data used to build page actions
	 * @return string
	 */
	protected function getPageActionsHtml( $data ) {
		$actions = $this->getPageActions();
		$html = '';
		$isJSOnly = true;
		if ( $actions ) {
			foreach ( $actions as $key => $val ) {
				if ( isset( $val['is_js_only'] ) && !$val['is_js_only'] ) {
					$isJSOnly = false;
				}
				$html .= $this->makeListItem( $key, $val );
			}
			$additionalClasses = $isJSOnly ? 'jsonly' : '';
			$html = '<ul id="page-actions" class="hlist ' . $additionalClasses . '">' . $html . '</ul>';
		}
		return $html;
	}

	/**
	 * Returns the 'Last edited' message, e.g. 'Last edited on...'
	 * @param array $data Data used to build the page
	 * @return string
	 */
	protected function getHistoryLinkHtml( $data ) {
		$action = Action::getActionName( RequestContext::getMain() );
		if ( isset( $data['historyLink'] ) && $action === 'view' ) {
			$historyLink = $data['historyLink'];
			$args = array(
				'isMainPage' => $this->getSkin()->getTitle()->isMainPage(),
				'link' => $historyLink['href'],
				'text' => $historyLink['text'],
				'username' => $historyLink['data-user-name'],
				'userGender' => $historyLink['data-user-gender'],
				'timestamp' => $historyLink['data-timestamp']
			);
			$templateParser = new TemplateParser( __DIR__ );
			return $templateParser->processTemplate( 'history', $args );
		} else {
			return '';
		}
	}

	protected function isFallbackEditor() {
		$action = $this->getSkin()->getRequest()->getVal( 'action' );
		return $action === 'edit';
	}
	/**
	 * Get page secondary actions
	 */
	protected function getSecondaryActions() {
		if ( $this->isFallbackEditor() ) {
			return array();
		}

		return $this->data['secondary_actions'];
	}

	/**
	 * Get HTML representing secondary page actions like language selector
	 * @return string
	 */
	protected function getSecondaryActionsHtml() {
		// no secondary actions on the user page
		if ( $this->getSkin()->isUserPage ) {
			return '';
		}
		$baseClass = MobileUI::buttonClass( '', 'button' );
		$html = Html::openElement( 'div', array(
			'class' => 'post-content',
			'id' => 'page-secondary-actions'
		) );

		foreach ( $this->getSecondaryActions() as $el ) {
			if ( isset( $el['attributes']['class'] ) ) {
				$el['attributes']['class'] .= ' ' . $baseClass;
			} else {
				$el['attributes']['class'] = $baseClass;
			}
			$html .= Html::element( 'a', $el['attributes'], $el['label'] );
		}

		return $html . Html::closeElement( 'div' );
	}

	/**
	 * Get the HTML for the content of a page
	 * @param array $data Data used to build the page
	 * @return string representing HTML of content
	 */
	protected function getContentHtml( $data ) {
		if ( !$data[ 'unstyledContent' ] ) {
			$content = Html::openElement( 'div', array(
				'id' => 'bodyContent',
				'class' => 'content',
			) );
			$content .= $data[ 'bodytext' ];
			if ( isset( $data['subject-page'] ) ) {
				$content .= $data['subject-page'];
			}
			return $content . Html::closeElement( 'div' );
		} else {
			return $data[ 'bodytext' ];
		}
	}

	/**
	 * Get the HTML for rendering pre-content (e.g. heading)
	 * @param array $data Data used to build the page
	 * @return string HTML
	 */
	protected function getPreContentHtml( $data ) {
		$internalBanner = $data[ 'internalBanner' ];
		$preBodyHtml = isset( $data['prebodyhtml'] ) ? $data['prebodyhtml'] : '';
		$headingHtml = isset( $data['headinghtml'] ) ? $data['headinghtml'] : '';
		$postHeadingHtml = isset( $data['postheadinghtml'] ) ? $data['postheadinghtml'] : '';

		$html = '';
		if ( $internalBanner || $preBodyHtml || isset( $data['page_actions'] ) ) {
			$html .= $preBodyHtml
				. Html::openElement( 'div', array( 'class' => 'pre-content heading-holder' ) );
				if ( !$this->shouldDisplayPageActionsBeforeHeading ) {
					$html .= $headingHtml;
				}
				if ( !$this->isSpecialPage ){
					$html .= $this->getPageActionsHtml( $data );
				}
				if ( $this->shouldDisplayPageActionsBeforeHeading ) {
					$html .= $headingHtml;
				}
				$html .= $postHeadingHtml;
				$html .= $data['subtitle'];
				// FIXME: Temporary solution until we have design
				if ( isset( $data['_old_revision_warning'] ) ) {
					$html .= $data['_old_revision_warning'];
				}

				$html .= $internalBanner;
				$html .=  '</div>';
		}
		return $html;
	}

	/**
	 * Gets HTML that needs to come after the main content and before the secondary actions.
	 *
	 * @param array $data The data used to build the page
	 * @return string
	 */
	protected function getPostContentHtml( $data ) {
		return $this->getSecondaryActionsHtml() .
			$this->getHistoryLinkHtml( $data );
	}

	/**
	 * Get the HTML for rendering the wrapper for loading content
	 * @param array $data Data used to build the page
	 * @return string HTML
	 */
	protected function getContentWrapperHtml( $data ) {
		return $this->getPreContentHtml( $data ) .
			$this->getContentHtml( $data ) .
			$this->getPostContentHtml( $data );
	}

	/**
	 * Gets the main menu only on Special:MobileMenu.
	 * On other pages the menu is rendered via JS.
	 * @param array [$data] Data used to build the page
	 * @return string
	 */
	protected function getMainMenuHtml( $data ) {
		if ( $this->isSpecialMobileMenuPage ) {
			$templateParser = new TemplateParser(
				__DIR__ . '/../../resources/mobile.mainMenu/' );

			return $templateParser->processTemplate( 'menu', $data['menu_data'] );
		} else {
			return '';
		}
	}

	/**
	 * Get HTML for header elements
	 * @param array $data Data used to build the header
	 * @return string
	 */
	protected function getHeaderHtml( $data ) {
		// Note these should be wrapped in divs
		// see https://phabricator.wikimedia.org/T98498 for details
		return '<div>' . $data['menuButton'] . '</div>'
			. $this->getChromeHeaderContentHtml( $data )
			. '<div>' . $data['secondaryButton'] . '</div>';
	}

	/**
	 * Render the entire page
	 * @param array $data Data used to build the page
	 * @todo replace with template engines
	 */
	protected function render( $data ) {
		$templateParser = new TemplateParser( __DIR__ );

		// prepare template data
		$templateData = array(
			'banners' => $data['banners'],
			'headelement' => $data[ 'headelement' ],
			'headerhtml' => $this->getHeaderHtml( $data ),
			'mainmenuhtml' => $this->getMainMenuHtml( $data ),
			'contenthtml' => $this->getContentWrapperHtml( $data ),
			'footerhtml' => $this->getFooterHtml( $data ),
		);
		// begin rendering
		echo $templateParser->processTemplate( 'minerva', $templateData );
		$this->printTrail();
		?>
		</body>
		</html>
		<?php
	}
}
