Given(/^I click continue$/) do
  on(ArticlePage).continue_button_element.when_present.click
end

Given(/^I click submit$/) do
  on(ArticlePage) do |page|
    page.spinner_loading_element.when_not_present
    page.submit_button_element.when_present.click
  end
end

Given(/^I click the escape button$/) do
  on(ArticlePage).escape_button_element.when_present.click
end

Given(/^I switch to desktop$/) do
  on(ArticlePage).desktop_link_element.click
end

When(/^I click on the history link in the last modified bar$/) do
  on(ArticlePage).last_modified_bar_history_link_element.when_present.click
end

When(/^I click on the page$/) do
  on(ArticlePage).content_wrapper_element.click
end

When(/^I click the unwatch star$/) do
  on(ArticlePage).unwatch_star_element.when_present.click
end

When(/^I click the watch star$/) do
  on(ArticlePage).watch_star_element.when_present.click
end

Then(/^I should see a toast notification$/) do
  expect(on(ArticlePage).toast_element.when_present).to be_visible
end

Then(/^I should see a toast error$/) do
  expect(on(ArticlePage).toast_element.when_present.class_name).to match 'error'
end

Then /^I should see a drawer with message "(.+)"$/ do |text|
  expect(on(ArticlePage).drawer_element.when_present.text).to match text
end

Then(/^I should see the error box message "(.+)"$/) do |error_message|
  expect(on(ArticlePage).error_message).to match (error_message)
end

Then(/^the text of the first heading should be "(.*)"$/) do |title|
  on(ArticlePage) do |page|
    page.wait_until do
      page.first_heading_element.when_present.text.include? title
    end
    expect(page.first_heading_element.when_present.text).to match title
  end
end

Then /^the watch star should be selected$/ do
  expect(on(ArticlePage).unwatch_star_element).to be_visible
end

Then /^the watch star should not be selected$/ do
  expect(on(ArticlePage).watch_star_element).to be_visible
end
