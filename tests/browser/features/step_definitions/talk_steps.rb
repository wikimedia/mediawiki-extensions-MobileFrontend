When(/^I click the talk button$/) do
  on(ArticlePage).talk_element.when_present.click
end

Then(/^I should see the talk overlay$/) do
  expect(on(ArticlePage).overlay_heading_element.when_present.text).to match 'Talk'
end

Then(/^there should be no talk button$/) do
  expect(on(ArticlePage).talk_element).not_to be_visible
end
