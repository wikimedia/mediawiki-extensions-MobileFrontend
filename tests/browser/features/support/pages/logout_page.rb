class LogoutPage
  include PageObject
  include URL
  page_url URL.url("Special:UserLogout")
end
