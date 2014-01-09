Then(/^There is an upload an image to this page button$/) do
  on(NonexistentPage).upload_button_element.should exist
end

Then(/^The upload an image to this page button is enabled$/) do
  on(NonexistentPage).upload_button_element.when_present.class_name.should match "enabled"
end

Then(/^The upload button in page actions links to the tutorial$/) do
  on(NonexistentPage).tutorial_link_element.when_present.should exist
end


