When(/^I clear the editor$/) do
  on(ArticlePage).editor_textarea_element.when_present.clear
end

When(/^I click the edit button$/) do
  sleep 1
  on(ArticlePage).edit_link_element.when_present.click
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

When(/^I click the wikitext editor overlay close button$/) do
  on(ArticlePage).editor_overlay_close_button_element.when_present.click
end

When(/^I do not see the wikitext editor overlay$/) do
  on(ArticlePage).editor_overlay_element.when_not_visible
end

When(/^I see the wikitext editor overlay$/) do
  on(ArticlePage).editor_textarea_element.when_present
end

When(/^I type "(.+)" into the editor$/) do |text|
  on(ArticlePage).editor_textarea_element.when_present.send_keys(text)
end

Then(/^I should not see the read in another language button$/) do
  expect(on(ArticlePage).language_button_element).not_to be_visible
end

Then(/^I should not see the wikitext editor overlay$/) do
  expect(on(ArticlePage).editor_overlay_element).not_to be_visible
end

Then /^I should see the read in another language button$/ do
  expect(on(ArticlePage).language_button_element.when_present).to be_visible
end
