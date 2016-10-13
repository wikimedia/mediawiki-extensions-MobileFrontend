When(/^I click the language overlay close button$/) do
  on(ArticlePage).overlay_languages_element.when_present.button_element(class: 'cancel').click
end

When(/^I see the language overlay$/) do
  on(ArticlePage).overlay_languages_element.when_present
end

When /^I click on a language from the list of all languages$/ do
  on(ArticlePage).non_suggested_language_link_element.when_present.click
end

Then(/^I should see a toast with message about page not being available in other languages$/) do
  expect(on(ArticlePage).toast_element.when_present.text).to match 'This page is not available in other languages.'
end

Then(/^I should not see the languages overlay$/) do
  expect(on(ArticlePage).overlay_languages_element).not_to be_visible
end

Then(/^I should see the language overlay$/) do
  expect(on(ArticlePage).overlay_languages_element.when_present).to be_visible
end

Then(/^I should see a non-suggested language link$/) do
  expect(on(ArticlePage).non_suggested_language_link_element).to be_visible
end

Then(/^I should not see a suggested language link$/) do
  expect(on(ArticlePage).suggested_language_link_element).not_to be_visible
end

Then(/^I should see a suggested language link$/) do
  expect(on(ArticlePage).suggested_language_link_element).to be_visible
end
