Given(/^I click the edit icon holder$/) do
  on(ArticlePage).edit_button_holder_element.when_present.click
end

Then(/^I should not see an upload an image to this page button$/) do
  expect(on(ArticlePage).upload_button_element).not_to be_visible
end
