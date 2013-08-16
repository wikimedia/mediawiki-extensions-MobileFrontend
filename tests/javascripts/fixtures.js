// turn sinon into a global
window.sinon = sinon;
// force alpha so all code passes M.assert
mw.config.set( 'wgMFMode', 'alpha' );
