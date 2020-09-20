<?php

namespace MobileFrontend\Models;

use File;
use Html;
use MediaWiki\MediaWikiServices;
use MediaWiki\Revision\RevisionRecord;
use Title;
use User;

/**
 * Retrieves information specific to a mobile page
 * Currently this only provides helper functions for creating Page Thumbnail
 * @todo FIXME: Rename this class when its purpose becomes clearer
 */
class MobilePage {
	public const SMALL_IMAGE_WIDTH = 150;
	public const TINY_IMAGE_WIDTH = 80;

	/**
	 * @var Title Title for page
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
	 * Set rev_timestamp of latest edit to this page
	 * @param string $timestamp Timestamp (MW format)
	 */
	public function setLatestTimestamp( $timestamp ) {
		$this->revisionTimestamp = $timestamp;
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
				$revUser = User::newFromIdentity( $userIdentity );
				$edit['name'] = $revUser->getName();
				$edit['gender'] = $userOptionsLookup->getOption( $revUser, 'gender' );
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
	 * Get a placeholder div container for thumbnails
	 * @param string $className Class for element
	 * @param string $iconClassName controls size of thumbnail, defaults to empty string
	 * @return string
	 */
	public static function getPlaceHolderThumbnailHtml( $className, $iconClassName = '' ) {
		return Html::element( 'div', [
			'class' => 'list-thumb list-thumb-placeholder ' . $iconClassName . ' ' . $className,
		] );
	}

	/**
	 * Check whether a page has a thumbnail associated with it
	 *
	 * @return bool whether the page has an image associated with it
	 */
	public function hasThumbnail() {
		return $this->file ? true : false;
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

			$imgUrl = wfExpandUrl( $thumb->getUrl(), PROTO_CURRENT );
			if ( $useBackgroundImage ) {
				$props['style'] = 'background-image: url("' . wfExpandUrl( $imgUrl, PROTO_CURRENT ) . '")';
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
