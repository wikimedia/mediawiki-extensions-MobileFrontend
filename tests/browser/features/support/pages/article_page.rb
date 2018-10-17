class ArticlePage
  include PageObject

  page_url '<%=params[:article_name]%><%=params[:hash]%>'

  # UI elements
  a(:mainmenu_button, id: 'mw-mf-main-menu-button')
  body(:is_authenticated, css: '.is-authenticated')

  # pre-content
  h1(:first_heading, id: 'section_0')
  # standalone history link
  a(:standalone_edit_history_link, css: '.last-modified-bar a')
  # beta mode indicator
  a(:beta_mode_indicator, css: '.branding-box sup')

  # left nav
  nav(:navigation, css: 'nav')
  a(:about_link) { |page| page.navigation_element.link_element(text: /^About/) }
  a(:disclaimer_link) { |page| page.navigation_element.link_element(text: 'Disclaimers') }

  # last modified bar
  a(:last_modified_bar_history_link, href: /Special:History/)
  a(:last_modified_bar_history_userpage_link, href: /User:/)

  # page actions
  ## edit
  li(:edit_button_holder, id: 'ca-edit')
  a(:edit_button) do |page|
    page.edit_button_holder_element.link_element(class: 'edit-page')
  end
  li(:upload_page_action, id: 'ca-upload')

  div(:signup_edit_tutorial, class: 'pointer-overlay-tutorial')

  a(:edit_link, text: 'Edit')
  div(:anon_editor_warning, css: '.anon-msg')
  div(:editor_overlay, class: 'editor-overlay')
  button(:editor_overlay_close_button) do |page|
    page.editor_overlay_element.button_element(css: '.cancel')
  end

  ## upload
  li(:upload_button, id: 'ca-upload')
  file_field(:select_file, name: 'file', type: 'file')
  div(:photo_overlay, class: 'photo-overlay')
  button(:photo_overlay_close_button) do |page|
    page.photo_overlay_element.button_element(class: 'cancel')
  end
  text_area(:photo_description) do |page|
    page.photo_overlay_element.text_area_element(name: 'description')
  end
  a(:tutorial_link) do |page|
    page.upload_button_element.link_element(href: '#/upload-tutorial/article')
  end

  ## watch star
  button(:watch_star, text: 'Watch this page')
  button(:unwatch_star, text: 'Stop watching')
  button(:watch_confirm, class: 'mw-htmlform-submit')

  # search
  button(:search_icon, css: '#searchIcon')
  p(:search_within_pages, css: '.without-results')
  div(:search_content_header, css: '.search-content')
  text_field(:search_box_placeholder, name: 'search', index: 0)
  text_field(:search_box2, name: 'search', index: 1)
  li(:search_results, css: '.search-overlay .page-list li')
  div(:search_watchstars, css: '.search-overlay .page-list li .watch-this-article')
  div(:search_overlay, class: 'search-overlay')
  button(:search_overlay_close_button) do |page|
    page.search_overlay_element.button_element(class: 'cancel')
  end
  ul(:search_overlay_page_list) do |page|
    page.search_overlay_element.element.ul(class: 'page-list thumbs actionable')
  end
  a(:search_result) do |page|
    page.search_overlay_page_list_element.element.a
  end
  h3(:search_result_heading) do |page|
    page.search_overlay_page_list_element.element.h3
  end

  a(:notifications_button, css: '.user-button')
  div(:notifications_overlay, class: 'notifications-overlay')
  button(:notifications_overlay_close_button) do |page|
    page.notifications_overlay_element.button_element(class: 'cancel')
  end
  h2(:progress_header, class: 'uploading')

  a(:image_link, class: 'image')

  # page-actions
  ul(:page_actions, id: 'page-actions')
  a(:talk, css: '.talk')
  a(:category, css: '.category-button')
  a(:nearby_button, css: '#page-secondary-actions .nearby')

  # wikidata descriptions
  div(:wikidata_description, css: '.tagline')

  # toc
  div(:toc, css: '.toc-mobile')

  # drawer
  div(:drawer, css: '.drawer.visible')

  # overlay
  div(:overlay, css: '.overlay')
  button(:overlay_close_button) do |page|
    page.overlay_element.button_element(class: 'cancel')
  end
  h2(:overlay_heading, css: '.overlay-title h2')

  # category
  li(:overlay_category_topic_item, css: '.topic-title-list li')

  div(:spinner_loading, class: 'spinner loading')

  # toast
  div(:toast, class: 'mw-notification')

  # loader
  div(:content_wrapper, id: 'content')
  div(:content, id: 'bodyContent')

  # secondary menu
  ## languages
  a(:switch_language_page_action, css: '#page-actions .language-selector')
  a(:disabled_switch_langage_page_action, css: '#page-actions .language-selector.disabled')
  # Can't use generic overlay class as this will match with the loading Overlay that shows before loading the language overlay
  div(:overlay_languages, css: '.language-overlay')
  a(:non_suggested_language_link, css: '.all-languages a', index: 0)
  a(:suggested_language_link, css: '.suggested-languages a', index: 0)

  # footer
  a(:desktop_link, text: 'Desktop')
  a(:terms_link, css: '#footer-places-terms-use')
  a(:license_link, css: 'footer .license a')
  a(:privacy_link, text: 'Privacy')

  # pagelist
  ul(:page_list, css: '.page-list')

  # references
  a(:reference, css: 'sup.reference a')
  a(:nested_reference, css: '.drawer.references sup.reference a')
  a(:reference_drawer, css: '.drawer.references')

  # sections
  h2(:first_section, css: '.section-heading', index: 0)
  div(:first_section_content, id: 'content-collapsible-block-0')
  h2(:third_section, css: '.collapsible-block', index: 2)

  # issues
  a(:issues_stamp, css: '.mw-mf-cleanup')

  # page info (action=info)
  td(:edit_count, css: '#mw-pageinfo-edits td', index: 1)

  # error and warning boxes
  div(:warning_box, css: '.warning')
  div(:error_message, css: '.error')

  # talk overlay
  li(:talk_overlay_first_topic_title, css: '.talk-overlay .topic-title-list li:first-child')
  button(:talk_overlay_save_button, css: '.talk-overlay .confirm-save')
end
