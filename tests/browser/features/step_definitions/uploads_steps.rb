When(/^I click Submit$/) do
  on(UploadsPage).submit_button_element.when_present.click
end

When(/^I go to uploads page$/) do
  visit(UploadsPage)
end

When(/^I type a description$/) do
  on(UploadsPage).photo_description_element.when_present.send_keys("Describing with #{@random_string}")
end

When(/^I upload Mobile file (.+) on (.+)$/) do |file_name, page|
  require 'tempfile'
  path = "#{Dir.tmpdir}/#{file_name}"

  require 'chunky_png'
  ChunkyPNG::Image.new(Random.new.rand(255), Random.new.rand(255), Random.new.rand(255)).save path

  # FIXME: does this really work? can it accept a string?
  on(page).select_file_element.send_keys(path)
end

Then(/^my image is on the Uploads page$/) do
  on(UploadsPage) do |page|
	page.wait_until(10) do
      page.text.include? "#{@random_string}" #Chrome needs this, FF does not
    end
    page.uploaded_image_link_element.when_present.attribute( 'href' ).should match "#{@random_string}"
  end
end

Then(/^The Contribute an image button is visible$/) do
  on(UploadsPage).contribute_image_element.should be_visible
end

Then(/^The upload button links to the tutorial$/) do
  # use should match as href will be relative/absolute url
  on(UploadsPage).tutorial_link_element.when_present.attribute( 'href' ).should match "#/upload-tutorial/uploads$"
end

Then(/^I see the upload preview$/) do
  on(ArticlePage).photo_overlay_element.should be_visible
end

Then(/^I can enter a description for my file upload$/) do
  on(NonexistentPage).photo_description_element.when_present.should exist
end

When(/^I click the upload preview overlay close button and confirm$/) do
  on(ArticlePage).confirm(true) do
    on(ArticlePage).photo_overlay_close_button_element.click
  end
end

Then(/^I don't see the upload preview$/) do
  on(ArticlePage).photo_overlay_element.should_not be_visible
end
