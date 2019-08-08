import { storiesOf } from '@storybook/html';
import AddTopicForm from '../../src/mobile.talk.overlays/AddTopicForm';
import '../../resources/mobile.talk.overlays/talk.less';
import '../../resources/mobile.startup/panel.less';
import '../../.storybook/resolve-less-imports/mediawiki.ui/components/inputs.less';

import { action } from '@storybook/addon-actions';

storiesOf( 'talk' )
	.add( 'AddTopicForm',
		() => new AddTopicForm( {
			onTextInput: action( 'onTextInput' ),
			disabled: false,
			subject: 'Default',
			body: '',
			licenseMsg: 'The <strong>mobile</strong> license'
		} ).$el[0]
	);
