const oo = require( './oo.js' );
const sandbox = require( 'sinon' ).createSandbox();
oo.setUp( sandbox, global );
const fakeRouter = new OO.EventEmitter();
fakeRouter.getPath = () => '';
fakeRouter.back = () => {};
module.exports = fakeRouter;
