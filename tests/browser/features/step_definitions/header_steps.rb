
When /^I click the edit icon$/  do
 on(HomePage).edit_icon_element.when_present.click
end

Then /^I receive edit icon message (.+)$/  do |text|
  on(HomePage).fe_notification_element.when_present.text.should match text
end

When /^I click on the upload icon$/  do
 on(HomePage).upload_icon_element.when_present.click
end

Then /^I receive upload icon message (.+)$/  do  |text|
  on(HomePage).rl_notification_element.when_present.text.should match text
end

When /^I click on watchlist icon$/  do
  on(HomePage).watch_link_element.when_present.click
end

Then /^I receive watchlist icon message (.+)$/ do |text|
  on(HomePage).fe_notification_element.when_present.text.should match text
end


