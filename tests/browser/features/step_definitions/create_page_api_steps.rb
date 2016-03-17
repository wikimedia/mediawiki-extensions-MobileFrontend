# export MEDIAWIKI_API_URL = http://en.wikipedia.beta.wmflabs.org/w/api.php

Given(/^I create a random page using the API$/) do
  api.create_page @random_string, @random_string
end

Given(/^I go to a page that has references$/) do
  wikitext = "MobileFrontend is a MediaWiki extension.
{{#tag:ref|This is a note.<ref>This is a nested ref.</ref>|group=note}}
==Notes==
<references group=note />
==References==
<references/>
"

  api.create_page 'Selenium References test page', wikitext
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

  api.create_page 'Selenium section test page2', wikitext
  step 'I am on the "Selenium section test page2" page'
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
  api.create_page title, 'Test is used by Selenium web driver'
  step 'I am on the "' + title + '" page'
end

Given(/^at least one article with geodata exists$/) do
  api.create_page 'Selenium geo test page', <<-end
This page is used by Selenium to test geo related features.

{{#coordinates:43|-75|primary}}
  end
end

Given(/^I go to a page that has languages$/) do
  wikitext = 'This page is used by Selenium to test language related features.

[[es:Selenium language test page]]'

  api.create_page 'Selenium language test page', wikitext
  step 'I am on the "Selenium language test page" page'
end

Given(/^I go to a page that does not have languages$/) do
  wikitext = 'This page is used by Selenium to test language related features.'

  api.create_page 'Selenium language test page without languages', wikitext
  step 'I am on the "Selenium language test page without languages" page'
end

Given(/^the wiki has a terms of use$/) do
  api.create_page 'MediaWiki:mobile-frontend-terms-url', 'http://m.wikimediafoundation.org/wiki/Terms_of_Use'
  api.create_page 'MediaWiki:mobile-frontend-terms-text', 'Terms of use'
  # force a visit to check its existence
  visit(ArticlePage, using_params: { article_name: 'MediaWiki:Mobile-frontend-terms-url?action=info' })
end

Given(/^the page "(.*?)" exists and has at least "(\d+)" edits$/) do |title, min_edit_count|
  # Page must first exist before we can get edit count information
  step 'the page "' + title + '" exists'
  min_edit_count = min_edit_count.to_i
  visit(ArticlePage, using_params: { article_name: title.gsub(' ', '_') + '?action=info' })
  on(ArticlePage) do |page|
    (page.edit_count.gsub(',', '').to_i + 1).upto(min_edit_count) do |n|
      api.create_page title, "Test is used by Selenium web driver edit ##{n}"
    end
  end
end

Given(/^I visit a protected page$/) do
  api.create_page 'Selenium protected test 2', 'Test is used by Selenium web driver'
  step 'the "Selenium protected test 2" page is protected.'
  step 'I am on the "Selenium protected test 2" page'
end
