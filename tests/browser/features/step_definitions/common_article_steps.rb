Given(/^I click edit$/) do
  on(ArticlePage).edit_button_element.when_present.click
end

Then(/^I see the VisualEditor$/) do
  on(ArticlePage).editor_ve_element.when_present.should exist
end

Given(/^I type (.+) into the editor$/) do |text|
  on(ArticlePage).editor_text_area_element.when_present.send_keys(text)
end

Then(/^I see the VisualEditor overlay$/) do
  on(ArticlePage).overlay_ve_element.when_present.should exist
end

Then(/^I see a toolbar in the overlay header$/) do
  on(ArticlePage).overlay_ve_header_toolbar_element.when_present.should exist
end

Then(/^The VisualEditor toolbar has a bold button$/) do
  on(ArticlePage).overlay_ve_header_toolbar_bold_button_element.when_present.should exist
end

Then(/^The VisualEditor toolbar has an italic button$/) do
  on(ArticlePage).overlay_ve_header_toolbar_italic_button_element.when_present.should exist
end

Given(/^I type (.+) into VisualEditor$/) do |text|
  on(ArticlePage) do |page|
    page.editor_ve_element.when_present(15).fire_event("onfocus")
    page.editor_ve_element.when_present.send_keys(text)
  end
end

Given(/^I click the escape button$/) do
  on(ArticlePage).escape_button_element.when_present.click
end

Given(/^I click continue$/) do
  on(ArticlePage).continue_button_element.when_present.click
end

Given(/^I click submit$/) do 
  on(ArticlePage) do |page|
    page.spinner_loading_element.when_not_present
    page.submit_button_element.when_present.click
  end
end

Then(/^I see a toast confirmation$/) do
  on(ArticlePage).toast_element.when_present.should be_visible
end

Then(/^The text of the first heading is "(.*)"$/) do |title|
  on(ArticlePage).first_heading_element.when_present.text.should match title
end
