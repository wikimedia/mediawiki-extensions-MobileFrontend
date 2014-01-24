Given(/^I click edit$/) do
  on(ArticlePage).edit_button_element.when_present.click
end

Given(/^I type (.+) into the editor$/) do |text|
  on(ArticlePage).editor_text_area_element.when_present.send_keys(text)
end

Given(/^I type (.+) into VisualEditor$/) do |text|
  on(ArticlePage) do |page|
    page.editor_ve_element.when_present.fire_event("onfocus")
    page.editor_ve_element.when_present.send_keys(text)
  end
end

Given(/^I click continue$/) do
  on(ArticlePage).continue_button_element.when_present.click
end

Given(/^I click submit$/) do
  # In VE the submit button takes a while to become enabled while it prepares for a save
  # according to Jeff this is the best way to get round this
  # FIXME: Must be a more elegant way?
  try = 10
  try.times do
    begin
      on(ArticlePage).submit_button_element.when_present.click
    rescue
    end
  end
end

Then(/^I see a toast confirmation$/) do
  on(ArticlePage).toast_element.when_present.should be_visible
end
