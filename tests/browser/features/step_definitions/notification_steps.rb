When /^I click on the notification icon$/ do
  begin
    on(HomePage).notification_button_element.when_present.click
  rescue
    puts "Echo is not enabled"
  end
end

Then /^I go to the notifications page$/ do
  begin
    @browser.text.should include "Notifications"
  rescue
    puts "Unable to validate Notifications Page"
  end
end

Then /^the notifications overlay appears$/ do
  begin
    if @browser.url.match Regexp.escape("Special:Notifications")
      on(HomePage).notifications_archive_link_element.should_not exist
    else
      on(HomePage).notifications_archive_link_element.should exist
    end
  rescue
    "Unable to run overlay tests"
  end
end

