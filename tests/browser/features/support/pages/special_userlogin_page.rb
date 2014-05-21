class SpecialUserLoginPage < ArticlePage
  include PageObject

  include URL
  page_url URL.url("Special:UserLogin")

  div(:login_head_message, class: "headmsg")

  div(:feedback, class: "errorbox")
  button(:login, id: "wpLoginAttempt")
  text_field(:username, id: "wpName1")
  text_field(:password, name: "wpPassword")
  text_field(:confirm_password, id:"wpRetype")
  a(:login_wl, class: "button")
  button(:signup_submit, id:"wpCreateaccount")
  a(:create_account_link, text: "Create account")
  div(:message_box, class:"headmsg")
  a(:password_reset, css:".mw-userlogin-help")

  def login_with(username, password)
    # deal with autocomplete
    self.username_element.when_present.clear()
    self.username_element.when_present.send_keys(username)
    self.password_element.when_present.send_keys(password)
    login
  end

  # signup specific
  text_field(:confirmation_field, id: "wpCaptchaWord")
  div(:refresh_captcha, id:"mf-captcha-reload-container")
end
