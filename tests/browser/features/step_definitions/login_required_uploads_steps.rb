Then /^I receive upload message "(.+)"$/ do |text|
  on(RandomPage).login_text_element.text.should match Regexp.escape(text)
end

