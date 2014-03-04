# FIXME: Move into a generic page_action_steps.rb
When(/^I click the watch star$/) do
  on(ArticlePage).watch_link_element.when_present.click
end

# FIXME: This is misleading - in fact means the message box on Special:UserLogin
Then /^I receive watchlist message (.+)$/ do |text|
  on(RandomPage).login_text_wl_element.when_present.text.should match text
end
