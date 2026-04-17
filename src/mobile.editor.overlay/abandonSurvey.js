const mobile = require( 'mobile.startup' );
const View = mobile.class.View,
	util = mobile.util,
	Drawer = mobile.Drawer;

class Survey extends View {
	/** @inheritdoc */
	get isTemplateMode() {
		return true;
	}

	/**
	 * @inheritdoc
	 */
	postRender() {
		this.$el.on( 'submit', ( e ) => {
			e.preventDefault();
		} );

		this.radioSelect = new OO.ui.RadioSelectWidget();
		this.radioSelect.addItems(
			( this.options.questions || [] ).map( ( question ) => new OO.ui.RadioOptionWidget(
				{
					data: question.key,
					label: question.label
				}
			) )
		);
		this.responseField = new OO.ui.FieldLayout( this.radioSelect, {
			align: 'top'
		} );
		this.$el.find( '.survey-questions' ).append( this.responseField.$element );

		this.radioSelect.on( 'choose', () => {
			this.responseField.setErrors( [] );
		} );

		this.submitButton = new OO.ui.ButtonWidget( {
			label: 'Submit feedback',
			flags: [ 'progressive', 'primary' ]
		} );
		this.$el.append( this.submitButton.$element );
	}

	/**
	 * @inheritdoc
	 */
	get template() {
		return util.template( `
<form>
  <h5>{{ title }}</h5>
  <p>{{ description }}</p>
  <div class="survey-questions"></div>
</form>` );
	}
}

/**
 * This creates the drawer at the bottom of the screen that appears when an
 * edit survey is shown
 *
 * @private
 * @param {EditorOverlay} editor
 * @return {module:mobile.startup/Drawer|false}
 */
module.exports = function abandonSurvey( editor ) {
	if ( !mw.config.get( 'wgMFEnableAbandonSurvey' ) ) {
		return false;
	}
	if ( mw.config.get( 'wgUserEditCount', 0 ) > 100000 ) {
		return false;
	}

	const storageKey = 'mf-abandon-survey/shown';
	if ( mw.storage.get( storageKey ) ) {
		return false;
	}

	const questions = [
		{
			key: 'exploring',
			label: 'Just exploring'
		},
		{
			key: 'notsure',
			label: 'Not sure how to start editing'
		},
		{
			key: 'worried-mistake',
			label: 'Worried about making a mistake'
		},
		{
			key: 'complicated',
			label: 'Interface felt too complicated'
		},
		{
			key: 'accident',
			label: 'Tapped edit by accident'
		},
		{
			key: 'error',
			label: 'Ran into a technical issue'
		}
	];
	// Shuffle questions to avoid biasing answers based on order
	questions.sort( () => Math.random() - 0.5 );

	questions.push( {
		key: 'other',
		label: 'Something else'
	} );

	const survey = new Survey( {
		title: 'What stopped you from editing this article?',
		description: 'Your anonymous feedback will help us improve editing',
		questions
	} );
	const drawer = new Drawer( {
		className: 'drawer abandon-survey',
		showCollapseIcon: false,
		onBeforeHide: () => {
			drawer.$el.remove();
			editor.logFeatureUse( {
				feature: 'abandon-survey',
				action: 'closed'
			} );
		},
		onShow: () => {
			mw.storage.set( storageKey, '1', 30 * 24 * 60 * 60 );
			editor.logFeatureUse( {
				feature: 'abandon-survey',
				action: 'shown'
			} );
			survey.submitButton.on( 'click', () => {
				const selectedItem = survey.radioSelect.findSelectedItem();
				const response = selectedItem && selectedItem.getData();
				if ( !response ) {
					survey.responseField.setErrors( [ 'Please select a reason' ] );
					return;
				}
				editor.logFeatureUse( {
					feature: 'abandon-survey',
					action: 'response-' + response
				} );
				mw.notify( 'Thank you for helping to improve the editing experience!', { type: 'success' } );
				drawer.$el.remove();
			} );
		},
		children: [
			( new OO.ui.ButtonWidget( {
				icon: 'close',
				framed: false,
				classes: [ 'abandon-survey-close cancel' ],
				label: mw.msg( 'mobile-frontend-drawer-arrow-label' ),
				invisibleLabel: true
			} ) ).$element,
			survey.$el
		]
	} );

	return drawer;
};
