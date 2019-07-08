import { configure } from '@storybook/html';
import OO from 'oojs';
import jQuery from 'jquery';
import mustache from 'mustache';
import './styles.less';
import en from '../i18n/en.json';
import mockMediaWiki from '../node_modules/@wikimedia/mw-node-qunit/src/mockMediaWiki.js';

global.OO = OO;
global.OO.ui = {
  Element: {
    static: {
      getClosestScrollableContainer: () => {}
    }
  }
};
global.$ = jQuery;
global.Mustache = mustache;
global.mw = mockMediaWiki();

global.mw.Title = function ( title ) {
  return global.mw.Title.newFromText( title );
};
global.mw.Title.newFromText = function ( title, ns ) {
  return {
    getMainText: () => title,
    getUrl: () => `/wiki/${title}`
  };
};
global.mw.Title.makeTitle = function ( ns, title ) {
  return {
    getUrl: () => `/wiki/${title}`
  };
};

global.mw.confirmCloseWindow = function () {
  return {
    release: () => {}
  };
};

global.moment = ( ts ) => {
  return {
    to: ( expiry ) => '1 day',
    format: () => {
      return '20th December 2050';
    }
  }
};

// make sure messages work!
global.mw.msg = function ( key, arg1 ) {
  const val = en[key] || `⧼${key}⧽`;
  return val.replace( '$1', arg1 );
};

global.mw.message = function ( key ) {
  return {
    parse: () => {
      return en[key];
    },
    escaped: () => {
      return en[key] ? en[key] : `⧼${key}⧽`;
    },
    text: () => {
      return en[key];
    }
  }
};

global.mw.loader.using = () => Promise.resolve();

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /\.stories\.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
