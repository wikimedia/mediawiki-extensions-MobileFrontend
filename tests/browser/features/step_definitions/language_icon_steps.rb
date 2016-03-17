When /^I click the alternative language button$/ do
  on(ArticlePage).alternative_language_button_element.when_present.click
end

Then(/^I should see the disabled alternative language switcher button$/) do
  expect(on(ArticlePage).disabled_alternative_language_button_element).to be_visible
end

Then(/^I should see the alternative language switcher button$/) do
  expect(on(ArticlePage).alternative_language_button_element).to be_visible
end
