Given(/^I can see the uploads interface$/) do
  on(UploadPage).contribute_image_element.when_present
end

Given(/^I click on the lead photo upload button$/) do
  on(ArticlePage).upload_page_action_element.when_present.click
end

When(/^I click Upload$/) do
  on(UploadPage).upload_button_element.when_present.click
end

When(/^I click the upload preview overlay close button$/) do
  on(ArticlePage).photo_overlay_close_button_element.when_present.click
end

When(/^I go to uploads page$/) do
  visit(UploadPage)
end

When(/^I type a description$/) do
  on(UploadPage).photo_description_element.when_present.send_keys("Describing with #{@random_string}")
end

When(/^I upload file "(.*?)"$/) do |file_name|
  on(UploadPage).select_file = File.join(Dir.pwd, 'features', 'support', file_name)
end

Then(/^I should be able to enter a description for my file upload$/) do
  expect(on(ArticlePage).photo_description_element.when_present).to be_visible
end

Then(/^I should not see the upload preview$/) do
  expect(on(ArticlePage).photo_overlay_element).not_to be_visible
end

Then(/^I should see an upload progress bar$/) do
  expect(on(ArticlePage).progress_header_element).to be_visible
end

Then(/^I should see the upload preview$/) do
  expect(on(ArticlePage).photo_overlay_element.when_present).to be_visible
end

Then(/^my image should be on the Uploads page$/) do
  on(UploadPage) do |page|
    page.wait_until(10) do
      page.text.include? "#{@random_string}" # Chrome needs this, FF does not
    end
    expect(page.uploaded_image_link_element.when_present.attribute('alt')).to match "#{@random_string}"
  end
end

Then(/^the Contribute an image button should be visible$/) do
  expect(on(UploadPage).contribute_image_element).to be_visible
end
