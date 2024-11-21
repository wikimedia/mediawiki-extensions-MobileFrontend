MobileFrontend Extension
========================

The MobileFrontend extension adds a mobile view to your mediawiki instance.

Installation
------------

See <https://www.mediawiki.org/wiki/Extension:MobileFrontend#Installation>

Development
-----------

### Directory structure

- resources/: Files for PHP consumption.
- src/: Files to be processed by Webpack.

### Coding conventions

Please follow the coding conventions of MobileFrontend:
<https://www.mediawiki.org/wiki/MobileFrontend/Coding_conventions>

#### Git hooks

Git hooks are provided by default to assist with adhering to
JavaScript code standards, optimizing PNG files, etc. Running these hooks
requires node.js, NPM, and grunt.

Install like so:

    npm install

If you are not running Vagrant, be sure to set your `MEDIAWIKI_URL` env
variable to your local index path, e.g.
`MEDIAWIKI_URL=http://localhost/index.php/`

### Development Server (JS/CSS Changes)

1. **Install Dependencies**:
   ```bash
   npm install
2. **Start the Dev Server**:
   ```bash
   npm run start
This watches and auto-reloads changes.

### Committing

Commits are important as they give the reviewer more information to
successfully review your code and find errors or potential problems you might
not have thought of.

Commits are also useful when troubleshooting issues and refactoring. If it's
not clear why a line of code is in the repository important bug fixes could be
lost.

Commits should be as minor as possible. Please avoid removing unrelated
console.log statements, fixing unrelated whitespace etc. do that in a separate
commit which mentions the word cleanup.

First line commit should summarise the commit with bug it fixes if applicable.
e.g. *Fix problem with toggling see bug x*.

Second line should be blank. Third line should go into detail where necessary
providing links to blog posts/other bugs to provide more background. Mention
the platforms/browsers the change is for where necessary, e.g.:

* *This is a problem on Android but not OSX, see `http://<url></url>` which
  explains problem in detail*
* *This is a workaround for a known bug in opera mobile see
  `http://<url></url>`*

### Testing

#### Unit tests

To run the full test suite run:

    npm run precommit

To run only PHP tests, from your MediaWiki installation path:

    composer phpunit:entrypoint -- extensions/MobileFrontend/tests/phpunit/

To run only MobileFrontend JS tests:

    npm run test:unit

### Releasing

A new version of MobileFrontend is released every two weeks following the
Wikimedia release train if there are new changes.

MobileFrontend follows the version naming from MediaWiki.

Configuration options
---------------------

### MobileFrontend
The following configuration options will apply to all skins operating in useformat=mobile mode.

#### $wgMFEnableXAnalyticsLogging

Whether or not to enable the use of the X-Analytics HTTP response header.  This
header is used for analytics purposes.

See: https://www.mediawiki.org/wiki/Analytics/Kraken/Data_Formats/X-Analytics

* Type: `Boolean`
* Default: `false`

#### $wgMFDefaultEditor

Default editor when there is no user preference set (mobile-editor).
One of `source`, `visual`, or `preference` (inherit desktop editor preference).

* Type: `string`
* Default: `preference`

#### $wgMFFallbackEditor

When MFDefaultEditor is set to `preference` and no desktop preference is set,
use this editor. Set to `source` or `visual`.

* Type: `string`
* Default: `visual`

#### $wgMFEnableMobilePreferences

Enable mobile preferences in Special:Preferences (currently only accessible in desktop). Currently this allows users to disable many of mobile's special page optimisations.

* Type: `Boolean`
* Default: `false`

#### $wgMFUseDesktopSpecialEditWatchlistPage

Enables the desktop version of the Special:EditWatchlist page if set to `true`. If set to
`false`, the mobile version will be enabled but can still be overridden by the user's
mobile preferences option.

* Type: `Array`
* Default:
```php
  [
    'base' => false,
    'beta' => false,
    // Enable desktop version of watchlist page when AMC is enabled
    'amc' => true,
  ]
```

#### $wgMFEnableJSConsoleRecruitment

Controls whether a message should be logged to the console to attempt to
recruit volunteers.

* Type: `Boolean`
* Default: `false`

#### $wgMFScriptPath

When set will override the default search script path.
This should not be used in production, it is strictly for development purposes.

* Type: `string`
* Default: ''

e.g $wgMFScriptPath = "https://it.wikipedia.org/w/api.php"

When caching this configuration variable, to show Wikidata descriptions please
update $wgMFEnableWikidataDescriptions and $wgMFDisplayWikibaseDescriptions as these are
disabled by default.

#### $wgMFMobileFormatterOptions

This provides options for the MobileFormatter.
* headings: is a list of html tags, that could be recognized as the first heading of
a page.  This is an interim solution to fix Bug T110436 and shouldn't be used,
if you don't know, what you do. Moreover, this configuration variable will be
removed in the near future (hopefully).
* maxImages - if a page has more than this number of image tags then the formatter will not run
* maxHeadings - if a page has more than this number of heading tags then the formatter will not run
* excludeNamespaces - disable the MobileFormatter for these namespaces. Article HTML for mobile will be the same as desktop.

* Type: `Object`
* Default:
```php
[
	"excludeNamespaces": [
		10,
		-1
	],
	"maxImages": 1000,
	"maxHeadings": 4000,
	"headings": [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	]
]
```

#### $wgMFSiteStylesRenderBlocking

If set to true, styles inside MediaWiki:Mobile.css will become render blocking.

This is intended for situations where the [TemplateStyles extension](https://www.mediawiki.org/wiki/Extension:TemplateStyles)
cannot be used. When enabled, this may increase the time it takes for the mobile
site to render, depending on how large MediaWiki:Mobile.css is for your wiki.

* Type: `Boolean`
* Default: `false`

#### $wgMFCustomSiteModules

If set to true, MediaWiki:Mobile.css will be used instead of MediaWiki:Common.css and MediaWiki:<skinname>.css for mobile views.

This is intended for situations where the mobile site is on a different domain.

* Type: `Boolean`
* Default: `false`

#### $wgMFTrackBlockNotices

If set to true, block notices will be tracked on display, along with some limited
user interactions. Counts will be stored for later analysis. No personal data will
be collected.

* Type: `Boolean`
* Default: `false`

#### $wgMFMobileHeader

Requests containing header with this name will be considered as coming from
mobile devices.

* Type: `String`
* Default: `'X-Subdomain'`

#### $wgMFRemovableClasses

Make the classes, tags and ids stripped from page content configurable. Each
item will be stripped from the page.

* Type: `Array`
* Default:
```php
[
  // These rules will be used for all transformations in the beta channel of the site
	"beta": [],
  // These rules will be used for all transformations
	"base": [
		".navbox",
		".vertical-navbox",
		".nomobile"
	]
]
```

#### $wgMFLazyLoadImages

Do load images in pages lazily. Currently it doesn't affect HTML-only clients
(only JS capable ones) and it lazy loads images when they come close to the
viewport.

* Type: `Array`
* Default:
```php
  [
    // These will enable lazy loading images in beta mode
    'beta' => true,
    // These will enable lazy loading images in all modes
    'base' => true,
  ]
```

#### $wgMFSearchAPIParams

Define a set of params that should be passed in every gateway query.

* Type: `Array`
* Default:
```php
  [
    // See https://phabricator.wikimedia.org/T115646
    'ppprop' => 'displaytitle',
  ]
```

#### $wgMFQueryPropModules

Define a set of page props that should be associated with requests for pages
via the API.

* Type: `Array`
* Default: `['pageprops']`

#### $wgMFRSSFeedLink

Sets RSS feed `<link>` being outputted or not while on mobile version.

* Type: `Boolean`
* Default: `false`

#### $wgMFSearchGenerator

Define the generator that should be used for mobile search.

* Type: `Array`
* Default:
```php
  [
    'name' => 'prefixsearch',
    'prefix' => 'ps',
  ]
```

#### $wgMFMinCachedPageSize

Pages with smaller parsed HTML size are not cached.  Set to 0 to cache
everything or to some large value to disable caching completely.

* Type: `Integer`
* Default: `65536`

#### $wgMFAutodetectMobileView

Set this to true to automatically show mobile view depending on people's
user-agent.

*WARNING: Make sure that your caching infrastructure is configured
appropriately, to avoid people receiving cached versions of pages intended for
someone else's devices.*

* Type: `Boolean`
* Default: `true`

#### $wgMFVaryOnUA

Set this to `true`, if you want to send `User-Agent` in the `Vary` header. This
could improve your SEO ranking.

*WARNING: You should set this to true only, if you know what you're doing!*

*CAUTION: Setting this to true in combination with a (frontend)caching layer
(such as Varnish) can have a huge impact on how your caching works, as it now
caches every single page multiple times for any possible/different User Agent
string!*

* Type: `Boolean`
* Default: `false`

#### $wgMFShowMobileViewToTablets

Controls whether tablets should be shown the mobile site. Works only if
`$wgMFAutodetectMobileView` is `true`.

* Type: `Boolean`
* Default: `true`

#### $wgMobileUrlCallback

A callback that takes a domain name, and changes it into a mobile domain name.
When that is not possible, it should return its input unchanged. On wikifarms,
the domain name might belong to another wiki.

For mobile domains to work, some infrastructure outside MediaWiki needs to tag
requests sent to the mobile domain with the header specified by $wgMFMobileHeader.

* Type: `callable` (`string -> string`)
* Default: `null`

#### $wgMobileFrontendFormatCookieExpiry

The number of seconds the `useformat` cookie should be valid.

The useformat cookie gets set when a user manually elects to view either the
mobile or desktop view of the site.

If this value is not set, it will default to `$wgCookieExpiration`

* Type: `Integer|null`
* Default: `null`

#### $wgMFNoindexPages

Set to false to allow search engines to index your mobile pages. So far, Google
seems to mix mobile and non-mobile pages in its search results, creating
confusion.

* Type: `Boolean`
* Default: `true`

#### $wgMFStopRedirectCookieHost

Set the domain of the `stopMobileRedirect` cookie.

If this value is not set, it will default to the top domain of the host name
(e.g. `en.wikipedia.org = .wikipedia.org`)

If you want to set this to a top domain (to cover all subdomains), be sure to
include the preceding `.` (e.g. yes: `.wikipedia.org`, **no**: `wikipedia.org`)

* Type: `String|null`
* Default: `null`

#### $wgMFEnableBeta

Whether beta mode is enabled.

* Type: `Boolean`
* Default: `true`

#### $wgMFAdvancedMobileContributions

Whether Advanced mode is available for users.

* Type: `Boolean`
* Default: `true`

#### $wgMFAmcOutreach

Whether the AMC Outreach feature is available for users.

* Type: `Boolean`
* Default: `false`

#### $wgMFAmcOutreachMinEditCount

When Amc Outreach is enabled, this option sets the minimum number of edits a user must make before they are eligible to see the AMC Outreach feature.

* Type: `Number`
* Default: 100

#### $wgMFBetaFeedbackLink

Link to feedback page for beta features. If false no feedback link will be shown.

* Type: `String|false`
* Default: `false`

#### $wgDefaultMobileSkin

The default skin for MobileFrontend.

* Type: `String`
* Default: `'minerva'`

#### $wgMFNamespacesWithoutCollapsibleSections

In which namespaces sections shouldn't be collapsed.

* Type: `Array`
* Default:
```php
  [
    // Authorship and licensing information should be visible initially
    NS_FILE,
    // Otherwise category contents will be hidden
    NS_CATEGORY,
    // Don't collapse various forms
    NS_SPECIAL,
    // Just don't
    NS_MEDIA,
  ]
```

#### $wgMFCollapseSectionsByDefault

Controls whether to collapse sections by default.

Leave at default `true` for "encyclopedia style", where the section 0 lead text
will always be visible and subsequent sections may be collapsed by default.

In tablet sections will always be expanded by default regardless of this
setting.

Set to `false` for "dictionary style", sections are not collapsed.

* Type: `Boolean`
* Default: `true`

#### $wgMFUseWikibase

If set to true, the use Wikibase is enabled and associated features is enabled.
See `$wgMFDisplayWikibaseDescriptions`

* Type: `Boolean`
* Default: `false`

#### $wgMFEnableWikidataDescriptions

If set to true, wikidata descriptions as defined in $wgMFDisplayWikibaseDescriptions will show up
in the UI in the environment they have been told to target.

* Type: `Array`
* Default:
```php
  [
    'beta' => true,
    'base' => false,
  ]
```

#### $wgMFDisplayWikibaseDescriptions

Set which features will use Wikibase descriptions, e.g.

```php
$wgMFDisplayWikibaseDescriptions = [
  'search' => true,
  'watchlist' => false,
  'tagline' => true,
];
```

* Type: `Array`
* Default:
```php
  [
    'search' => false,
    'watchlist' => false,
    'tagline' => false,
  ]
```
#### $wgMFSpecialPageTaglines
Set taglines for special pages

```php
$wgMFSpecialPageTaglines = [
  "SpecialPageName" => "valid-message-key",
];
```

* Type: `Array`
* Default: `[]`

#### $wgMFNamespacesWithLeadParagraphs

A list of namespace codes that have lead paragraphs. Lead paragraphs will be
shown before infoboxes if `$wgMFShowFirstParagraphBeforeInfobox` is enabled.

* Type: `Array`
* Default:
```php
  [
    0
  ]
```

#### $wgMFStopMobileRedirectCookieSecureValue

The default value of the 'secure' cookie parameter that controls
MobileFrontend's mobile redirect behavior.  This variable defaults to true to
encourage the use of TLS on any servers hosting MediaWiki and to avoid the
disclosure of minor user privacy issues regarding a user's mobile browsing
preferences.

* Type: `Boolean`
* Default: `true`

#### $wgMFEditNoticesConflictingGadgetName

Internal name of the 'edit notices on mobile' gadget,
which conflicts with showEditNotices in EditorOverlay.
showEditNotices will not run when the user has this gadget enabled.

* Type: `string`
* Default: `"EditNoticesOnMobile"`

#### $wgMFEnableFontChanger

Enable the font-size options for users.

* Type: `Array`
* Default:
```php
[
	"base" => true,
	"beta" => true
]
```

#### $wgMFEnableManifest

Add a webapp-manifest link to mobile view output.

* Type: `Boolean`
* Default: `true`

#### $wgMFEnableVEWikitextEditor

Eanble VisualEditor's wikitext editor as a replacement for MobileFrontend's source editor.

* Type: `Boolean`
* Default: `false`

#### $wgMFLazyLoadSkipSmallImages

Skip lazy-loading transform on small-dimension images.

* Type: `Boolean`
* Default: `false`

#### $wgMFLogWrappedInfoboxes

Log when finding infoboxes wrapped with container.

* Type: `Boolean`
* Default: `true`

#### $wgMFManifestBackgroundColor

Background color to use in webapp-manifest.

* Type: `string`
* Default: `"#fff"`

#### $wgMFManifestThemeColor

Theme color to use in webapp-manifest.

* Type: `string`
* Default: `"#eaecf0"`

#### $wgMFShowFirstParagraphBeforeInfobox

Move first paragraph in articles to before infobox.

* Type: `Array`
* Default:
```php
[
	"base" => true,
	"beta" => true
]
```
