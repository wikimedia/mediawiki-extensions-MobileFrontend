class RandomPage
  include PageObject

  include URL
  page_url URL.url('Special:Random')

  button(:go_button, value: 'Go')
  li(:home_button, class: 'icon-home')
  a(:home_link, text: 'Home')
  a(:login_link, text: 'Log in')
  li(:login_logout_button, class: 'icon-loginout')
  div(:login_text, class: 'headmsg')
  div(:login_text_wl, id: 'content')
  a(:nearby_link, text: 'Nearby')
  li(:random_button, class: 'icon-random')
  a(:random_link, text: 'Random')
  li(:settings_button, class: 'icon-settings')
  a(:settings_link, text: 'Settings')
  li(:uploads_button, class: 'icon-uploads jsonly')
  a(:uploads_link, text:'Uploads')
  li(:watchlist_button, class: 'icon-watchlist')
  a(:watchlist_link, text:'Watchlist')
end
