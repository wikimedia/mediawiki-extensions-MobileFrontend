import MessageBox from '../../src/mobile.startup/MessageBox';
import '../../.storybook/mediawiki.skinning/messageBoxes.less';

export default {
	title: 'messagebox'
};

export const MessageBoxError = () => {
	return new MessageBox( {
		heading: 'Bad error',
		className: 'mw-message-box-error',
		msg: 'Oh no <strong>everything</strong> is broken!'
	} ).$el[0];
};

MessageBoxError.story = {
	name: 'MessageBox (error)'
};

export const MessageBoxWarning = () => {
	return new MessageBox( {
		heading: 'Warning',
		className: 'mw-message-box-warning',
		msg: 'Just to let you know in case you care.'
	} ).$el[0];
};

MessageBoxWarning.story = {
	name: 'MessageBox (warning)'
};

export const MessageBoxSuccess = () => {
	return new MessageBox( {
		heading: 'Yes!',
		className: 'mw-message-box-success',
		msg: 'You did it!'
	} ).$el[0];
};

MessageBoxSuccess.story = {
	name: 'MessageBox (success)'
};
