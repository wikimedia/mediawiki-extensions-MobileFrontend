Given(/^I click the edit icon holder$/) do
  on(ArticlePage).edit_button_holder_element.when_present.click
end

Then(/^there is not an upload an image to this page button$/) do
  on(ArticlePage).upload_button_element.should_not exist
end
