<?php
class MinervaTemplateBeta extends MinervaTemplate {
	protected $isMainPage;

	public function execute() {
		$this->isMainPage = $this->getSkin()->getTitle()->isMainPage();
		parent::execute();
	}

	public function renderPageActions( $data ) {
		if ( !$this->isMainPage ) {
			parent::renderPageActions( $data );
		}
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
