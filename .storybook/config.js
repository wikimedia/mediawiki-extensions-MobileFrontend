import { configure } from '@storybook/html';
import OO from 'oojs';
import jQuery from 'jquery';
import mustache from 'mustache';
import './styles.less';
import en from '../i18n/en.json';

global.OO = OO;
global.$ = jQuery;
global.Mustache = mustache;
global.mw = require( '../tests/node-qunit/utils/mockMediaWiki' )();

// make sure messages work!
global.mw.msg = function ( key ) {
  return en[key];
};

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /\.stories\.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
