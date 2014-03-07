# FIXME: This is misleading - in fact means the message box on Special:UserLogin
Then /^I receive watchlist message (.+)$/ do |text|
  on(RandomPage).login_text_wl_element.when_present.text.should match text
end
