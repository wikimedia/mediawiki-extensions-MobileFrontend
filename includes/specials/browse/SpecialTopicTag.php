<?php

use Gather\models;
use Gather\views;
use MobileFrontend\Browse\TagService;

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
		$titles = $this->getTagService()
			->getTitlesForTag( $tagName );

		if ( !$titles ) {
			$this->renderError( array( 'unknownTag' => true ) );
			return;
		}

		$this->tagName = $tagName;

		$out = $this->getOutput();
		$out->addModules( array(
			'ext.gather.special',
			'mobile.special.browse.topicTag.styles',
			'mobile.special.browse.topicTag.scripts',
		) );
		$out->addModuleStyles( array(
			'mediawiki.ui.anchor',
			'mediawiki.ui.icon',
			'ext.gather.icons',
			'ext.gather.styles',
		) );

		$collectionItems = array();
		$pageIds = array_map( function ( Title $title ) {
			return $title->getArticleID();
		}, $titles );
		// get page images and extracts
		$pages = $this->getPages( $pageIds );
		if ( $pages ) {
			foreach ( $pages as $page ) {
				if ( !isset( $page['title'] ) || !$page['title'] ) {
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
				$collectionItems[$page['pageid']] = $item;
			}
		}

		$orderedCollectionItems = array();
		foreach ( $pageIds as $id ) {
			if ( isset( $collectionItems[$id] ) ) {
				array_push( $orderedCollectionItems, $collectionItems[$id] );
			}
		}

		$collection = new models\Collection( null, $this->getUser() );
		$collection->batch( $orderedCollectionItems );
		$this->render( new views\Collection( $this->getUser(), $collection ) );
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
		$templateParser = new TemplateParser( __DIR__ . '/../../../resources' );
		$message = $templateParser->processTemplate( 'mobile.browse/special/gather_error', $args );
		$this->renderUnavailableBanner( $message );
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

	/**
	 * Gets the service that gets tags assigned to the page.
	 *
	 * @return MobileFrontend\Browse\TagService
	 */
	private function getTagService() {
		$mfConfig = $this->getMFConfig();
		$tags = $mfConfig->get( 'MFBrowseTags' );

		return new TagService( $tags );
	}
}
