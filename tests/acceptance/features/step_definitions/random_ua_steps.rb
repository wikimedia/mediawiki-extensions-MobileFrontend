Given /^that I am using (.+)$/ do |user_agent|
  @user_agent = user_agent
  @browser = browser(environment, test_name(@scenario), @saucelabs_username, @saucelabs_key, user_agent)
  @browser.window.resize_to(480, 800)
  $session_id = @browser.driver.instance_variable_get(:@bridge).session_id
end

Then(/^I see Home element$/) do
  on(RandomPage).home_button_element.style(:display).should == 'list-item'
end
Then(/^I see Random element$/) do
  on(RandomPage).random_button_element.style(:display).should == 'list-item'
end
Then(/^I see Settings element$/) do
  on(RandomPage).settings_button_element.style(:display).should == 'list-item'
end
Then(/^I do not see Watchlist element$/) do
  on(RandomPage).watchlist_button_element.style(:display).should == 'list-item'
end
Then(/^I do not see Uploads element$/) do
  on(RandomPage).uploads_button_element.style(:display).should == 'none'
end
Then(/^I do not see Login\/Logout element$/) do
  on(RandomPage).login_logout_button_element.style(:display).should == 'list-item'
end
Then(/^I see Watchlist element$/) do
  on(RandomPage).watchlist_button_element.style(:display).should == 'list-item'
end
Then(/^I see Uploads element$/) do
  on(RandomPage).uploads_button_element.style(:display).should == 'block'
end
Then(/^I see Login\/Logout element$/) do
  on(RandomPage).login_logout_button_element.style(:display).should == 'list-item'
end
Then /^I see that the correct user agent has been set$/ do
  @browser.execute_script('return navigator.userAgent').should == @user_agent
end
Then(/^I see the Go button$/) do
  on(RandomPage).go_button_element.should exist
end
Then(/^I see the Watchlist star$/) do
  on(HomePage).watch_link_element.should exist
end
