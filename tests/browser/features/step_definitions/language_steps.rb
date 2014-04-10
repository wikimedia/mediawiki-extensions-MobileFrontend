When /^I see the read in another language button$/ do
  on(ArticlePage).language_button_element.when_present.should be_visible
end

When /^I click the language button$/ do
  on(ArticlePage).language_button_element.when_present.click
end

Then(/^I see the language overlay$/) do
  on(ArticlePage).overlay_languages_element.when_present.class_name.should match "language-overlay"
end

When(/^I click the language overlay close button$/) do
  on(ArticlePage).overlay_languages_element.when_present.button_element(class: "cancel").click
end

Then(/^I don't see the languages overlay$/) do
  on(ArticlePage).overlay_languages_element.should_not be_visible
end

Then(/^I do not see the read in another language button$/) do
  on(ArticlePage).language_button_element.should_not be_visible
end
