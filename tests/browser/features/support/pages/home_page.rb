# FIXME: Deprecate in favour of Article Page
class HomePage < ArticlePage
  include PageObject

  include URL
  def self.url
    URL.url("Main_Page")
  end
  page_url url

  a(:about_link, text: "About")
  a(:content_link, href: "//creativecommons.org/licenses/by-sa/3.0/")
  a(:contrib_link, text: "contributors")
  a(:desktop_link, text: "Desktop")
  a(:disclaimer_link, text: "Disclaimers")
  a(:login_button, href: /Special:UserLogin/)
  div(:main_page, id: "mainpage")
  span(:mobile_select, text: "Mobile")
  button(:openfooter_button, class:   "openSection")
  a(:privacy_link, text: "Privacy")
  form(:search_form, id: "mw-mf-searchForm")
  a(:sign_up, text: "Sign up")
  a(:terms_link, text: "Terms of use")
  text_field(:search_box, name: "search")
  form(:search_form, id: "mw-mf-searchForm")
  li(:search_results, title: "San Francisco")
  a(:search_result) do |page|
    page.search_results_element.a
  end
  a(:create_account, class: "mw-mf-create-account")

  a(:language_button, text: "Read in another language")
  div(:language_overlay, class: "language-overlay")
  button(:language_overlay_close_button) do |page|
    page.language_overlay_element.button_element(class: "cancel")
  end

  li(:mobile_view, id:"footer-places-mobileview")
end
