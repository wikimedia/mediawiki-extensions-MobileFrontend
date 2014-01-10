class UserLoginPage
  include PageObject

  include URL
  def self.url
    URL.url("Special:UserLogin")
  end
  page_url url

  text_field(:username_field, id: "wpName1")
  text_field(:password_field, id: "wpPassword2")
  a(:create_account_link, text: "Create account")
end
