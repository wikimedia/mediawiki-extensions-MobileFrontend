Then(/^There is an upload an image to this page button$/) do
  on(LeadPhotoPage).upload_button_element.should exist
end

Then(/^The upload an image to this page button is enabled$/) do
  on(LeadPhotoPage).upload_button_element.when_present.class_name.should match "enabled"
end

Then(/^The upload button in page actions links to the tutorial$/) do
  on(LeadPhotoPage).tutorial_link_element.when_present.should exist
end

Then(/^I see the upload overlay$/) do
  on(LeadPhotoPage).upload_overlay_element.when_present.should exist
end

Then(/^I see the old upload overlay$/) do
  on(LeadPhotoPage).old_upload_overlay_element.when_present.should exist
end

Then(/^I can enter a description for my file upload$/) do
  on(LeadPhotoPage).description_textarea_element.when_present.should exist
end
