class HomePage
  include PageObject

  include URL
  def self.url
    URL.url('Main_Page')
  end
  page_url url

  a(:about_link, text: 'About')
  a(:content_link, href: '//creativecommons.org/licenses/by-sa/3.0/')
  a(:contrib_link, text: 'contributors')
  a(:desktop_link, text: 'Desktop')
  a(:disclaimer_link, text: 'Disclaimers')
  a(:login_button, href: /Special:UserLogin/)
  a(:login_watchlist, href: /returntoquery=article_action%3Dwatch/)
  div(:main_page, id: 'mainpage')
  a(:mainmenu_button, id: 'mw-mf-main-menu-button')
  span(:mobile_select, text: 'Mobile')
  button(:openfooter_button, class:   'openSection')
  a(:privacy_link, text: 'Privacy')
  form(:search_form, id: 'mw-mf-searchForm')
  a(:sign_up, text: 'Sign up')
  a(:terms_link, text: 'Terms of Use')
  a(:watch_link, class: 'watch-this-article')
  div(:watch_note, text: 'Added San Francisco Chronicle to your watchlist')
  a(:watched_link, class: 'watch-this-article watched')
  div(:watch_note_removed, text: 'Removed San Francisco Chronicle from your watchlist')
  text_field(:search_box, name: 'search')
  form(:search_form, id: 'mw-mf-searchForm')
  li(:search_results, title: 'San Francisco')
  a(:search_result) do |page|
    page.search_results_element.a
  end
  a(:sign_up_watchlist, href: /returntoquery=article_action%3Dwatch&type=signup/)
  a(:terms_link, text: 'Terms of Use')
  a(:watch_link, class: 'watch-this-article')
  div(:watch_note, text: 'Added San Francisco Chronicle to your watchlist')
  div(:watch_note_removed, text: 'Removed San Francisco Chronicle from your watchlist')
  a(:watched_link, class: 'watch-this-article watched')
  a(:create_account, class: 'mw-mf-create-account')
  button(:language_button, text: 'Read in another language')
  li(:edit_icon, id:'ca-edit')
  li(:upload_icon, id:'ca-upload')
  div(:fe_notification, class:'drawer position-fixed visible')
  div(:rl_notification, id:'notifications')
  a(:edit_history_link, id:'mw-mf-last-modified')
  a(:notification_button, id:'secondary-button')
  a(:edit_icon_enabled, text:'Edit')
end
