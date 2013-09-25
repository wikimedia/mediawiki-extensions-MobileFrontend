Given /^I am logged in as a new user$/ do
  visit(HomePage) do |page|
    page.mainmenu_button_element.when_present.click
    page.login_button
  end
  on(LoginPage) do |page|
    page.login_with("Selenium_newuser", "upl0adw1zard")
    if page.text.include? "There is no user by the name "
      puts "Selenium_newuser" + ' does not exist... trying to add user'
      on(HomePage).create_account_element.when_present.click
      on(LoginPage) do |page|
        page.username_element.element.when_present.set "Selenium_newuser"
        page.signup_password_element.element.when_present.set "upl0adw1zard"
        page.confirm_password_element.element.when_present.set "upl0adw1zard"
        page.signup_submit_element.element.when_present.click
        page.text.should include 'Welcome, ' + "Selenium_newuser" + '!'
        #Can't get around captcha in order to create a user
      end
    end
  end
end

When(/^I go to uploads page$/) do
  visit(UploadsPage)
end

Then(/^I see a blue tutorial screen$/) do
  on(UploadsPage).tutorial_element.when_present.should exist
end

Then(/^I see a next button$/) do
  on(UploadsPage).next_button_element.when_present.should exist
end
