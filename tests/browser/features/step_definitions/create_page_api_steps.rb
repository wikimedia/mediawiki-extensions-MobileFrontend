# export MEDIAWIKI_API_URL = http://en.wikipedia.beta.wmflabs.org/w/api.php

Given(/^I create a random page using the API$/) do
  abort "Environment variable MEDIAWIKI_API_URL must be set in order to create a target page for this test" if (ENV["MEDIAWIKI_API_URL"] == nil)
  client = MediawikiApi::Client.new(ENV["MEDIAWIKI_API_URL"])
  client.log_in(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
  client.create_page(@random_string, @random_string)
end

Given(/^I go to a page that has references$/) do
  abort "Environment variable MEDIAWIKI_API_URL must be set in order to create a target page for this test" if (ENV["MEDIAWIKI_API_URL"] == nil)
  client = MediawikiApi::Client.new(ENV["MEDIAWIKI_API_URL"])
  client.log_in(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
  wikitext = 'MobileFrontend is a MediaWiki extension.<ref>[http://mediawiki.org/wiki/Extension:MobileFrontend Extension:MobileFrontend]</ref>

==References==
<references />'
  client.create_page('Selenium References test page', wikitext)
  step 'I am on the "Selenium References test page" page'
end

Given(/^I go to a page that has sections$/) do
  abort "Environment variable MEDIAWIKI_API_URL must be set in order to create a target page for this test" if (ENV["MEDIAWIKI_API_URL"] == nil)
  client = MediawikiApi::Client.new(ENV["MEDIAWIKI_API_URL"])
  client.log_in(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
  wikitext = '==Section 1==
Hello world
'
  client.create_page('Selenium section test page', wikitext)
  step 'I am on the "Selenium section test page" page'
end

Given(/^I am on a page which has cleanup templates$/) do
    abort "Environment variable MEDIAWIKI_API_URL must be set in order to create a target page for this test" if (ENV["MEDIAWIKI_API_URL"] == nil)
    client = MediawikiApi::Client.new(ENV["MEDIAWIKI_API_URL"])
    client.log_in(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
    wikitext = 'This page is used by Selenium to test MediaWiki functionality.

<table class="metadata plainlinks ambox ambox-content ambox-Refimprove" role="presentation">
<tr><td class="mbox-image">[[File:Question_book-new.svg|thumb]]</td>
<td class="mbox-text"><span class="mbox-text-span">This article \'\'\'needs additional citations for [[Wikipedia:Verifiability|verification]]\'\'\'. <span class="hide-when-compact">Please help [//en.wikipedia.org/w/index.php?title=Doomsday_device&amp;action=edit improve this article] by [[Help:Introduction_to_referencing/1|adding citations to reliable sources]]. Unsourced material may be challenged and removed.</span> <small><i>(October 2012)</i></small></span></td>
</tr></table>'
    client.create_page('Selenium page issues test page', wikitext)
    step 'I am on the "Selenium page issues test page" page'
end
