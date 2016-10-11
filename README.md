MobileFrontend Extension
========================

The MobileFrontend extension adds a mobile view to your mediawiki instance.

Installation
------------

See <https://www.mediawiki.org/wiki/Extension:MobileFrontend#Installation>

Development
-----------

### Coding conventions

Please follow the coding conventions of MobileFrontend:
<https://www.mediawiki.org/wiki/MobileFrontend/Coding_conventions>

#### Git hooks

Git hooks are provided in the dev-scripts directory to assist with adhering to
JavaScript code standards, optimizing PNG files, etc. Running these hooks
requires node.js, NPM, and grunt.

Install like so:

    make installhooks

If you are not running Vagrant, be sure to set your `MEDIAWIKI_URL` env
variable to your local index path, e.g.
`MEDIAWIKI_URL=http://localhost/index.php/`

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

    make tests

To run only PHP tests:

    make phpunit

To run only JS tests:

    make qunit

#### Selenium tests

For information on how to run Selenium tests please see README file in
tests/browser directory.

### Releasing

A new version of MobileFrontend is released every two weeks following the
Wikimedia release train if there are new changes.

MobileFrontend follows the version naming from MediaWiki.

Configuration options
---------------------

#### $wgMFEnableXAnalyticsLogging

Whether or not to enable the use of the X-Analytics HTTP response header.  This
header is used for analytics purposes.

See: https://www.mediawiki.org/wiki/Analytics/Kraken/Data_Formats/X-Analytics

* Type: `Boolean`
* Default: `false`

#### $wgMinervaAlwaysShowLanguageButton

Whether to show the language switcher button even if no languages are available
for the page.

* Type: `Boolean`
* Default: `true`

#### $wgMFAppPackageId

ID of the App to deep link to replacing the browser. Set `false` to have no
such link.

See: <https://developers.google.com/app-indexing/webmasters/details>

* Type: `Boolean|String`
* Default: `false`

#### $wgMFAppScheme

Scheme to use for the deep link.

* Type: `String`
* Default: `'http'`

#### $wgMFEditorOptions

Options to control several functions of the mobile editor.  Possible values:

* `anonymousEditing`:
  Whether or not anonymous (not logged in) users should be able to edit.  Note
  this is highly experimental and comes without any warranty and may introduce
  bugs until anonymous editing experience is addressed in this extension.
  Anonymous editing on mobile is still a big unknown. See bug 53069.  Thoughts
  welcomed on
  <https://www.mediawiki.org/wiki/Mobile_wikitext_editing#Anonymous_editing>
* `skipPreview`: Should the mobile edit workflow contain an edit preview
  (before save) to give the user the possibility to review the new text
  resulting of his changes or not.


* Type: `Array`
* Default:
```php
  [
    'anonymousEditing' => true,
    'skipPreview' => false,
  ]
```

#### $wgMFIgnoreEventLoggingBucketing

Disable EventLogging bucketing for purposes of development.  When enabled all
events are logged regardless of any existing sampling rate specified in the
schema.

* Type: `Boolean`
* Default: `false`

#### $wgMFExperiments

A list of experiments active on the skin.

* Type: `Array`
* Default:
```php
  [
    // Experiment to prompts users to opt into the beta experience of the skin.
    'betaoptin' => [
      'name' => 'betaoptin',
      'enabled' => false,
      'buckets' => [
        'control' => 0.97,
        'A' => 0.03,
      ],
    ],
  ]
```

#### $wgMFEnableMinervaBetaFeature

Controls whether the "Minerva as a desktop skin" beta feature is enabled.

* Type: `Boolean`
* Default: `false`

#### $wgMFEnableJSConsoleRecruitment

Controls whether a message should be logged to the console to attempt to
recruit volunteers.

* Type: `Boolean`
* Default: `false`

#### $wgMFIsBannerEnabled

Whether or not the banner experiment is enabled.

See: <https://www.mediawiki.org/wiki/Reading/Features/Article_lead_image>

* Type: `Boolean`
* Default: `true`

#### $wgMFMobileFormatterHeadings

This is a list of html tags, that could be recognized as the first heading of
a page.  This is an interim solution to fix Bug T110436 and shouldn't be used,
if you don't know, what you do. Moreover, this configuration variable will be
removed in the near future (hopefully).

* Type: `Array`
* Default: `['h1', 'h2', 'h3', 'h4', 'h5', 'h6']`

#### $wgMFSpecialCaseMainPage

If set to true, main page HTML will receive special massaging.

See <https://m.mediawiki.org/wiki/Mobile_Gateway/Mobile_homepage_formatting>

Use is discouraged as it leads to unnecessary technical debt and on the long
term the goal is to deprecate usage of this config variable. Use at your own
risk!

* Type: `Boolean`
* Default: `false`

#### $wgMinervaEnableSiteNotice

Controls whether site notices should be shown.
See <https://www.mediawiki.org/wiki/Manual:$wgSiteNotice>.

* Type: `Boolean`
* Default: `false`

#### $wgMFTidyMobileViewSections

Controls whether API `action=mobileview` should have every HTML section tidied
for invalid markup.

* Type: `Boolean`
* Default: `true`

#### $wgMFMobileHeader

Requests containing header with this name will be considered as coming from
mobile devices.

* Type: `String`
* Default: `'X-Subdomain'`

#### $wgMinervaUseFooterV2

A temporary configuration variable to control display of a new footer which impacts styling
of the last modified bar and with a slight different arrangement of footer icons.

The config variable currently controls whether the styles and template for new footer should be invoked.
Enabling this in current state will break rendering of footer in stable.

* Type: `Boolean`
* Default: `false`

#### $wgMFRemovableClasses

Make the classes, tags and ids stripped from page content configurable. Each
item will be stripped from the page.

* Type: `Array`
* Default:
```php
  [
    // These rules will be used for all transformations in the beta channel of the site
    'beta' => [],
    // These rules will be used for all transformations
    'base' => [],
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
    'beta' => false,
    // These will enable lazy loading images in all modes
    'base' => false,
  ]
```

#### $wgMFNoMobileCategory

DB key of the category which members will never display mobile view.

* Type: `Boolean`
* Default: `false`

#### $wgMFNoMobilePages

Prefixed names of pages that will never display mobile view.

* Type: `Array`
* Default: `[]`

#### $wgMFNearbyRange

The range in meters that should be searched to find nearby pages on
*Special:Nearby* (defaults to 10km).

* Type: `Integer`
* Default: `10000`

#### $wgMFNearby

Whether geodata related functionality should be enabled.

* Type: `Boolean`
* Default: `false`

#### $wgMFNearbyEndpoint

An optional alternative api to query for nearby pages, e.g.
<https://en.m.wikipedia.org/w/api.php>

If set forces nearby to operate in JSONP mode.

* Type: `String`
* Default: `''`

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


#### $wgMinervaPageActions

Controls which page actions, if any, are displayed. Allowed: `edit`, `watch`, `talk`, and
`switch-language`.

* Type: `Array`
* Default: `['edit', 'talk', 'watch', 'switch-language']`

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
* Default: `64 * 1024`

#### $wgMFAutodetectMobileView

Set this to true to automatically show mobile view depending on people's
user-agent.

*WARNING: Make sure that your caching infrastructure is configured
appropriately, to avoid people receiving cached versions of pages intended for
someone else's devices.*

* Type: `Boolean`
* Default: `false`

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

#### $wgMFDeviceWidthMobileSmall

Devices with available screen of this value and less will have some styles
adapted for improved reading on small screens.

* Type: `Integer`
* Default: `280`

#### $wgMFDeviceWidthTablet

Minimum available screen width at which a device can be considered
a tablet/desktop.

* Type: `Integer`
* Default: `768`

#### $wgMobileUrlTemplate

Template for mobile URLs.

This will be used to transcode regular URLs into mobile URLs for the mobile
view.

It's possible to specify the *mobileness* of the URL in the host portion of the
URL.

You can either statically or dynamically create the host-portion of your mobile
URL. To statically create it, just set `$wgMobileUrlTemplate` to the static
hostname. For example:

```php
$wgMobileUrlTemplate = "mobile.mydomain.com";
```

Alternatively, the host definition can include placeholders for different parts
of the *host* section of a URL. The placeholders are denoted by `%h` and
followed with a digit that maps to the position of a host-part of the original,
non-mobile URL. Take the host `en.wikipedia.org` for example.  `%h0` maps to
`en`, `%h1` maps to `wikipedia`, and `%h2` maps to `org`.  So, if you wanted
a mobile URL scheme that turned `en.wikipedia.org` into `en.m.wikipedia.org`,
your URL template would look like:

    %h0.m.%h1.%h2

* Type: `String`
* Default: `''`

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

#### $wgMFCustomLogos

Make the logos configurable.

Currently, `copyright`, `copyright-width`, and `copyright-height` elements are
supported.

* `copyright` is the URL of the logo displayed in the footer
* `copyright-width` (optional) is the width in pixels of the copyright image
  you want to display
* `copyright-height` (optional) is the height in pixels of the copyright image
  you want to display
* If the actual `copyright` dimensions are 200x30, then you may want to set the
  width and height to 100 and 15 respectively (in order to support retina
  screens).

Example:
```php
[
  'copyright' => '/images/mysite_copyright_logo.png',
  'copyright-width' => 100,
  'copyright-height' => 15,
]
```

* Type: `Array`
* Default: `[]`

#### $wgMobileFrontendLogo

Path to the logo used in the login/signup form.  The standard height is `72px`
(FIXME: Merge with `$wgMFCustomLogos`)

* Type: `Boolean`
* Default: `false`

#### $wgMFTrademarkSitename

Whether to append a trademark notice to the sitename in the page footer.

* If set to `true` or `'unregistered'`, adds a ™ to the sitename.
* If set to `'registered'` adds a ® to the sitename.
* If set to `false`, adds nothing (the default).

Alternatively, you can also edit the `mobile-frontend-footer-sitename`
message directly.

* Type: `Boolean`
* Default: `false`

#### $wgMFEnableBeta

Whether beta mode is enabled.

* Type: `Boolean`
* Default: `false`

#### $wgMFDonationUrl

Optional string to mobile friendly url for donation page.

* Type: `Boolean`
* Default: `false`

#### $wgMFContentNamespace

The content namespace(s) that *Special:Nearby* and *Special:Random* should use.
Should be one or more of `NS_*` constants, pipe-separated.

* Type: `Integer|String`
* Default: `NS_MAIN`

#### $wgMFDefaultSkinClass

The default skin for MobileFrontend.

* Type: `String`
* Default: `'SkinMinerva'`

#### $wgMinervaAlwaysShowLanguageButton

Whether to show the language switcher button even if no languages are available for the page.

* Type: `Boolean`
* Default: `true`


#### $wgMFNamespacesWithoutCollapsibleSections

In which namespaces sections shoudn't be collapsed.

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

Set to `false` for "dictionary style", sections are not collapsed.

* Type: `Boolean`
* Default: `true`

#### $wgMFPhotoUploadWiki

The wiki id/dbname for where photos are uploaded, if photos are uploaded to
a wiki other than the local wiki (eg commonswiki).

* Type: `String|null`
* Default: `null`

#### $wgMFPhotoUploadEndpoint

An api to which any photos should be uploaded.
e.g. `$wgMFPhotoUploadEndpoint = 'https://commons.wikimedia.org/w/api.php';`

* Type: `String`
* Default: Defaults to the current wiki

#### $wgMFUseWikibaseDescription (deprecated)

See `$wgMFUseWikibase`

#### $wgMFDisplayWikibaseDescription (deprecated)

See `$wgMFDisplayWikibaseDescriptions`

#### $wgMFDisplayWikibaseDescriptionsAsTaglines (deprecated)

See `$wgMFDisplayWikibaseDescriptions`

#### $wgMFUseWikibase

If set to true, the use Wikibase is enabled and associated features is enabled.
See `$wgMFDisplayWikibaseDescriptions`

* Type: `Boolean`
* Default: `false`

#### $wgMFDisplayWikibaseDescriptions

Set which features will use Wikibase descriptions, e.g.

```php
$wgMFDisplayWikibaseDescriptions = [
  'search' => true,
  'nearby' => true,
  'watchlist' => false,
  'tagline' => true,
];
```

* Type: `Array`
* Default:
```php
  [
    'search' => false,
    'nearby' => false,
    'watchlist' => false,
    'tagline' => false,
  ]
```

#### $wgMFStripResponsiveImages

Whether to strip `srcset` attributes from all images on mobile renderings. This
is a sort of brute-force bandwidth optimization at the cost of making images
fuzzier on most devices.

* Type: `Boolean`
* Default: `true`

#### $wgMFResponsiveImageWhitelist

Whitelist of source file mime types to retain srcset attributes on when using
$wgMFStripResponsiveImages. Defaults to allow rasterized SVGs since they
usually are diagrams that compress well and benefit from the higher resolution.

* Type: `Array`
* Default:
```php
  [
    "image/svg+xml",
  ]
```
