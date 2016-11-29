class WatchlistPage < ArticlePage
  a(:feed_link, text: 'Modified')
  a(:list_link, text: 'List')
  ul(:page_list_diffs, css: '.diff-summary-list')
  ul(:page_list_a_to_z, css: '.page-summary-list')
  a(:pages_tab_link, text: 'Pages')
  li(:selected_pages_tab, css: '.mw-mf-watchlist-selector li:nth-child(2).selected')
  div(:empty_panel, css: '.empty-page')
  img(:empty_howto, css: '.empty-page img')
end
