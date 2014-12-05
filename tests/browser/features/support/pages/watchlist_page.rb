class WatchlistPage < ArticlePage
  a(:feed_link, text: 'Modified')
  a(:list_link, text: 'List')
  ul(:page_list_diffs, class: 'page-list side-list')
  ul(:page_list_a_to_z, class: 'watchlist page-list thumbs')
  a(:pages_tab_link, text: 'Pages')
end
