# FIXME: separate this into ArticlePage and LoginPage
class RandomPage < ArticlePage
  include PageObject

  include URL
  page_url URL.url("Special:Random")

  div(:login_text, class: "headmsg")
  div(:login_text_wl, id: "content")
end
