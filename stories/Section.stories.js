import Section from '../src/mobile.startup/Section';

export default {
	title: 'Section'
};

export const Default = () =>
	new Section( {
		level: 1,
		anchor: 'section_1',
		line: 'Section 1',
		text: '<p>Section text.</p>'
	} ).$el[0];

Default.story = {
	name: 'default'
};
