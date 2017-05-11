Given(/^I have just signed up after trying to edit as anonymous$/) do
  step 'I am logged into the mobile website'
  api.create_page 'Selenium mobile signup edit tutorial test', 'signup edit tutorial test'
  visit(ArticlePage, using_params: { article_name: 'Selenium_mobile_signup_edit_tutorial_test?article_action=signup-edit' })
  on(ArticlePage).wait_until_rl_module_ready('skins.minerva.newusers')
end

Then(/^I should see the signup edit tutorial$/) do
  expect(on(ArticlePage).signup_edit_tutorial_element).to be_visible
end

Then(/^I should not see the signup edit tutorial$/) do
  expect(on(ArticlePage).signup_edit_tutorial_element).not_to be_visible
end
