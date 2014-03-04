When(/^I click on the main navigation button$/) do
  on(ArticlePage).mainmenu_button_element.when_present.click
end

When(/^I click on "(.*?)" in the main navigation menu$/) do |text|
  step 'I click on the main navigation button'
  on(ArticlePage).navigation_element.link_element(text: text).when_present.click
end
