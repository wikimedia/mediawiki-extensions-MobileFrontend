class LoginPage
  include PageObject

  include URL
  page_url URL.url('Special:UserLogin')

  div(:feedback, class: 'errorbox')
  button(:login, id: 'wpLoginAttempt')
  text_field(:password, id: 'wpPassword1')
  text_field(:signup_password, id:'wpPassword2')
  text_field(:confirm_password, id:'wpRetype')
  a(:phishing, text: 'phishing')
  a(:password_strength, text: 'password strength')
  text_field(:username, id: 'wpName1')
  a(:login_wl, class: 'button')
  button(:signup_submit, id:'wpCreateaccount')

  def logged_in_as_element
    @browser.div(id: 'mw-content-text').p.b
  end
  def login_with(username, password)
    self.username = username
    self.password = password
    login
  end
end


