Return to App
=============

### Config

Unlike other parts of this extension (for now), this uses a virtual config file.
The `config.json` in this directory is a stub for testing only and doesn't have
any effect in real life.

### Testing

To test this locally, ensure you have at least set `$wgMFReturnToAppScheme` in
settings; the exact value doesn't matter. Then append the querystring
`?returntoapp=1&veaction=edit` to a page, e.g.
`http://localhost:8080/wiki/Cat/?returntoapp=1`. After either saving changes or
closing the editor, the return-to-app behavior will activate.

Because return-to-app uses a custom URL scheme, unless you have a mobile app
installed locally, you may not see any visible change when the return-to-app
behavior activates or you click the link in the banner. Look in the developer
console of your browser for a message like "The scheme does not have a
registered handler."
