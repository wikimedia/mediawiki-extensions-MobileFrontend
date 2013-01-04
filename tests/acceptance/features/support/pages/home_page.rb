class HomePage
  include PageObject

  def self.url
    if ENV['MEDIAWIKI_URL']
      base_url = ENV['MEDIAWIKI_URL']
    else
      base_url = 'http://127.0.0.1:80/'
    end
      base_url
  end

  page_url url

  a(:mainmenu_button, id: 'mw-mf-main-menu-button')
  a(:login_button, class: 'login')
  a(:search_result, class: 'search-result-item')
  text_field(:search_box, id: 'mw-mf-search')
  div(:menupage, id: 'mw-mf-menu-page')
  a(:watch_link, class: 'watch-this-article')
  a(:watched_link, class: 'watch-this-article watched')
  div(:watch_note, text: 'Added Main Page to your watchlist')
  div(:watch_note_removed, text: 'Removed San Francisco from your watchlist')
  button(:openfooter_button, class:   'openSection')
  span(:mobile_select, text: 'Mobile')
  a(:contrib_link, text: 'contributors')
  a(:content_link, text: 'CC BY-SA 3.0')
  a(:terms_link, text: 'Terms of Use')
  a(:privacy_link, text: 'Privacy')
  a(:about_link, text: 'About')
  a(:disclaimer_link, text: 'Disclaimers')
end
