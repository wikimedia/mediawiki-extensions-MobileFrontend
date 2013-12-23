Given /^I am logged in as a new user$/ do
  visit(HomePage) do |page|
    page.mainmenu_button_element.when_present.click
    page.login_button
  end
  on(LoginPage).login_with("Selenium_newuser", ENV["MEDIAWIKI_PASSWORD"])
end

When(/^I click Submit$/) do
  on(UploadsPage).submit_button_element.when_present.click
end

When(/^I go to uploads page$/) do
  visit(UploadsPage)
end

When(/^I type a description$/) do
  on(UploadsPage).description_textarea_element.when_present.send_keys("Describing with #{@random_string}")
end

When(/^I upload Mobile file (.+)$/) do |file_name|
  require 'tempfile'
  path = "#{Dir.tmpdir}/#{file_name}"

  require 'chunky_png'
  ChunkyPNG::Image.new(Random.new.rand(255), Random.new.rand(255), Random.new.rand(255)).save path

  on(UploadsPage).select_file_element.send_keys(path)
end

Then(/^I see a blue tutorial screen$/) do
  on(UploadsPage).tutorial_element.when_present.should exist
end

Then(/^I see a next button$/) do
  on(UploadsPage).next_button_element.when_present.should exist
end

Then(/^my image is on the Uploads page$/) do
  on(UploadsPage) do |page|
	page.wait_until(10) do
      page.text.include? "#{@random_string}" #Chrome needs this, FF does not
    end
    page.uploaded_image_link_element.when_present.href.should match "#{@random_string}"
  end
end

Then(/^The Contribute an image button is visible$/) do
  on(UploadsPage).contribute_image_element.should be_visible
end
