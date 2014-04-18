<?php
class MinervaTemplateBeta extends MinervaTemplate {

	public function renderPageActions( $data ) {
		if ( !$this->isMainPage ) {
			parent::renderPageActions( $data );
		}
	}
}
