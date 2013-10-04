Then /^I should see the edit icon$/ do
  on(HomePage).edit_icon_element.when_present.should be_visible
end

Then /^I receive an upload error message$/ do
  on(HomePage).rl_notification_element.when_present.should be_visible
end
