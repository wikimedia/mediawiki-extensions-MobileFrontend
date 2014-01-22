Given(/^I click edit$/) do
  on(ArticlePage).edit_button_element.when_present.click
end

Given(/^I type (.+) into the editor$/) do |text|
  on(ArticlePage).editor_text_area_element.when_present.send_keys(text)
end

Given(/^I click continue$/) do
  on(ArticlePage).continue_button_element.when_present.click
end

Given(/^I click submit$/) do
  on(ArticlePage).submit_button_element.when_present.click
end
