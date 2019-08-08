import { storiesOf } from '@storybook/html';
import Section from '../src/mobile.startup/Section';

storiesOf( 'Section' )
	.add( 'default',
		() => new Section( {
			level: 1,
			anchor: 'section_1',
			line: 'Section 1',
			text: '<p>Section text.</p>'
		} ).$el[0]
	);
