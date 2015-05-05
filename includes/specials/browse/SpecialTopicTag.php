<?php

use Gather\models;
use Gather\views;

/**
 * Class SpecialTopicTag
 * Special page that renders the pages of a category as a Gather list.
 * This is an experimental feature.
 */
class SpecialTopicTag extends MobileSpecialPage {
	const API_LIMIT = 50;
	const EXTRACT_SENTENCES = 3;

	public function __construct() {
		// Un-list this page on Special:SpecialPages
		parent::__construct( 'TopicTag', '', false );
		$this->tagName = '';
	}

	/**
	 * Render the special page
	 *
	 * @param string $subPage Tag name with underscores instead of spaces
	 */
	public function executeWhenAvailable( $subPage ) {
		$mfConfig = $this->getMFConfig();

		if ( !$mfConfig->get( 'MFIsBrowseEnabled' ) ) {
			$this->renderError( array( 'browseDisabled' => true ) );
			return;
		}

		if ( !class_exists( 'Gather\Hooks' ) ) {
			$this->renderError( array( 'noGather' => true ) );
			return;
		}

		$tagName = str_replace( '_', ' ', $subPage );
		$categoryName = array_search( $tagName, $mfConfig->get( 'MFBrowseTags' ) );
		if ( $categoryName == false ) {
			$this->renderError( array( 'unknownTag' => true ) );
			return;
		}

		$this->tagName = $tagName;

		$out = $this->getOutput();
		$out->addModules( array(
			'ext.gather.special',
		) );
		$out->addModuleStyles( array(
			'mediawiki.ui.anchor',
			'mediawiki.ui.icon',
			'ext.gather.icons',
			'ext.gather.styles',
		) );
		$out->addInlineStyle(
			// hide the user info, meta, and moderation controls
			'.collection-header, .collection-moderation { display: none !important; }' .
			' .collection-cards { padding-top: 1em; }'
		);

		// get pages that belong to the category
		$categoryPages = $this->getCategoryPages( $categoryName );
		if ( $categoryPages ) {
			$collectionItems = array();
			$pageIds = array();
			foreach ( $categoryPages as $page ) {
				array_push( $pageIds, $page['pageid'] );
			}
			// get page images and extracts
			$pages = $this->getPages( $pageIds );
			if ( $pages ) {
				foreach ( $pages as $page ) {
					if ( !$page['title'] ) {
						continue;
					}
					$title = Title::newFromText( $page['title'] );
					$image = false;
					if ( isset( $page['pageimage'] ) ) {
						$image = wfFindFile( $page['pageimage'] );
					}
					$extract = '';
					if ( isset( $page['extract']['*'] ) ) {
						$extract = $page['extract']['*'];
					}
					$item = new models\CollectionItem( $title, $image, $extract );
					array_push( $collectionItems, $item );
				}
			}

			$collection = new models\Collection( null, $this->getUser() );
			$collection->batch(  $collectionItems );
			$this->render( new views\Collection( $this->getUser(), $collection ) );
		}

	}

	/**
	 * Render the special page using a View
	 *
	 * @param views\View $view
	 */
	public function render( $view ) {
		$out = $this->getOutput();
		$this->setHeaders();
		$out->setPageTitle( $this->tagName );
		$view->render( $out );
	}


	public function renderError( $args ) {
		$templateParser = new TemplateParser( __DIR__ . '/../../../templates' );
		$message = $templateParser->processTemplate( 'browse/gather_error', $args );
		$this->renderUnavailableBanner( $message );
	}

	/**
	 * Return pages that belong to a category
	 * @param string $categoryName
	 * @return array
	 */
	private function getCategoryPages( $categoryName ) {
		$result = array();

		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				array(
					'action' => 'query',
					'list' => 'categorymembers',
					'cmtitle' => $categoryName,
					'cmtype' => 'page',
					'cmlimit' => self::API_LIMIT,
					'continue' => '',
				)
			)
		);
		$api->execute();
		$data = $api->getResult()->getResultData( null, array( 'Strip' => 'all' ) );
		if ( isset( $data['query']['categorymembers'] ) ) {
			$result = $data['query']['categorymembers'];
		}

		return $result;
	}

	/**
	 * Return page image and extracts
	 * @param array $pageIds
	 * @return array
	 */
	private function getPages( $pageIds ) {
		$result = array();

		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				array(
					'action' => 'query',
					'list' => 'allpages',
					'prop' => 'extracts|pageimages',
					'pageids' => implode( '|', $pageIds ),
					'exsentences' => self::EXTRACT_SENTENCES,
					'explaintext' => true,
					'piprop' => 'name',
					'continue' => '',
				)
			)
		);
		$api->execute();
		$data = $api->getResult()->getResultData( null, array( 'Strip' => 'all' ) );
		if ( isset( $data['query']['pages'] ) ) {
			$result = $data['query']['pages'];
		}

		return $result;
	}
}
