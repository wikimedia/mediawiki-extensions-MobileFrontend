<?php
class MobileTemplateBeta extends MobileTemplate {
	protected $isMainPage;

	public function execute() {
		$this->isMainPage = $this->getSkin()->getTitle()->isMainPage();
		parent::execute();
	}

	protected function renderMetaSections() {
		echo Html::openElement( 'div', array( 'id' => 'page-secondary-actions' ) );
		parent::renderMetaSections();
		echo Html::closeElement( 'div' );
	}

	protected function renderContentWrapper( $data ) {
		$this->renderHistoryLinkTop( $data );
		parent::renderContentWrapper( $data );
	}

	protected function renderHistoryLinkTop( $data ) {
		if ( !$this->isMainPage ) {
				$this->renderHistoryLink( $data );
		}
	}

	protected function renderHistoryLinkBottom( $data ) {
		if ( $this->isMainPage ) {
			parent::renderHistoryLinkBottom( $data );
		}
	}
}
