var
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	Section,
	sandbox;

QUnit.module( 'MobileFrontend Section.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		Section = require( '../../../src/mobile.startup/Section' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'initialize with options', function ( assert ) {
	var section = new Section( {
		level: '1',
		line: 'Line',
		text: 'Text',
		hasReferences: true,
		id: 'ID',
		anchor: 'Anchor'
	} );

	assert.strictEqual( section.line, 'Line', 'line is set' );
	assert.strictEqual( section.text, 'Text', 'text is set' );
	assert.strictEqual( section.hasReferences, true, 'hasReferences is set' );
	assert.strictEqual( section.id, 'ID', 'id is set' );
	assert.strictEqual( section.anchor, 'Anchor', 'anchor is set' );
	assert.strictEqual( section.subsections.length, 0, 'Subsections are empty' );
} );

QUnit.test( 'initialize with subsections', function ( assert ) {
	var
		section = new Section( {
			subsections: [ {
				level: '',
				line: 'Line',
				text: 'Text',
				hasReferences: true,
				id: 'ID',
				anchor: 'Anchor'
			} ]
		} ),
		subsection = section.subsections[ 0 ];

	assert.strictEqual( section.subsections.length, 1, 'Subsection is added to array' );
	assert.ok( subsection instanceof Section, 'Subsections are instances of Section' );

	assert.strictEqual( subsection.line, 'Line', 'line is set' );
	assert.strictEqual( subsection.text, 'Text', 'text is set' );
	assert.strictEqual( subsection.hasReferences, true, 'hasReferences is set' );
	assert.strictEqual( subsection.id, 'ID', 'id is set' );
	assert.strictEqual( subsection.anchor, 'Anchor', 'anchor is set' );
	assert.strictEqual( subsection.subsections.length, 0, 'Subsection children are empty' );
} );
