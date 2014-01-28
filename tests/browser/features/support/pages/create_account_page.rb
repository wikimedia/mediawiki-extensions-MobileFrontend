class CreateAccountPage
include PageObject

  text_field(:username_field, id: "wpName1")
  text_field(:password_field, id: "wpPassword2")
  text_field(:confirm_password_field, id: "wpRetype")
  button(:sign_up, id: "wpCreateaccount")
  div(:error_message, class: "alert error")
  text_field(:confirmation_field, id: "wpCaptchaWord")
  div(:refresh_captcha, id:"mf-captcha-reload-container")
end
