this.mfModules=this.mfModules||{},this.mfModules["mobile.init"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{"./src/mobile.init/editor.js":function(e,t,i){var o=i("./src/mobile.startup/moduleLoaderSingleton.js"),n=i("./src/mobile.startup/util.js"),r=i("./src/mobile.init/editorLoadingOverlay.js"),a=i("./src/mobile.startup/OverlayManager.js"),s=$("#ca-edit"),l=mw.user,c=i("./src/mobile.startup/CtaDrawer.js"),d=mw.config.get("wgVisualEditorConfig"),u=mw.config.get("wgUserEditCount"),m=/^\/editor\/(\d+|T-\d+|all)$/;function g(e,t,i){var o;o=0===$(".mw-editsection a, .edit-link").length?"all":mw.util.getParamValue("section",e.href)||"all",mw.config.get("wgPageName")===mw.util.getParamValue("title",e.href)&&(i.navigate("#/editor/"+o),t.preventDefault())}function w(e,t,i,c){var w,f,p,v=a.getSingleton(),b=0===e.id;s.on("click",(function(e){g(this,e,v.router)})),mw.hook("wikipage.content").add((function(e){e.find(".mw-editsection a, .edit-link").on("click",(function(e){g(this,e,v.router)}))})),v.add(m,(function(a){var s,c,m,g,w=window.pageYOffset,f=$("#mw-content-text"),h=new URL(location.href),y={overlayManager:v,currentPageHTMLParser:i,fakeScroll:0,api:new mw.Api,licenseMsg:t.getLicenseMsg(),title:e.title,titleObj:e.titleObj,isAnon:l.isAnon(),isNewPage:b,editCount:u,oldId:mw.util.getParamValue("oldid"),contentLang:f.attr("lang"),contentDir:f.attr("dir"),preload:h.searchParams.get("preload"),preloadparams:new mw.Uri(h.toString(),{arrayParams:!0}).query.preloadparams,editintro:h.searchParams.get("editintro")},k=mw.util.getParamValue("redlink")?"new":"click";function E(e){mw.track("editAttemptStep",{action:"init",type:"section",mechanism:k,integration:"page",editor_interface:e})}function S(){var t=!!d,i=function(){var e=mw.user.options.get("mobile-editor")||mw.storage.get("preferredEditor");if(e)return e;switch(mw.config.get("wgMFDefaultEditor")){case"source":return"SourceEditor";case"visual":return"VisualEditor";case"preference":return(mw.user.options.get("visualeditor-hidebetawelcome")||mw.user.options.get("visualeditor-hideusered"))&&"visualeditor"===mw.user.options.get("visualeditor-editor")?"VisualEditor":"SourceEditor"}return"SourceEditor"}(),o=d&&d.namespaces||[];return t&&e.isWikiText()&&-1!==o.indexOf(mw.config.get("wgNamespaceNumber"))&&"translation"!==mw.config.get("wgTranslatePageTranslation")&&("VisualEditor"===i||"VisualEditor"===p)&&"SourceEditor"!==p}function P(){return E("wikitext"),mw.hook("mobileFrontend.editorOpening").fire(),mw.loader.using("mobile.editor.overlay").then((function(){return new(o.require("mobile.editor.overlay/SourceEditorOverlay"))(y)}))}return"all"!==a&&(y.sectionId=e.isWikiText()?a:void 0),s=n.Deferred(),m=r((function(){var e,t,i,o,n;$(document.body).addClass("ve-loading"),e=$("#mw-mf-page-center"),t=$("#content"),"0"===a||"all"===a?i=$("#bodyContent"):(i=$('[data-section="'+a+'"]').closest("h1, h2, h3, h4, h5, h6")).length||(i=$("#bodyContent")),e.prop("scrollTop",w),o=i[0].getBoundingClientRect().top,o-=48,S()?(n=!0===d.enableVisualSectionEditing||"mobile"===d.enableVisualSectionEditing,("0"===a||"all"===a||n)&&(o-=16)):"0"!==a&&"all"!==a||(o-=16),t.css({transform:"translate( 0, "+-o+"px )","padding-bottom":"+="+o,"margin-bottom":"-="+o}),y.fakeScroll=o,setTimeout(s.resolve,500)}),(function(){c&&c.abort&&c.abort(),$("#content").css({transform:"","padding-bottom":"","margin-bottom":""}),$(document.body).removeClass("ve-loading")})),S()?(E("visualeditor"),mw.hook("mobileFrontend.editorOpening").fire(),y.mode="visual",y.dataPromise=mw.loader.using("ext.visualEditor.targetLoader").then((function(){return c=mw.libs.ve.targetLoader.requestPageData(y.mode,y.titleObj.getPrefixedDb(),{sessionStore:!0,section:void 0===y.sectionId?null:y.sectionId,oldId:y.oldId||void 0,preload:y.preload,preloadparams:y.preloadparams,editintro:y.editintro,targetName:"mobile"})})),g=mw.loader.using("ext.visualEditor.targetLoader").then((function(){return mw.libs.ve.targetLoader.addPlugin("ext.visualEditor.mobileArticleTarget"),mw.libs.ve.targetLoader.addPlugin("mobile.editor.overlay"),mw.libs.ve.targetLoader.loadModules(y.mode)})).then((function(){var e=o.require("mobile.editor.overlay/VisualEditorOverlay"),t=o.require("mobile.editor.overlay/SourceEditorOverlay");return y.SourceEditorOverlay=t,new e(y)}),(function(){return P()}))):g=P(),n.Promise.all([g,s]).then((function(e){e.getLoadingPromise().then((function(){var t=v.stack[0];t&&t.overlay===m&&v.replaceCurrent(e)}),(function(e,t){v.router.back(),e.show?(document.body.appendChild(e.$el[0]),e.show()):t?mw.notify(y.api.getErrorMessage(t)):mw.notify(mw.msg("mobile-frontend-editor-error-loading"))}))})),m})),$("#ca-edit a").prop("href",(function(e,t){try{var i=new mw.Uri(t);return i.query.section="0",i.toString()}catch(e){return t}})),c.getPath()||!mw.util.getParamValue("veaction")&&"edit"!==mw.config.get("wgAction")||("edit"===mw.util.getParamValue("veaction")?p="VisualEditor":"editsource"===mw.util.getParamValue("veaction")&&(p="SourceEditor"),f="#/editor/"+(mw.util.getParamValue("section")||("edit"===mw.config.get("wgAction")?"all":"0")),window.history&&history.pushState?(delete(w=mw.Uri()).query.action,delete w.query.veaction,delete w.query.section,history.replaceState(null,document.title,w.toString()+f)):c.navigate(f))}function f(e,t,i,o){var n,r;if(!(n=mw.config.get("wgMinervaReadOnly"))&&mw.config.get("wgIsProbablyEditable"))w(e,i,t,o);else if(function(e){e.$el.find(".mw-editsection").hide()}(t),r=mw.config.get("wgRestrictionEdit"),mw.user.isAnon()&&Array.isArray(r)&&!r.length)!function(e){var t;function i(){t||(t=new c({content:mw.msg("mobile-frontend-editor-disabled-anon"),signupQueryParams:{warning:"mobile-frontend-watchlist-signup-action"}}),document.body.appendChild(t.$el[0])),t.show()}s.on("click",(function(e){i(),e.preventDefault()})),mw.hook("wikipage.content").add((function(e){e.find(".mw-editsection a, .edit-link").on("click",(function(e){i(),e.preventDefault()}))})),e.route(m,(function(){i()})),e.checkRoute()}(o);else{var a=$("<a>").attr("href","/wiki/"+mw.config.get("wgPageName")+"?action=edit");p(n?mw.msg("apierror-readonly"):mw.message("mobile-frontend-editor-disabled",a).parseDom(),o)}}function p(e,t){s.on("click",(function(t){mw.notify(e),t.preventDefault()})),mw.hook("wikipage.content").add((function(t){t.find(".mw-editsection a, .edit-link").on("click",(function(t){mw.notify(e),t.preventDefault()}))})),t.route(m,(function(){mw.notify(e)})),t.checkRoute()}e.exports=function(e,t,i){var o=mw.loader.require("mediawiki.router");e.inNamespace("file")&&0===e.id?p(mw.msg("mobile-frontend-editor-uploadenable"),o):f(e,t,i,o)}},"./src/mobile.init/editorLoadingOverlay.js":function(e,t,i){var o=i("./src/mobile.init/fakeToolbar.js"),n=i("./src/mobile.startup/Overlay.js");e.exports=function(e,t){var i=o(),r=new n({className:"overlay overlay-loading",noHeader:!0,isBorderBox:!1,onBeforeExit:function(e){e(),t()}});return r.show=function(){n.prototype.show.call(this),e()},i.appendTo(r.$el.find(".overlay-content")),i.addClass("toolbar-hidden"),setTimeout((function(){i.addClass("toolbar-shown"),setTimeout((function(){i.addClass("toolbar-shown-done")}),250)})),r}},"./src/mobile.init/lazyLoadedImages.js":function(e,t,i){var o=i("./src/mobile.startup/lazyImages/lazyImageLoader.js");function n(e){var t=o.queryPlaceholders(e[0]);if(window.addEventListener("beforeprint",(function(){o.loadImages(t)})),mw.config.get("wgMFLazyLoadImages"))if("IntersectionObserver"in window){var i=new IntersectionObserver((function(e){e.forEach((function(e){var t=e.target;e.isIntersecting&&(o.loadImage(t),i.unobserve(t))}))}),{rootMargin:"0px 0px 50% 0px",threshold:0});t.forEach((function(e){i.observe(e)}))}else $(t).addClass("".concat(o.placeholderClass,"--tap")),document.addEventListener("click",(function(e){t.indexOf(e.target)>-1&&o.loadImage(e.target)}))}e.exports=function(){mw.hook("wikipage.content").add(n)}},"./src/mobile.init/mobile.init.js":function(e,t,i){var o,n,r=i("./src/constants.js"),a=r.USER_FONT_SIZE_REGULAR,s=r.USER_FONT_SIZES,l=mw.storage,c=i("./src/mobile.init/toggling.js"),d=i("./src/mobile.init/lazyLoadedImages.js"),u=i("./src/mobile.init/editor.js"),m=i("./src/mobile.startup/currentPage.js")(),g=i("./src/mobile.startup/currentPageHTMLParser.js")(),w=i("./src/mobile.startup/util.js").getWindow(),f=i("./src/mobile.startup/Skin.js"),p=i("./src/mobile.startup/eventBusSingleton.js");function v(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}function b(){var e=l.get("userFontSize",a);s.forEach((function(t){var i="mf-font-size-".concat(t);t===e?document.documentElement.classList.add(i):document.documentElement.classList.remove(i)}))}o=f.getSingleton(),w.on("resize",v(mw.util.debounce((function(){p.emit("resize")}),100),mw.util.throttle((function(){p.emit("resize:throttled")}),200))).on("scroll",v(mw.util.debounce((function(){p.emit("scroll")}),100),mw.util.throttle((function(){p.emit("scroll:throttled")}),200))),window.history&&history.pushState&&((n=new URL(window.location.href)).searchParams.has("venotify")||n.searchParams.has("mfnotify"))&&(n.searchParams.delete("venotify"),n.searchParams.delete("mfnotify"),window.history.replaceState(null,document.title,n.toString())),window.addEventListener("pageshow",(function(){b()})),b(),window.console&&window.console.log&&window.console.log.apply&&mw.config.get("wgMFEnableJSConsoleRecruitment")&&console.log(mw.msg("mobile-frontend-console-recruit")),mw.config.get("wgMFIsSupportedEditRequest")&&u(m,g,o),c(),d()},"./src/mobile.init/toggling.js":function(e,t,i){e.exports=function(){var e=i("./src/mobile.startup/currentPage.js")(),t=i("./src/mobile.startup/Toggler.js"),o=i("./src/mobile.startup/eventBusSingleton.js");e.inNamespace("special")||"view"!==mw.config.get("wgAction")||mw.hook("wikipage.content").add((function(i){var n=i.find(".mw-parser-output");0===n.length&&(n=i),function(e,i,n){e.find(".section-heading").removeAttr("onclick"),void 0!==window.mfTempOpenSection&&delete window.mfTempOpenSection,new t({$container:e,prefix:i,page:n,eventBus:o})}(n,"content-",e)}))}}},[["./src/mobile.init/mobile.init.js",0,1]]]);
//# sourceMappingURL=mobile.init.js.map.json