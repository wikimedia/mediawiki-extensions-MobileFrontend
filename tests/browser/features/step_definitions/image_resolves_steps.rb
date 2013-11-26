When /^I click on this image$/ do
  on(ArticlePage).springfield_image_element.when_present.click
end

When /^I expand Presidential Campaign Section$/ do
  on(ArticlePage).pres_campaign_section_element.when_present.click
end

Then /^I go to the image's page$/ do
  @browser.url.should match Regexp.escape("File:Flickr_Obama_Springfield_01.jpg")
end
