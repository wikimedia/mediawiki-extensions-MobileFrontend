# Selenium tests

Please see tests/selenium/README.md file in mediawiki/core repository, usually at mediawiki/vagrant/mediawiki folder.

## Setup

Set up MediaWiki-Vagrant:

    cd mediawiki/vagrant
    vagrant up
    vagrant roles enable minerva
    vagrant provision
    cd mediawiki
    npm install

## Start Chromedriver and run all tests

Run both mediawiki/core and extension tests from mediawiki/core repository (usually at mediawiki/vagrant/mediawiki folder):

    npm run selenium

## Start Chromedriver

To run only some tests, you first have to start Chromedriver in one terminal tab (or window):

    chromedriver --url-base=wd/hub --port=4444

## Run test(s) from one file

Then, in another terminal tab (or window) run this from mediawiki/core repository (usually at mediawiki/vagrant/mediawiki folder):

    npm run selenium-test -- --spec tests/selenium/specs/FILE-NAME.js

`wdio` is a dependency of mediawiki/core that you have installed with `npm install`.

## Run specific test(s)

To run only test(s) which name contains string TEST-NAME, run this from mediawiki/core repository (usually at mediawiki/vagrant/mediawiki folder):

    ./node_modules/.bin/wdio tests/selenium/wdio.conf.js --spec extensions/EXTENSION-NAME/tests/selenium/specs/FILE-NAME.js --mochaOpts.grep TEST-NAME

Make sure Chromedriver is running when executing the above command.

## Run tests against the beta cluster
Command-line options can be specified that override the wdio.conf.js config file. This makes it easy to run tests against a different url without touching the config. If you're running MediaWiki on a different host/post or with a different user/password, this is how you supply those arguments:

```
MEDIAWIKI_PASSWORD=<password> MEDIAWIKI_USER="<username>"  MW_SERVER=<server> npm run selenium-test
```
To run tests as the Selenium user on the beta cluster, visit this page to get the "Selenium user" password and run the tests with these arguments.

```
MEDIAWIKI_PASSWORD=<password> MEDIAWIKI_USER="Selenium user"  MW_SERVER=https://en.wikipedia.beta.wmflabs.org npm run selenium-test
```


## Step 2 - add boilerplate for missing steps
Run the feature in cucumber
```
npm run selenium-test-cucumber -- --spec tests/selenium/features/<name>.feature
```

You will get warnings such as:
```
Step "I go to a page that has languages" is not defined. You can ignore this error by setting cucumberOpts.ignoreUndefinedDefinitions as true.
```

For each missing step define them as one liners inside selenium/features/step_definitions/index.js

Create functions with empty bodies for each step.

Function anmes should be camel case without space, for example, `I go to a page that has languages` becomes `iGoToAPageThatHasLanguages`. Each function should be imported from a step file inside the features/step_definitions folder.

Re-reun the test. If done correctly this should now pass.

Example: https://gerrit.wikimedia.org/r/#/c/mediawiki/skins/MinervaNeue/+/501792/1..2

## Step 3 - copy across Ruby function bodies

Copy across the body of the Ruby equivalent inside each function body in tests/browser/features/step_definitions as comments.

Example: https://gerrit.wikimedia.org/r/#/c/mediawiki/skins/MinervaNeue/+/501792/2..3

## Step 4 - rewrite Ruby to Node.js

Sadly there is no shortcut here. Reuse as much as you can. Work with the knowledge that the parts you are adding will aid the next browser test migration.

The docs are your friend: http://v4.webdriver.io/api/utility/waitForVisible.html

Example: https://gerrit.wikimedia.org/r/#/c/mediawiki/skins/MinervaNeue/+/501792/2..4

## Step 5 - Make it work without Cucumber

Now the tests should be passing when run the browser tests using wdio.conf.cucumber.js or `npm run selenium-test-cucumber`

The final step involves making these run with
`npm run selenium-test`

This is relatively straightforward and mechanical.

1) Copy the feature file to the specs folder
```
cp tests/selenium/features/editor_wikitext_saving.feature tests/selenium/specs/editor_wikitext_saving.js
```
2) Convert indents to tabs
3) Add `//` before any tags
4) Replace `Scenario: <name>` with `it( '<name>', () => {`
5) Add closing braces for all scenarios: `  } );`
6) Replace `Feature: <feature>` with `describe('<feature>)', () => {` and add closing brace.
7) Replace `Background:` with `beforeEach( () => {` and add closing brace.
8) Find and replace `Given `, `When `, `And `, `Then ` with empy strings.
9) At top of file copy and paste imports from `selenium/features/step_definitions/index.js` to top of your new file and rewrite their paths.
10) Relying on autocomplete (VisualStudio Code works great) replace all the lines with the imports
11) Drop unused imports from the file.
