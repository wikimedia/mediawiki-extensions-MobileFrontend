Then(/^I see the KeepGoing drawer prompting me to continue editing$/) do
  on(ArticlePage).keep_going_element.when_present(10).should be_visible
end
