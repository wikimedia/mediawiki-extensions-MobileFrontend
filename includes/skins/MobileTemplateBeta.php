<?php
class MobileTemplateBeta extends MobileTemplate {
	protected function renderMetaSections() {
		echo Html::openElement( 'div', array( 'id' => 'page-secondary-actions' ) );
		parent::renderMetaSections();
		echo Html::closeElement( 'div' );
	}
}
