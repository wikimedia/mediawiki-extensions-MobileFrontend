class SpecialUserLoginPage < ArticlePage
  include PageObject

  page_url 'Special:UserLogin'

  h1(:first_heading, id: 'section_0')

  button(:login, id: 'wpLoginAttempt')
  text_field(:username, name: 'wpName')
  text_field(:password, name: 'wpPassword')
  text_field(:confirm_password, id: 'wpRetype')
  a(:login_wl, class: 'button')
  button(:signup_submit, id: 'wpCreateaccount')
  a(:create_account_link, text: 'Create account')
  div(:message_box, class: 'warningbox')
  div(:error_box, class: 'errorbox')
  a(:password_reset, css: '.mw-userlogin-help')

  # signup specific
  text_field(:confirmation_field, id: 'wpCaptchaWord')
  div(:refresh_captcha, id: 'mf-captcha-reload-container')

  def login_with(username, password)
    # deal with autocomplete
    self.username_element.when_present.clear
    self.username = username
    self.password = password
    login
  end
end
