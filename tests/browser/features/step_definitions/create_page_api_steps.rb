# export MEDIAWIKI_API_URL = http://en.wikipedia.beta.wmflabs.org/w/api.php

Given(/^I create a random page using the API$/) do
  on(APIPage).create @random_string, @random_string
end

Given(/^I go to a page that has references$/) do
  wikitext = "MobileFrontend is a MediaWiki extension.<ref>Test reference</ref>

==References==
<references />"

  on(APIPage).create 'Selenium References test page', wikitext
  step 'I am on the "Selenium References test page" page'
end

Given(/^I go to a page that has sections$/) do
  wikitext = "==Section 1==
Hello world
== Section 2 ==
Section 2.
=== Section 2A ===
Section 2A.
== Section 3 ==
Section 3.
"

  on(APIPage).create 'Selenium section test page', wikitext
  step 'I am on the "Selenium section test page" page'
end

Given(/^I am on a page which has cleanup templates$/) do
  wikitext = <<-END.gsub(/^ */, '')
      This page is used by Selenium to test MediaWiki functionality.

      <table class="metadata plainlinks ambox ambox-content ambox-Refimprove" role="presentation">
        <tr>
          <td class="mbox-image">[[File:Question_book-new.svg|thumb]]</td>
          <td class="mbox-text">
            <span class="mbox-text-span">This article \'\'\'needs additional citations for [[Wikipedia:Verifiability|verification]]\'\'\'. <span class="hide-when-compact">Please help [[Selenium page issues test page#editor/0|improve this article]] by [[Help:Introduction_to_referencing/1|adding citations to reliable sources]]. Unsourced material may be challenged and removed.</span> <small><i>(October 2012)</i></small></span>
          </td>
        </tr>
      </table>
    END

  api.create_page 'Selenium page issues test page', wikitext
  step 'I am on the "Selenium page issues test page" page'
end

Given(/^the page "(.*?)" exists$/) do |title|
  on(APIPage).create title, 'Test is used by Selenium web driver'
  step 'I am on the "' + title + '" page'
end

Given(/^at least one article with geodata exists$/) do
  on(APIPage).create 'Selenium geo test page', <<-end
This page is used by Selenium to test geo related features.

{{#coordinates:43|-75|primary}}
  end
end

Given(/^I go to a page that has languages$/) do
  wikitext = 'This page is used by Selenium to test language related features.

[[es:Selenium language test page]]'

  on(APIPage).create 'Selenium language test page', wikitext
  step 'I am on the "Selenium language test page" page'
end

Given(/^the wiki has a terms of use$/) do
  on(APIPage).create 'MediaWiki:mobile-frontend-terms-url', 'Terms_of_use'
  on(APIPage).create 'MediaWiki:mobile-frontend-terms-text', 'Terms of use'
end

Given(/^the page "(.*?)" exists and has at least "(\d+)" edits$/) do |title, min_edit_count|
  # Page must first exist before we can get edit count information
  step 'the page "' + title + '" exists'
  min_edit_count = min_edit_count.to_i
  visit(ArticlePage, using_params: { article_name: title + '?action=info' })
  on(ArticlePage) do |page|
    (page.edit_count.gsub(',', '').to_i + 1).upto(min_edit_count) do |n|
      on(APIPage).create title, "Test is used by Selenium web driver edit ##{n}"
    end
  end
end

Given(/^I visit a protected page$/) do
  on(APIPage).create 'Selenium protected test 2', 'Test is used by Selenium web driver'
  step 'the "Selenium protected test 2" page is protected.'
  step 'I am on the "Selenium protected test 2" page'
end
