class WatchlistPage < ArticlePage
  a(:feed_link, text: 'Modified')
  a(:list_link, text: 'List')
  ul(:page_list_diffs, css: '.diff-summary-list')
  ul(:page_list_a_to_z, css: '.page-summary-list')
  a(:pages_tab_link, text: 'Pages')
end
