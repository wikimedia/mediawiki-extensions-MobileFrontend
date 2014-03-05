class LoginPage
  include PageObject

  include URL
  page_url URL.url("Special:UserLogin")

  div(:login_head_message, class: "headmsg")

  div(:feedback, class: "errorbox")
  button(:login, id: "wpLoginAttempt")
  text_field(:password, id: "wpPassword1")
  text_field(:signup_password, id:"wpPassword2")
  text_field(:confirm_password, id:"wpRetype")
  a(:phishing, text: "phishing")
  a(:password_strength, text: "password strength")
  text_field(:username, id: "wpName1")
  a(:login_wl, class: "button")
  button(:signup_submit, id:"wpCreateaccount")
  a(:create_account_link, text: "Create account")
  div(:message_box, class:"headmsg")
  div(:warning_box, class:"alert warning")
  a(:password_reset, css:".mw-userlogin-help")

  def login_with(username, password)
    # deal with autocomplete
    self.username_element.when_present.clear()
    self.username_element.when_present.send_keys(username)
    self.password_element.when_present.send_keys(password)
    login
  end
end
