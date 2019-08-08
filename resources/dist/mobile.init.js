this.mfModules=this.mfModules||{},this.mfModules["mobile.init"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{"./src/mobile.init/BetaOptInPanel.js":function(e,t,n){function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function r(e,t){return!t||"object"!==o(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function a(e){return(a=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function l(e,t){return(l=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var s=n("./src/mobile.startup/Button.js"),u=n("./src/mobile.startup/util.js"),c=n("./src/mobile.startup/View.js"),d=mw.user,m=function(e){"use strict";function t(e){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),r(this,a(t).call(this,u.extend({isTemplateMode:!0,events:{"click .optin":"_onOptin","click .cancel":e.onCancel}},e)))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&l(e,t)}(t,c),function(e,t,n){t&&i(e.prototype,t),n&&i(e,n)}(t,[{key:"postRender",value:function(){this.$el.find(".message").append(this.options.buttons.map(function(e){return e.$el}))}},{key:"_onOptin",value:function(e){this.$el.find(e.currentTarget).closest("form").trigger("submit")}},{key:"template",get:function(){return u.template('\n\t<div class="beta-opt-in-panel panel panel-inline visible">\n\t\t<form class="message content" action="{{postUrl}}" method="POST">\n\t\t\t<p>{{text}}</p>\n\t\t\t<input type="hidden" name="updateSingleOption" value="enableBeta">\n\t\t\t<input type="hidden" name="enableBeta" value="true">\n\t\t\t<input type="hidden" name="token" value="{{editToken}}">\n\t\t</form>\n\t</div>\n\t')}},{key:"defaults",get:function(){return u.extend({},c.prototype.defaults,{postUrl:void 0,editToken:d.tokens.get("editToken"),text:mw.msg("mobile-frontend-panel-betaoptin-msg"),buttons:[new s({progressive:!0,additionalClassNames:"optin",label:mw.msg("mobile-frontend-panel-ok")}),new s({additionalClassNames:"cancel",label:mw.msg("mobile-frontend-panel-cancel")})]})}}]),t}();e.exports=m},"./src/mobile.init/editor.js":function(e,t,n){var o=n("./src/mobile.startup/moduleLoaderSingleton.js"),i=n("./src/mobile.startup/util.js"),r=mw.loader.require("mediawiki.router"),a=n("./src/mobile.init/editorLoadingOverlay.js"),l=n("./src/mobile.startup/OverlayManager.js").getSingleton(),s=n("./src/mobile.startup/rlModuleLoader.js"),u=$("#ca-edit, .mw-editsection a, .edit-link"),c=mw.user,d=n("./src/mobile.startup/toast.js"),m=n("./src/mobile.startup/CtaDrawer.js"),p=/MSIE \d\./.test(navigator.userAgent),f=mw.config.get("wgPageContentModel"),g=r.isSupported()&&!p,b=mw.config.get("wgVisualEditorConfig"),w=mw.config.get("wgUserEditCount"),v=/^\/editor\/(\d+|all)$/;function h(){var e=new mw.Uri(this.href).query.section||"all";return r.navigate("#/editor/"+e),!1}function y(e,t,n){var d,m,p,f=0===e.id;u.on("click",h),l.add(v,function(r){var u,d,m=window.innerWidth-document.documentElement.clientWidth,g=window.pageYOffset,v=$("#mw-content-text"),h={overlayManager:l,currentPageHTMLParser:n,fakeScroll:0,api:new mw.Api,licenseMsg:t.getLicenseMsg(),title:e.title,titleObj:e.titleObj,isAnon:c.isAnon(),isNewPage:f,editCount:w,oldId:mw.util.getParamValue("oldid"),contentLang:v.attr("lang"),contentDir:v.attr("dir"),sessionId:c.generateRandomSessionId()},y=mw.util.getParamValue("redlink")?"new":"click";function k(){var e,t,n,o,i;$(document.body).addClass("ve-loading"),i=!0===b.enableVisualSectionEditing||"mobile"===b.enableVisualSectionEditing,e=$("#mw-mf-page-center"),t=$("#content"),n="0"===r||"all"===r?$("#bodyContent"):$('[data-section="'+r+'"]').closest("h1, h2, h3, h4, h5, h6"),e.css({"padding-right":"+="+m,"box-sizing":"border-box"}),e.prop("scrollTop",g),o=n[0].getBoundingClientRect().top,o-=48,("0"===r||"all"===r||i)&&(o-=16),t.css({transform:"translate( 0, "+-o+"px )","padding-bottom":"+="+o,"margin-bottom":"-="+o}),h.fakeScroll=o,setTimeout(u.resolve,500)}function S(){d.abort&&d.abort(),$("#content").css({transform:"","padding-bottom":"","margin-bottom":""}),$("#mw-mf-page-center").css({"padding-right":"","box-sizing":""}),$(document.body).removeClass("ve-loading")}function j(e){mw.track("mf.schemaEditAttemptStep",{action:"init",type:"section",mechanism:y,editor_interface:e,editing_session_id:h.sessionId})}function O(){return j("wikitext"),mw.hook("mobileFrontend.editorOpening").fire(),s.loadModule("mobile.editor.overlay").then(function(){return new(o.require("mobile.editor.overlay/SourceEditorOverlay"))(h)})}return"all"!==r&&(h.sectionId=e.isWikiText()?+r:null),function(){var t=!!b,n=function(){var e=mw.storage.get("preferredEditor");if(e)return e;switch(mw.config.get("wgMFDefaultEditor")){case"source":return"SourceEditor";case"visual":return"VisualEditor";case"preference":return"visualeditor"===mw.user.options.get("visualeditor-editor")?"VisualEditor":"SourceEditor"}return"SourceEditor"}(),o=b&&b.namespaces||[];return t&&e.isWikiText()&&-1!==o.indexOf(mw.config.get("wgNamespaceNumber"))&&"translation"!==mw.config.get("wgTranslatePageTranslation")&&("VisualEditor"===n||"VisualEditor"===p)&&"SourceEditor"!==p}()?function(){var e;return j("visualeditor"),mw.hook("mobileFrontend.editorOpening").fire(),u=i.Deferred(),h.mode="visual",h.dataPromise=mw.loader.using("ext.visualEditor.targetLoader").then(function(){return d=mw.libs.ve.targetLoader.requestPageData(h.mode,h.titleObj.getPrefixedDb(),{sessionStore:!0,section:h.sectionId||null,oldId:h.oldId||void 0,targetName:"mobile"})}),(e=a()).on("show",k),e.on("hide",S),mw.loader.using("ext.visualEditor.targetLoader").then(function(){return mw.libs.ve.targetLoader.addPlugin("mobile.editor.ve"),mw.libs.ve.targetLoader.loadModules(h.mode)}).then(function(){return u}).then(function(){return h.dataPromise}).then(function(){var e=o.require("mobile.editor.overlay/VisualEditorOverlay"),t=o.require("mobile.editor.overlay/SourceEditorOverlay");return h.SourceEditorOverlay=t,new e(h)},function(){return O()}).then(function(t){var n=l.stack[0];n&&n.overlay===e&&l.replaceCurrent(t)}),e}():O()}),$("#ca-edit a").prop("href",function(e,t){var n=new mw.Uri(t);return n.query.section=0,n.toString()}),r.getPath()||!mw.util.getParamValue("veaction")&&"edit"!==mw.util.getParamValue("action")||("edit"===mw.util.getParamValue("veaction")?p="VisualEditor":"editsource"===mw.util.getParamValue("veaction")&&(p="SourceEditor"),m="#/editor/"+(mw.util.getParamValue("section")||"edit"===mw.util.getParamValue("action")&&"all"||"0"),window.history&&history.pushState?(delete(d=mw.Uri()).query.action,delete d.query.veaction,delete d.query.section,history.replaceState(null,document.title,d.toString()+m)):r.navigate(m))}function k(e,t,n){var o,i;!(o=mw.config.get("wgMinervaReadOnly"))&&mw.config.get("wgIsProbablyEditable")?y(e,n,t):(function(e){e.$el.find(".mw-editsection").hide()}(t),i=mw.config.get("wgRestrictionEdit"),mw.user.isAnon()&&Array.isArray(i)&&-1!==i.indexOf("*")?function(){var e=new m({content:mw.msg("mobile-frontend-editor-disabled-anon"),signupQueryParams:{warning:"mobile-frontend-watchlist-signup-action"}});u.on("click",function(t){return e.show(),t.preventDefault(),e}),r.route(v,function(){e.show()}),r.checkRoute()}():S(o?mw.msg("apierror-readonly"):mw.msg("mobile-frontend-editor-disabled")))}function S(e){u.on("click",function(t){d.show(e),t.preventDefault()}),r.route(v,function(){d.show(e)}),r.checkRoute()}e.exports=function(e,t,n){var o=0===e.id;"wikitext"===f&&(mw.util.getParamValue("undo")||g&&(e.inNamespace("file")&&o?S(mw.msg("mobile-frontend-editor-uploadenable")):k(e,t,n)))}},"./src/mobile.init/editorLoadingOverlay.js":function(e,t,n){var o=n("./src/mobile.init/fakeToolbar.js"),i=n("./src/mobile.startup/Overlay.js");e.exports=function(){var e=o(),t=new i({className:"overlay overlay-loading",noHeader:!0});return e.appendTo(t.$el.find(".overlay-content")),e.addClass("toolbar-hidden"),setTimeout(function(){e.addClass("toolbar-shown"),setTimeout(function(){e.addClass("toolbar-shown-done")},250)}),t.show=function(){i.prototype.show.call(this),this.emit("show")},t}},"./src/mobile.init/fakeToolbar.js":function(e,t){e.exports=function(){var e,t;return e=$("<a>").attr("tabindex","0").attr("role","button").addClass("mw-ui-icon mw-ui-icon-close mw-ui-icon-element").addClass("cancel").text(mw.msg("mobile-frontend-overlay-close")),t=$("<span>").addClass("mw-ui-icon mw-ui-icon-mf-spinner mw-ui-icon-before").text(mw.msg("mobile-frontend-editor-loading")),$("<div>").addClass("ve-mobile-fakeToolbar-container").append($("<div>").addClass("ve-mobile-fakeToolbar-header").addClass("header").append($("<div>").addClass("ve-mobile-fakeToolbar").append(e,t)))}},"./src/mobile.init/mobile.init.js":function(e,t,n){var o,i=mw.storage,r=mw.config.get("skin"),a=mw.config.get("wgMFIsPageContentModelEditable"),l=n("./src/mobile.init/editor.js"),s=n("./src/mobile.startup/currentPage.js")(),u=n("./src/mobile.startup/currentPageHTMLParser.js")(),c=n("./src/mobile.init/BetaOptInPanel.js"),d=mw.util,m=n("./src/mobile.startup/util.js"),p=m.getWindow(),f=m.getDocument(),g=mw.user,b=n("./src/mobile.startup/context.js"),w=mw.experiments,v=mw.config.get("wgMFExperiments")||{},h=n("./src/mobile.startup/Skin.js"),y=n("./src/mobile.startup/eventBusSingleton.js"),k=n("./src/mobile.startup/amcOutreach/amcOutreach.js");function S(e,t){return function(){return[e.apply(this,arguments),t.apply(this,arguments)]}}function j(){var e=i.get("userFontSize","regular");f.addClass("mf-font-size-"+e)}o=h.getSingleton(),p.on("resize",S($.debounce(100,function(){y.emit("resize")}),$.throttle(200,function(){y.emit("resize:throttled")}))).on("scroll",S($.debounce(100,function(){y.emit("scroll")}),$.throttle(200,function(){y.emit("scroll:throttled")}))),p.on("pageshow",function(){j()}),j(),v.betaoptin&&function(e,t,n){var o,r,a,l=i.get("mobile-betaoptin-token");!1===l||"~"===l||t.isMainPage()||t.inNamespace("special")||(l||(l=g.generateRandomSessionId(),i.set("mobile-betaoptin-token",l)),r="stable"===b.getMode(),a="A"===w.getBucket(e,l),r&&(a||d.getParamValue("debug"))&&(o=new c({postUrl:d.getUrl("Special:MobileOptions",{returnto:t.title}),onCancel:function(e){e.preventDefault(),i.set("mobile-betaoptin-token","~"),this.remove()}})).appendTo(n.getLeadSectionElement()),mw.track("mobile.betaoptin",{isPanelShown:void 0!==o}))}(v.betaoptin,s,u),mw.requestIdleCallback(function(){k.loadCampaign().showIfEligible(k.ACTIONS.onLoad)}),window.console&&window.console.log&&window.console.log.apply&&mw.config.get("wgMFEnableJSConsoleRecruitment")&&console.log(mw.msg("mobile-frontend-console-recruit")),!s.inNamespace("special")&&a&&"minerva"===r&&null!==b.getMode()&&l(s,u,o),mw.mobileFrontend.deprecate("mobile.init/skin",o,"instance of mobile.startup/Skin. Minerva should have no dependencies on mobile.init")}},[["./src/mobile.init/mobile.init.js",0,1]]]);
//# sourceMappingURL=mobile.init.js.map.json