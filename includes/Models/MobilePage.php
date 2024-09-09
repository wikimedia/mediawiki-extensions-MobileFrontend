<?php

namespace MobileFrontend\Models;

use File;
use MediaWiki\Html\Html;
use MediaWiki\MediaWikiServices;
use MediaWiki\Revision\RevisionRecord;
use MediaWiki\Title\Title;

/**
 * Retrieves information specific to a mobile page
 * Currently this only provides helper functions for creating Page Thumbnail
 * @todo FIXME: Rename this class when its purpose becomes clearer
 */
class MobilePage {
	public const SMALL_IMAGE_WIDTH = 220;
	public const TINY_IMAGE_WIDTH = 120;

	/**
	 * @var Title
	 */
	private $title;
	/**
	 * @var RevisionRecord|bool|null
	 */
	private $rev = false;
	/**
	 * @var string|bool
	 */
	private $revisionTimestamp;
	/**
	 * @var File|false Associated page image file (see PageImages extension)
	 */
	private $file;

	/**
	 * @param Title $title Page title
	 * @param File|false $file Page image file
	 */
	public function __construct( Title $title, $file = false ) {
		$this->title = $title;
		$this->file = $file;
	}

	/**
	 * @return RevisionRecord|null
	 */
	private function getRevision() {
		if ( $this->rev === false ) {
			$this->rev = MediaWikiServices::getInstance()->getRevisionStore()
				->getRevisionByTitle( $this->title );
		}
		return $this->rev;
	}

	/**
	 * Retrieve timestamp when the page content was last modified. Does not reflect null edits.
	 * @return string|bool Timestamp (MW format) or false
	 */
	public function getLatestTimestamp() {
		if ( $this->revisionTimestamp === null ) {
			$rev = $this->getRevision();
			$this->revisionTimestamp = $rev ? $rev->getTimestamp() : false;
		}
		return $this->revisionTimestamp;
	}

	/**
	 * Retrieve the last edit to this page.
	 * @return array defining edit with keys:
	 * - string name
	 * - string timestamp (Unix format)
	 * - string gender
	 */
	public function getLatestEdit() {
		$rev = $this->getRevision();
		$edit = [
			'timestamp' => false,
			'name' => '',
			'gender' => '',
		];
		if ( $rev ) {
			$edit['timestamp'] = wfTimestamp( TS_UNIX, $rev->getTimestamp() );
			$userIdentity = $rev->getUser();
			if ( $userIdentity ) {
				$userOptionsLookup = MediaWikiServices::getInstance()->getUserOptionsLookup();
				$edit['name'] = $userIdentity->getName();
				$edit['gender'] = $userOptionsLookup->getOption( $userIdentity, 'gender' );
			}
		}
		return $edit;
	}

	/**
	 * Get the title of the page
	 *
	 * @return Title
	 */
	public function getTitle() {
		return $this->title;
	}

	/**
	 * Get a small sized thumbnail in div container.
	 *
	 * @param bool $useBackgroundImage Whether the thumbnail should have a background image
	 * @return string
	 */
	public function getSmallThumbnailHtml( $useBackgroundImage = false ) {
		return $this->getPageImageHtml( self::SMALL_IMAGE_WIDTH, $useBackgroundImage );
	}

	/**
	 * Get the thumbnail container for getMediumThumbnailHtml() and getSmallThumbnailHtml().
	 *
	 * @param int $size the width of the thumbnail
	 * @param bool $useBackgroundImage Whether the thumbnail should have a background image
	 * @return string
	 */
	private function getPageImageHtml( $size, $useBackgroundImage = false ) {
		if ( !$this->file ) {
			return '';
		}
		// FIXME: Use more generic classes - no longer restricted to lists
		$thumb = $this->file->transform( [ 'width' => $size ] );
		if ( $thumb && $thumb->getUrl() ) {
			$className = 'list-thumb ';
			$className .= $thumb->getWidth() > $thumb->getHeight()
				? 'list-thumb-y'
				: 'list-thumb-x';
			$props = [
				'class' => $className,
			];

			$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
			$imgUrl = $urlUtils->expand( (string)$thumb->getUrl(), PROTO_CURRENT ) ?? '';
			if ( $useBackgroundImage ) {
				$props['style'] = 'background-image: url("' . $urlUtils->expand( $imgUrl, PROTO_CURRENT ) . '")';
				$text = '';
			} else {
				$props['src'] = $imgUrl;
				$text = $this->title->getText();
			}
			return Html::element( $useBackgroundImage ? 'div' : 'img', $props, $text );
		}
		return '';
	}
}
