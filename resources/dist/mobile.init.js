this.mfModules=this.mfModules||{},this.mfModules["mobile.init"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{"./src/mobile.init/BetaOptInPanel.js":function(e,t,n){function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function r(e,t){return!t||"object"!==o(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function a(e){return(a=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var l=n("./src/mobile.startup/Button.js"),c=n("./src/mobile.startup/util.js"),u=n("./src/mobile.startup/View.js"),d=mw.user,m=function(e){function t(e){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),r(this,a(t).call(this,c.extend({isTemplateMode:!0,events:{"click .optin":"_onOptin","click .cancel":e.onCancel}},e)))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}(t,u),function(e,t,n){t&&i(e.prototype,t),n&&i(e,n)}(t,[{key:"postRender",value:function(){this.$el.find(".message").append(this.options.buttons.map(function(e){return e.$el}))}},{key:"_onOptin",value:function(e){this.$el.find(e.currentTarget).closest("form").trigger("submit")}}]),t}();m.prototype.template=c.template('\n\t<div class="beta-opt-in-panel panel panel-inline visible">\n\t\t<form class="message content" action="{{postUrl}}" method="POST">\n\t\t\t<p>{{text}}</p>\n\t\t\t<input type="hidden" name="enableBeta" value="true">\n\t\t\t<input type="hidden" name="token" value="{{editToken}}">\n\t\t</form>\n\t</div>\n'),m.prototype.defaults=c.extend({},u.prototype.defaults,{postUrl:void 0,editToken:d.tokens.get("editToken"),text:mw.msg("mobile-frontend-panel-betaoptin-msg"),buttons:[new l({progressive:!0,additionalClassNames:"optin",label:mw.msg("mobile-frontend-panel-ok")}),new l({additionalClassNames:"cancel",label:mw.msg("mobile-frontend-panel-cancel")})]}),e.exports=m},"./src/mobile.init/editor.js":function(e,t,n){var o=n("./src/mobile.startup/moduleLoaderSingleton.js"),i=n("./src/mobile.startup/util.js"),r=mw.loader.require("mediawiki.router"),a=n("./src/mobile.init/fakeToolbar.js"),s=n("./src/mobile.startup/Overlay.js"),l=n("./src/mobile.startup/OverlayManager.js").getSingleton(),c=n("./src/mobile.startup/rlModuleLoader.js"),u=$("#ca-edit, .mw-editsection a, .edit-link"),d=mw.user,m=n("./src/mobile.startup/toast.js"),g=n("./src/mobile.startup/CtaDrawer.js"),p=/MSIE \d\./.test(navigator.userAgent),f=mw.config.get("wgPageContentModel"),w=r.isSupported()&&!p,b=mw.config.get("wgVisualEditorConfig"),v=mw.config.get("wgUserEditCount"),h=b,y=/^\/editor\/(\d+|all)$/;function k(){var e=new mw.Uri(this.href).query.section||"all";return r.navigate("#/editor/"+e),!1}function P(e,t){var n,m,g,p=0===e.id;u.on("click",k),l.add(y,function(n){var r,u,m,f,w=$("#mw-content-text"),y=function(){var e=mw.storage.get("preferredEditor");if(e)return e;switch(mw.config.get("wgMFDefaultEditor")){case"source":return"SourceEditor";case"visual":return"VisualEditor";case"preference":return"visualeditor"===mw.user.options.get("visualeditor-editor")?"VisualEditor":"SourceEditor"}return"SourceEditor"}(),k={overlayManager:l,api:new mw.Api,licenseMsg:t.getLicenseMsg(),title:e.title,titleObj:e.titleObj,isAnon:d.isAnon(),isNewPage:p,editCount:v,oldId:mw.util.getParamValue("oldid"),contentLang:w.attr("lang"),contentDir:w.attr("dir"),sessionId:d.generateRandomSessionId()},P=b&&b.namespaces||[],S=mw.util.getParamValue("redlink")?"new":"click";function j(){f.abort&&f.abort(),$("#content").css({transform:"","padding-bottom":"","margin-bottom":""}),$("#mw-mf-page-center").css({"padding-right":"","box-sizing":""}),$(document.body).removeClass("ve-loading")}function E(e){mw.track("mf.schemaEditAttemptStep",{action:"init",type:"section",mechanism:S,editor_interface:e,editing_session_id:k.sessionId})}function x(){return E("wikitext"),mw.hook("mobileFrontend.editorOpening").fire(),c.loadModule("mobile.editor.overlay").then(function(){return new(o.require("mobile.editor.overlay/SourceEditorOverlay"))(k)})}return"all"!==n&&(k.sectionId=e.isWikiText()?+n:null),h&&e.isWikiText()&&-1!==P.indexOf(mw.config.get("wgNamespaceNumber"))&&"translation"!==mw.config.get("wgTranslatePageTranslation")&&("VisualEditor"===y||"VisualEditor"===g)&&"SourceEditor"!==g?(E("visualeditor"),mw.hook("mobileFrontend.editorOpening").fire(),m=i.Deferred(),k.mode="visual",k.dataPromise=mw.loader.using("ext.visualEditor.targetLoader").then(function(){return f=mw.libs.ve.targetLoader.requestPageData(k.mode,k.titleObj.getPrefixedDb(),{sessionStore:!0,section:k.sectionId||null,oldId:k.oldId||void 0,targetName:"mobile"}),m.then(function(){return f})}),mw.loader.using("ext.visualEditor.targetLoader").then(function(){return mw.libs.ve.targetLoader.addPlugin("mobile.editor.ve"),mw.libs.ve.targetLoader.loadModules(k.mode)}).then(function(){return k.dataPromise}).then(function(){var e,t=o.require("mobile.editor.overlay/VisualEditorOverlay"),n=o.require("mobile.editor.overlay/SourceEditorOverlay");return k.SourceEditorOverlay=n,(e=new t(k)).on("editor-loaded",j),e},function(){return x()}).then(function(e){var t=l.stack[0];t&&t.overlay===r&&(r.off("hide",j),e.on("hide",j),l.replaceCurrent(e))}),u=window.innerWidth-document.documentElement.clientWidth,function(e){var t=a();e.append(t),t.addClass("toolbar-hidden"),setTimeout(function(){t.addClass("toolbar-shown"),setTimeout(function(){t.addClass("toolbar-shown-done")},250)}),$(document.body).addClass("ve-loading")}((r=new s({className:"overlay overlay-loading",noHeader:!0})).$el.find(".overlay-content")),r.on("hide",j),r.show=function(){var e,t,o,i,r;s.prototype.show.call(this),r=!0===b.enableVisualSectionEditing||"mobile"===b.enableVisualSectionEditing,e=$("#mw-mf-page-center"),t=$("#content"),o="0"===n||"all"===n?$("#bodyContent"):$('[data-section="'+n+'"]').closest("h1, h2, h3, h4, h5, h6"),e.css({"padding-right":"+="+u,"box-sizing":"border-box"}),e.prop("scrollTop",this.scrollTop),i=o.prop("offsetTop")-this.scrollTop,i-=48,("0"===n||"all"===n||r)&&(i-=16),t.css({transform:"translate( 0, "+-i+"px )","padding-bottom":"+="+i,"margin-bottom":"-="+i}),setTimeout(m.resolve,500)},r):x()}),$("#ca-edit a").prop("href",function(e,t){var n=new mw.Uri(t);return n.query.section=0,n.toString()}),r.getPath()||!mw.util.getParamValue("veaction")&&"edit"!==mw.util.getParamValue("action")||("edit"===mw.util.getParamValue("veaction")?g="VisualEditor":"editsource"===mw.util.getParamValue("veaction")&&(g="SourceEditor"),m="#/editor/"+(mw.util.getParamValue("section")||"edit"===mw.util.getParamValue("action")&&"all"||"0"),window.history&&history.pushState?(delete(n=mw.Uri()).query.action,delete n.query.veaction,delete n.query.section,history.replaceState(null,document.title,n.toString()+m)):r.navigate(m))}function S(e,t){var n,o;!(n=mw.config.get("wgMinervaReadOnly"))&&mw.config.get("wgIsProbablyEditable")?P(e,t):(function(e){e.$el.find(".mw-editsection").hide()}(e),o=mw.config.get("wgRestrictionEdit"),mw.user.isAnon()&&Array.isArray(o)&&-1!==o.indexOf("*")?function(){var e=new g({content:mw.msg("mobile-frontend-editor-disabled-anon"),signupQueryParams:{warning:"mobile-frontend-watchlist-signup-action"}});u.on("click",function(t){return e.show(),t.preventDefault(),e}),r.route(y,function(){e.show()}),r.checkRoute()}():j(n?mw.msg("apierror-readonly"):mw.msg("mobile-frontend-editor-disabled")))}function j(e){u.on("click",function(t){m.show(e),t.preventDefault()}),r.route(y,function(){m.show(e)}),r.checkRoute()}e.exports=function(e,t){var n=0===e.id;"wikitext"===f&&(mw.util.getParamValue("undo")||w&&(e.inNamespace("file")&&n?j(mw.msg("mobile-frontend-editor-uploadenable")):S(e,t)))}},"./src/mobile.init/fakeToolbar.js":function(e,t){e.exports=function(){var e,t;return e=$("<a>").attr("tabindex","0").attr("role","button").addClass("mw-ui-icon mw-ui-icon-close mw-ui-icon-element").addClass("cancel").text(mw.msg("mobile-frontend-overlay-close")),t=$("<span>").addClass("mw-ui-icon mw-ui-icon-mf-spinner mw-ui-icon-before").text(mw.msg("mobile-frontend-editor-loading")),$("<div>").addClass("ve-mobile-fakeToolbar-container").append($("<div>").addClass("ve-mobile-fakeToolbar-header").addClass("header").append($("<div>").addClass("ve-mobile-fakeToolbar").append(e,t)))}},"./src/mobile.init/mobile.init.js":function(e,t,n){var o,i,r=mw.storage,a=mw.config.get("skin"),s=mw.config.get("wgMFIsPageContentModelEditable"),l=n("./src/mobile.init/editor.js"),c=n("./src/mobile.startup/PageGateway.js"),u=n("./src/mobile.init/BetaOptInPanel.js"),d=new c(new mw.Api),m=mw.util,g=n("./src/mobile.startup/util.js"),p=g.getWindow(),f=g.getDocument(),w=mw.user,b=n("./src/mobile.startup/context.js"),v=n("./src/mobile.startup/Page.js"),h=mw.experiments,y=mw.config.get("wgMFExperiments")||{},k=n("./src/mobile.startup/Skin.js"),P=n("./src/mobile.startup/eventBusSingleton.js"),S=n("./src/mobile.startup/references/ReferencesMobileViewGateway.js"),j=x();function E(e,t){return function(){return[e.apply(this,arguments),t.apply(this,arguments)]}}function x(){return o||function(){var e=mw.config.get("wgRestrictionEdit",[]),t=$("#content #bodyContent"),n=mw.Title.newFromText(mw.config.get("wgRelevantPageName"));0===e.length&&e.push("*");return o=new v({el:t,title:n.getPrefixedText(),titleObj:n,protection:{edit:e},revId:mw.config.get("wgRevisionId"),isMainPage:mw.config.get("wgIsMainPage"),isWatched:$("#ca-watch").hasClass("watched"),sections:d.getSectionsFromHTML(t),isMissing:0===mw.config.get("wgArticleId"),id:mw.config.get("wgArticleId"),namespaceNumber:mw.config.get("wgNamespaceNumber")})}()}function C(){var e=r.get("userFontSize","regular");f.addClass("mf-font-size-"+e)}i=new k({el:"body",page:j,referencesGateway:S.getSingleton(),eventBus:P}),p.on("resize",E($.debounce(100,function(){P.emit("resize")}),$.throttle(200,function(){P.emit("resize:throttled")}))).on("scroll",E($.debounce(100,function(){P.emit("scroll")}),$.throttle(200,function(){P.emit("scroll:throttled")}))),p.on("pageshow",function(){C()}),C(),y.betaoptin&&function(e,t){var n,o,i,a=r.get("mobile-betaoptin-token");!1===a||"~"===a||t.isMainPage()||t.inNamespace("special")||(a||(a=w.generateRandomSessionId(),r.set("mobile-betaoptin-token",a)),o="stable"===b.getMode(),i="A"===h.getBucket(e,a),o&&(i||m.getParamValue("debug"))&&(n=new u({postUrl:m.getUrl("Special:MobileOptions",{returnto:t.title}),onCancel:function(e){e.preventDefault(),r.set("mobile-betaoptin-token","~"),this.remove()}})).appendTo(t.getLeadSectionElement()),mw.track("mobile.betaoptin",{isPanelShown:void 0!==n}))}(y.betaoptin,x()),window.console&&window.console.log&&window.console.log.apply&&mw.config.get("wgMFEnableJSConsoleRecruitment")&&console.log(mw.msg("mobile-frontend-console-recruit")),!j.inNamespace("special")&&s&&"minerva"===a&&null!==b.getMode()&&l(j,i),t={getCurrentPage:x},g.extend(mw.mobileFrontend,t),mw.log.deprecate(mw.mobileFrontend,"getCurrentPage",x),mw.mobileFrontend.deprecate("mobile.init/skin",i,"instance of mobile.startup/Skin. Minerva should have no dependencies on mobile.init"),e.exports=t}},[["./src/mobile.init/mobile.init.js",0,1]]]);
//# sourceMappingURL=mobile.init.js.map.json