class RandomPage
  include PageObject

  include URL
  page_url URL.url('Special:Random')

  button(:go_button, value: 'Go')
  li(:home_button, class: 'icon-home')
  li(:login_logout_button, class: 'icon-loginout jsonly')
  li(:random_button, class: 'icon-random')
  li(:settings_button, class: 'icon-settings')
  li(:uploads_button, class: 'icon-uploads jsonly')
  a(:uploads_link, text:'Uploads')
  li(:watchlist_button, class: 'icon-watchlist jsonly')
  a(:watchlist_link, text:'Watchlist')
  div(:login_text, class: 'headmsg')
  div(:login_text_wl, id: 'content_0')

end
