
Given(/^I can see the uploads interface$/) do
  on(UploadPage).contribute_image_element.when_present
end

Given(/^I click on the lead photo upload button$/) do
  on(ArticlePage).upload_page_action_element.when_present.click
end

When(/^I click Submit$/) do
  on(UploadPage).submit_button_element.when_present.click
end

When(/^I go to uploads page$/) do
  visit(UploadPage)
end

When(/^I type a description$/) do
  on(UploadPage).photo_description_element.when_present.send_keys("Describing with #{@random_string}")
end

Then(/^my image is on the Uploads page$/) do
  on(UploadPage) do |page|
    page.wait_until(10) do
      page.text.include? "#{@random_string}" #Chrome needs this, FF does not
    end
    page.uploaded_image_link_element.when_present.attribute( 'alt' ).should match "#{@random_string}"
  end
end

Then(/^the Contribute an image button is visible$/) do
  on(UploadPage).contribute_image_element.should be_visible
end

Then(/^the upload button links to the tutorial$/) do
  # use should match as href will be relative/absolute url
  on(UploadPage).tutorial_link_element.when_present.attribute( 'href' ).should match "#/upload-tutorial/uploads$"
end

Then(/^I see the upload preview$/) do
  on(ArticlePage).photo_overlay_element.when_present.should be_visible
end

Then(/^I can enter a description for my file upload$/) do
  on(ArticlePage).photo_description_element.when_present.should exist
end

When(/^I click the upload preview overlay close button$/) do
  on(ArticlePage).photo_overlay_close_button_element.when_present.click
end

Then(/^I don't see the upload preview$/) do
  on(ArticlePage).photo_overlay_element.should_not be_visible
end

Then(/^I see an upload progress bar$/) do
  on(ArticlePage).progress_header_element.should be_visible
end

When(/^I upload file "(.*?)"$/) do |file_name|
  on(UploadPage).select_file = File.join(Dir.pwd, "features", "support", file_name)
end
