Then(/^The edit button is enabled$/) do
  on(ArticlePage).wait_until(5, "Edit button not enabled") do
    on(ArticlePage).edit_button_holder_element.when_present.class_name.should match "enabled"
  end
end

When(/^I click the edit button$/) do
  on(ArticlePage).edit_link_element.when_present.click
end

Then(/^I see the wikitext editor overlay$/) do
  on(ArticlePage).editor_textarea_element.when_present.should be_visible
end

When(/^I click the wikitext editor overlay close button$/) do
  on(ArticlePage).editor_overlay_close_button_element.click
end

Then(/^I should not see the wikitext editor overlay$/) do
  on(ArticlePage) do |page|
    page.wait_until do
      page.editor_overlay_element.visible? != true
      end
    page.editor_overlay_element.should_not be_visible
  end
end

When(/^I clear the editor$/) do
  on(ArticlePage).editor_textarea_element.when_present.clear
end

When(/^I click the editor mode switcher button$/) do
  on(ArticlePage).overlay_editor_mode_switcher_element.when_present.click
end

When(/^I click the source editor button$/) do
  on(ArticlePage).source_editor_button_element.when_present.click
end

When(/^I click the VisualEditor button$/) do
  on(ArticlePage).visual_editor_button_element.when_present.click
end

Given(/^I type "(.+)" into the editor$/) do |text|
  on(ArticlePage).editor_textarea_element.when_present.send_keys(text)
end
