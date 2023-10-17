// Expose public API in ResourceLoader for Mobile startup
// This cannot be done inside Webpack as Webpack doesn't have access to
// ResourceLoader's public exports. We delete the private _mobileFrontend
// object after this transfer has been made.
module.exports = mw._mobileFrontend;
delete mw._mobileFrontend;

mw.log.deprecate(
	mw.mobileFrontend, 'require', mw.mobileFrontend.require,
	'[1.41] Please refer to T348807 for migration notes.'
);
