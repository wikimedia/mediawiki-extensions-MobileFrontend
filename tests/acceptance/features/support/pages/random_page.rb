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
  li(:watchlist_button, class: 'icon-watchlist jsonly')
end
