When /^I click on the notification icon$/ do
  on(HomePage).notification_button_element.when_present.click
end

Then /^I go to the notifications page$/  do
  @browser.url.should match Regexp.escape('Special:Notifications')
end

