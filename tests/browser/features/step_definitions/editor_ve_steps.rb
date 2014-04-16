Given(/^VisualEditor has loaded$/) do
  on(ArticlePage).editor_ve_element.when_present.should exist
end

Then(/^I see the VisualEditor$/) do
  on(ArticlePage).editor_ve_element.when_present.should exist
end

Then(/^I see the VisualEditor overlay$/) do
  on(ArticlePage).overlay_ve_element.when_present.should exist
end

Then(/^I do not see the VisualEditor overlay$/) do
  on(ArticlePage).overlay_ve_element.when_not_present(15)
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

Then(/^The VisualEditor overlay has an editor mode switcher button$/) do
  on(ArticlePage).overlay_editor_mode_switcher_element.when_present.should exist
end

Then(/^The wikitext editor overlay has an editor mode switcher button$/) do
  on(ArticlePage).overlay_editor_mode_switcher_element.when_present.should exist
end

Given(/^I type "(.+)" into VisualEditor$/) do |text|
  on(ArticlePage) do |page|
    page.editor_ve_element.when_present(15).fire_event("onfocus")
    page.editor_ve_element.when_present.send_keys(text)
  end
end

Given(/^I click the edit button for section (\d+)$/) do |arg1|
  on(ArticlePage).link_element(class: "edit-page", index: arg1.to_i).when_present.click
end
