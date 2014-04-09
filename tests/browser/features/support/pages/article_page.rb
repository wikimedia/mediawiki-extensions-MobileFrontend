class ArticlePage
  include PageObject

  include URL
  page_url URL.url("<%=params[:article_name]%>")

  # UI elements
  a(:mainmenu_button, id: "mw-mf-main-menu-button")

  # pre-content
  h1(:first_heading, id: "section_0")
  a(:edit_history_link, id: "mw-mf-last-modified")

  # left nav
  div(:navigation, css:"#mw-mf-page-left")
  a(:watchlist_link, css:"#mw-mf-page-left .icon-watchlist a")
  a(:about_link, text: "About Wikipedia")
  a(:disclaimer_link, text: "Disclaimers")

  # page actions
  ## edit
  li(:edit_button_holder, id: "ca-edit")
  a(:edit_button) do |page|
    page.edit_button_holder_element.link_element(class: "edit-page")
  end
  li(:upload_page_action, id: "ca-upload")

  a(:edit_link, text: "Edit")
  div(:editor_overlay, class: "editor-overlay")
  button(:editor_overlay_close_button) do |page|
    page.editor_overlay_element.button_element(class: "cancel")
  end

  ## upload
  li(:upload_button, id: "ca-upload")
  file_field(:select_file, name: 'file', type: 'file')
  div(:photo_overlay, class: "photo-overlay")
  button(:photo_overlay_close_button) do |page|
    page.photo_overlay_element.button_element(class: "cancel")
  end
  text_area(:photo_description) do |page|
    page.photo_overlay_element.text_area_element(name: "description")
  end
  a(:tutorial_link) do |page|
    page.upload_button_element.link_element(href: '#/upload-tutorial/article')
  end

  ## watch star
  a(:watch_link, css: "#ca-watch a")
  a(:unwatch_link, css: "a.watch-this-article.watched")
  button(:watch_confirm, class: "mw-htmlform-submit")

  # search
  button(:search_button, css: ".searchSubmit")
  text_field(:search_box_placeholder, name: "search", index: 0)
  text_field(:search_box2, name: "search", index: 1)
  li(:search_results, title: "Barack Obama")
  div(:search_overlay, class: "search-overlay")
  button(:search_overlay_close_button) do |page|
    page.search_overlay_element.button_element(class: "cancel")
  end
  ul(:search_overlay_page_list) do |page|
    page.search_overlay_element.element.ul(class: "page-list thumbs actionable")
  end
  a(:search_result) do |page|
    page.search_overlay_page_list_element.element.a
  end

  a(:notifications_button, id: "secondary-button", class: "user-button")
  div(:notifications_overlay, class: "notifications-overlay")
  button(:notifications_overlay_close_button) do |page|
    page.notifications_overlay_element.button_element(class: "cancel")
  end
  h2(:progress_header, class: "uploading")

  a(:image_link, class:"image")


  # page-actions
  ul(:page_actions, id:"page-actions")
  a(:nearby_button, css: "#page-secondary-actions .nearby")

  # editor (common)
  button(:overlay_editor_mode_switcher, css: ".editor-switcher")
  div(:source_editor_button, css: ".source-editor")
  div(:visual_editor_button, css: ".visual-editor")

  # editor
  textarea(:editor_textarea, class:"wikitext-editor")
  button(:escape_button, class:"back icon")
  button(:continue_button, class:"continue icon")
  button(:submit_button, class:"submit icon")

  # drawer
  div(:keep_going, class:'overlay-bottom')
  div(:drawer, class:"drawer position-fixed visible")

  # overlay
  div(:overlay, css:".overlay")
  button(:overlay_close_button) do |page|
    page.overlay_element.button_element(class: "cancel")
  end

  # visual editor
  div(:overlay_ve, css: ".editor-overlay-ve")
  div(:overlay_ve_header) do |page|
    page.overlay_ve_element.div_element(css: ".overlay-header-container")
  end
  div(:overlay_ve_header_toolbar) do |page|
    page.overlay_ve_header_element.div_element(css: ".oo-ui-toolbar-bar")
  end
  span(:overlay_ve_header_toolbar_bold_button) do |page|
    page.overlay_ve_header_element.span_element(class: "oo-ui-iconedElement-icon oo-ui-icon-bold-b")
  end
  span(:overlay_ve_header_toolbar_italic_button) do |page|
    page.overlay_ve_header_element.span_element(class: "oo-ui-iconedElement-icon oo-ui-icon-italic-i")
  end
  div(:editor_ve, class: "ve-ce-documentNode ve-ce-branchNode")
  div(:spinner_loading, class: "spinner loading")

  # toast
  div(:toast, css: ".toast")

  #loader
  div(:content_wrapper, id:'content_wrapper')

  # secondary menu
  ## languages
  a(:language_button, css: ".languageSelector")
  # Can't use generic overlay class as this will match with the LoadingOverlay that shows before loading the language overlay
  div(:overlay_languages, css: ".language-overlay")

  #footer
  a(:desktop_link, text: "Desktop")
  a(:terms_link, text: "Terms of use")
  a(:license_link, href: "//creativecommons.org/licenses/by-sa/3.0/")
  a(:privacy_link, text: "Privacy")

  # pagelist
  ul(:page_list, css: ".page-list")

  # references
  a(:reference, css: "sup.reference a")
  a(:reference_drawer, css: ".drawer.references")

  # sections
  h2(:first_section, css: ".section_heading")
  div(:first_section_content, id: "content_block_0")
end
