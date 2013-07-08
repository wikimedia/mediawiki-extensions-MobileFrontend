When /^I select Uploads$/ do
  visit(HomePage).mainmenu_button_element.when_present.click
  on(RandomPage).uploads_link_element.when_present.click
end

Then /^I receive upload message (.+)$/ do |text|
  on(RandomPage).login_text_element.when_present.text.should == text
end

