Then /^When I click Sign In I go to the Log In page$/ do
  on(LoginPage) do |page|
    page.login_wl_element.when_present.click
    page.text.should include "Sign in"
  end
end
