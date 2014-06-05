<?php
/**
 * Retrieves information specific to a mobile page
 * Currently this only provides helper functions for loading PageImage associated with a page
 * @todo FIXME: Rename when this class when its purpose becomes clearer
 */
class MobilePage {
	const MEDIUM_IMAGE_WIDTH = 300;
	const SMALL_IMAGE_WIDTH = 150;
	const TINY_IMAGE_WIDTH = 50;

	/**
	 * @var Title: Title for page
	 */
	private $title;
	/**
	 * @var File Associated page image file (see PageImages extension)
	 */
	private $file;
	/**
	 * @var string Page content
	 */
	private $content;
	/**
	 * @var boolean Whether to use page images
	 */
	private $usePageImages;

	/**
	 * Constructor
	 * @param Title $title
	 * @param File|bool $file
	 */
	public function __construct( Title $title, $file = false ) {
		$this->title = $title;
		// @todo FIXME: check existence
		if ( defined( 'PAGE_IMAGES_INSTALLED' ) ) {
			$this->usePageImages = true;
			$this->file = $file ? $file : PageImages::getPageImage( $title );
		}
	}

	/**
	 * Get a placeholder div container for thumbnails
	 * @param string $className
	 */
	static function getPlaceHolderThumbnailHtml( $className ) {
		return Html::element( 'div', array(
			'class' => 'listThumb list-thumb-placeholder icon icon-32px ' . $className,
		) );
	}

	/**
	 * Check whether a page has a thumbnail associated with it
	 *
	 * @return Boolean whether the page has an image associated with it
	 */
	public function hasThumbnail() {
		return $this->file ? true : false;
	}

	/**
	 * Set the content of an item of a pagelist
	 *
	 * @param string $html Content for pagelist item
	 */
	public function setPageListItemContent( $html ) {
		$this->content = $html;
	}

	/**
	 * Get a medium sized thumbnail in div container.
	 *
	 * @param boolean $useBackgroundImage Whether the thumbnail should have a background image
	 * @return string
	 */
	public function getMediumThumbnailHtml( $useBackgroundImage = false ) {
		return $this->getPageImageHtml( self::MEDIUM_IMAGE_WIDTH, $useBackgroundImage );
	}

	/**
	 * Get a small sized thumbnail in div container.
	 *
	 * @param boolean $useBackgroundImage Whether the thumbnail should have a background image
	 * @return string
	 */
	public function getSmallThumbnailHtml( $useBackgroundImage = false ) {
		return $this->getPageImageHtml( self::SMALL_IMAGE_WIDTH, $useBackgroundImage );
	}

	/**
	 * Get the thumbnail container for getMediumThumbnailHtml() and getSmallThumbnailHtml().
	 *
	 * @param integer $size the width of the thumbnail
	 * @param boolean $useBackgroundImage Whether the thumbnail should have a background image
	 * @return string
	 */
	private function getPageImageHtml( $size, $useBackgroundImage = false ) {
		$imageHtml = '';
		// FIXME: Use more generic classes - no longer restricted to lists
		if ( $this->usePageImages ) {
			$file = $this->file;
			if ( $file ) {
				$thumb = $file->transform( array( 'width' => $size ) );
				if ( $thumb && $thumb->getUrl() ) {
					$className = 'listThumb ';
					$className .= $thumb->getWidth() > $thumb->getHeight()
						? 'icon icon-max-y'
						: 'icon icon-max-x';
					$props = array(
						'class' => $className,
					);

					$imgUrl = wfExpandUrl( $thumb->getUrl(), PROTO_CURRENT );
					if ( $useBackgroundImage ) {
						$props['style'] = 'background-image: url("' . wfExpandUrl( $imgUrl, PROTO_CURRENT ) . '")';
						$text = '';
					} else {
						$props['src'] = $imgUrl;
						$text = $this->title->getText();
					}
					$imageHtml = Html::element( $useBackgroundImage ? 'div' : 'img', $props, $text );
				}
			}
		}
		return $imageHtml;
	}
}
