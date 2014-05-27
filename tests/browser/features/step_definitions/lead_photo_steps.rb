When /^I click on the upload icon$/  do
 on(ArticlePage).upload_button_element.when_present.click
end

Then(/^there is an upload an image to this page button$/) do
  on(ArticlePage).upload_button_element.should exist
end

Then(/^the upload an image to this page button is enabled$/) do
  on(ArticlePage).upload_button_element.when_present.class_name.should match "enabled"
end

Then(/^the upload button in page actions links to the tutorial$/) do
  on(ArticlePage).tutorial_link_element.when_present.should exist
end
