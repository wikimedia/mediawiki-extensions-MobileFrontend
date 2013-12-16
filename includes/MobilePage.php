<?php

/**
 * Retrieves information specific to a mobile page
 * Currently this only provides helper functions for loading PageImage associated with a page
 * FIXME: Rename when this class when its purpose becomes clearer
 */
class MobilePage {
	const MEDIUM_IMAGE_WIDTH = 300;
	const SMALL_IMAGE_WIDTH = 150;

	/**
	 * @var Title: Title for page
	 */
	private $title;
	private $file;
	private $content;
	private $usePageImages;

	public function __construct( Title $title, $file = false ) {
		$this->title = $title;
		// FIXME: check existence
		if ( defined( 'PAGE_IMAGES_INSTALLED' ) ) {
			$this->usePageImages = true;
			$this->file = $file ? $file : PageImages::getPageImage( $title );
		}
	}

	public function setPageListItemContent( $html ) {
		$this->content = $html;
	}

	public function getMediumThumbnailHtml( $useBackgroundImage = false ) {
		return $this->getPageImageHtml( self::MEDIUM_IMAGE_WIDTH, $useBackgroundImage );
	}

	public function getSmallThumbnailHtml( $useBackgroundImage = false ) {
		return $this->getPageImageHtml( self::SMALL_IMAGE_WIDTH, $useBackgroundImage );
	}

	private function getPageImageHtml( $size, $useBackgroundImage = false ) {
		$imageHtml = '';
		// FIXME: Use more generic classes - no longer restricted to lists
		$className = 'listThumb needsPhoto';
		if ( $this->usePageImages ) {
			$title = $this->title;
			$file = $this->file;
			if ( $file ) {
				$thumb = $file->transform( array( 'width' => $size ) );
				if ( $thumb && $thumb->getUrl() ) {
					$className = 'listThumb ' . ( $thumb->getWidth() > $thumb->getHeight() ? 'listThumbH' : 'listThumbV' );
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