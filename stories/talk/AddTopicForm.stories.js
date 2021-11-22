import AddTopicForm from '../../src/mobile.talk.overlays/AddTopicForm';
import '../../resources/mobile.talk.overlays/talk.less';
import '../../resources/mobile.startup/panel.less';
import '../../.storybook/resolve-less-imports/mediawiki.ui.input/input.less';

import { action } from '@storybook/addon-actions';

export default {
	title: 'talk'
};

export const _AddTopicForm = () =>
	new AddTopicForm( {
		onTextInput: action( 'onTextInput' ),
		disabled: false,
		subject: 'Default',
		body: '',
		licenseMsg: 'The <strong>mobile</strong> license'
	} ).$el[0];

_AddTopicForm.story = {
	name: 'AddTopicForm'
};
