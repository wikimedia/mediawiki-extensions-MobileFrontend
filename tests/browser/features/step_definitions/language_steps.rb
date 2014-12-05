When /^I click the language button$/ do
  on(ArticlePage).language_button_element.when_present.click
end

When(/^I click the language overlay close button$/) do
  on(ArticlePage).overlay_languages_element.when_present.button_element(class: 'cancel').click
end

When(/^I see the language overlay$/) do
  on(ArticlePage).overlay_languages_element.when_present
end

Then(/^I should not see the languages overlay$/) do
  expect(on(ArticlePage).overlay_languages_element).not_to be_visible
end
