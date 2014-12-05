When(/^I sign up with two different passwords$/) do
  on(SpecialUserLoginPage) do |page|
    page.username = 'some_username'
    page.password = 's0me decent password'
    page.confirm_password = 's0me wrong password'
    page.signup_submit
  end
end

Then(/^I should see an error indicating they do not match$/) do
  expect(on(SpecialUserLoginPage).feedback).to match('The passwords you entered do not match')
end

Then(/^I should still be on the sign-up page$/) do
  expect(on(SpecialUserLoginPage).first_heading).to match('Create account')
end
