this.mfModules=this.mfModules||{},this.mfModules["mobile.editor.overlay"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{"./src/mobile.editor.overlay/AbuseFilterOverlay.js":function(e,t,i){var o=i("./src/mobile.startup/Button.js"),n=i("./src/mobile.startup/util.js"),s=i("./src/mobile.startup/mfExtend.js"),a=i("./src/mobile.startup/Overlay.js");function r(e){a.call(this,n.extend({className:"overlay abusefilter-overlay"},e))}s(r,a,{defaults:n.extend({},a.prototype.defaults,{confirmButton:new o({additionalClassNames:"cancel",progressive:!0}).options}),templatePartials:n.extend({},a.prototype.templatePartials,{button:o.prototype.template,content:n.template('\n<div class="content">\n\t{{{message}}}\n\t{{#confirmButton}}{{>button}}{{/confirmButton}}\n</div>\n\t\t')}),postRender:function(){a.prototype.postRender.apply(this),this.$el.find("a").attr("target","_blank")}}),e.exports=r},"./src/mobile.editor.overlay/AbuseFilterPanel.js":function(e,t,i){var o=i("./src/mobile.startup/util.js"),n=i("./src/mobile.startup/View.js"),s=i("./src/mobile.startup/mfExtend.js"),a=i("./src/mobile.editor.overlay/AbuseFilterOverlay.js");function r(e){this.isDisallowed=!1,this.overlayManager=e.overlayManager,n.call(this,o.extend({className:"panel hidden"},e))}s(r,n,{defaults:{readMoreMsg:mw.msg("mobile-frontend-editor-abusefilter-read-more")},template:o.template('\n<div class="message">\n\t<p></p><a href="#/abusefilter" class="readmore">{{readMoreMsg}}</a>\n</div>\n\t'),show:function(e,t){var i;this.overlayManager.add(/^\/abusefilter$/,function(){return new a({message:t})}),"warning"===e?i=mw.msg("mobile-frontend-editor-abusefilter-warning"):"disallow"===e&&(i=mw.msg("mobile-frontend-editor-abusefilter-disallow"),this.isDisallowed=!0),this.$el.find(".message p").text(i),this.$el.removeClass("hidden")},hide:function(){this.$el.addClass("hidden")}}),e.exports=r},"./src/mobile.editor.overlay/BlockMessage.js":function(e,t,i){"use strict";var o=i("./src/mobile.startup/Drawer.js"),n=i("./src/mobile.startup/Button.js"),s=i("./src/mobile.startup/mfExtend.js"),a=i("./src/mobile.startup/Icon.js"),r=i("./src/mobile.startup/util.js");function l(){o.apply(this,arguments)}s(l,o,{defaults:r.extend({},o.prototype.defaults,{stopHandIcon:new a({name:"stop-hand"}).options,userIcon:new a({tagName:"span",name:"profile"}).options,okButton:new n({label:mw.msg("ok"),tagName:"button",progressive:!0,additionalClassNames:"cancel"}).options,createDetailsAnchorHref:function(){return mw.util.getUrl("Special:BlockList",{wpTarget:"#"+this.blockId})},createDetailsAnchorLabel:function(){return mw.msg("mobile-frontend-editor-blocked-drawer-help")},createTitle:function(){return this.partial?mw.msg("mobile-frontend-editor-blocked-drawer-title-partial"):mw.msg("mobile-frontend-editor-blocked-drawer-title")},reasonHeader:mw.msg("mobile-frontend-editor-blocked-drawer-reason-header"),creatorHeader:function(){return mw.msg("mobile-frontend-editor-blocked-drawer-creator-header",mw.user.options.get("gender"))},expiryHeader:mw.msg("mobile-frontend-editor-blocked-drawer-expiry-header")}),templatePartials:r.extend({},o.prototype.templatePartials,{button:n.prototype.template,icon:a.prototype.template}),template:r.template('\n{{#collapseIcon}}{{>icon}}{{/collapseIcon}}\n<div class="block-message">\n  <div class="block-message-icon">\n    {{#stopHandIcon}}{{>icon}}{{/stopHandIcon}}\n  </div>\n  <div class="block-message-info">\n    <div class="block-message-item block-message-title">\n      <h5>{{ createTitle }}</h5>\n    </div>\n    <div class="block-message-data">\n      {{#reason}}\n        <div class="block-message-item">\n          <h6>{{ reasonHeader }}</h6>\n          <div><strong>{{{ reason }}}</strong></div>\n        </div>\n      {{/reason}}\n      <div class="block-message-item block-message-creator">\n        <h6>{{ creatorHeader }}</h6>\n        <div><strong><a href="{{ creator.url }}">{{#userIcon}}{{>icon}}{{/userIcon}}{{ creator.name }}</a></strong></div>\n      </div>\n      {{#expiry}}\n        <div class="block-message-item">\n          <h6>{{ expiryHeader }}</h6>\n          <div><strong>{{#duration}}{{ duration }} / {{/duration}}{{ expiry }}</strong></div>\n        </div>\n      {{/expiry}}\n    </div>\n    <div class="block-message-item block-message-buttons">\n      {{#okButton}}\n        {{>button}}\n      {{/okButton}}\n      <a href="{{ createDetailsAnchorHref }}">{{ createDetailsAnchorLabel }}</a>\n    </div>\n  </div>\n</div>\n\t')}),e.exports=l},"./src/mobile.editor.overlay/EditorGateway.js":function(e,t,i){var o=i("./src/mobile.startup/util.js"),n=i("./src/mobile.editor.overlay/parseSaveError.js"),s=i("./src/mobile.startup/actionParams.js");function a(e){this.api=e.api,this.title=e.title,this.sectionId=e.sectionId,this.oldId=e.oldId,this.content=e.isNewPage?"":void 0,this.fromModified=e.fromModified,this.hasChanged=e.fromModified}a.prototype={getBlockInfo:function(e){var t;return e.actions&&e.actions.edit&&Array.isArray(e.actions.edit)&&(e.actions.edit.some(function(e){return-1!==["blocked","autoblocked"].indexOf(e.code)&&(t=e,!0)}),t&&t.data&&t.data.blockinfo)?(mw.loader.load("moment"),t.data.blockinfo):null},getContent:function(){var e,t=this;function i(){return o.Deferred().resolve({text:t.content||"",blockinfo:t.blockinfo})}return void 0!==this.content?i():(e=s({prop:["revisions","info"],rvprop:["content","timestamp"],titles:t.title,intestactions:"edit",intestactionsdetail:"full"}),this.oldId&&(e.rvstartid=this.oldId),o.isNumeric(this.sectionId)&&(e.rvsection=this.sectionId),this.api.get(e).then(function(e){var n,s;return e.error?o.Deferred().reject(e.error.code):(void 0!==(s=e.query.pages[0]).missing?t.content="":(n=s.revisions[0],t.content=n.content,t.timestamp=n.timestamp),t.originalContent=t.content,t.blockinfo=t.getBlockInfo(s),i())}))},setContent:function(e){this.originalContent!==e||this.fromModified?this.hasChanged=!0:this.hasChanged=!1,this.content=e},setPrependText:function(e){this.prependtext=e,this.hasChanged=!0},save:function(e){var t=this,i=o.Deferred();return e=e||{},function(){var s={action:"edit",title:t.title,summary:e.summary,captchaid:e.captchaId,captchaword:e.captchaWord,basetimestamp:t.timestamp,starttimestamp:t.timestamp};return void 0!==t.content?s.text=t.content:t.prependtext&&(s.prependtext=t.prependtext),o.isNumeric(t.sectionId)&&(s.section=t.sectionId),t.api.postWithToken("csrf",s).then(function(e){e&&e.edit&&"Success"===e.edit.result?(t.hasChanged=!1,i.resolve()):i.reject(n(e))},function(e,t){i.reject(n(t,e||"unknown"))}),i}()},abortPreview:function(){this._pending&&this._pending.abort()},getPreview:function(e){var t,i=o.Deferred(),n="",s="",a=this;return o.extend(e,{action:"parse",sectionpreview:!0,pst:!0,mobileformat:!0,title:this.title,prop:["text","sections"]}),this.abortPreview(),t=this.api.post(e),this._pending=t.then(function(e){e&&e.parse&&e.parse.text?(0!==a.sectionId&&void 0!==e.parse.sections&&void 0!==e.parse.sections[0]&&(void 0!==e.parse.sections[0].anchor&&(s=e.parse.sections[0].anchor),void 0!==e.parse.sections[0].line&&(n=e.parse.sections[0].line)),i.resolve({text:e.parse.text["*"],id:s,line:n})):i.reject()},function(){i.reject()}).promise({abort:function(){t.abort()}}),i}},e.exports=a},"./src/mobile.editor.overlay/SourceEditorOverlay.js":function(e,t,i){var o=i("./src/mobile.editor.overlay/EditorOverlayBase.js"),n=i("./src/mobile.startup/util.js"),s=i("./src/mobile.startup/Section.js"),a=i("./src/mobile.editor.overlay/saveFailureMessage.js"),r=i("./src/mobile.editor.overlay/EditorGateway.js"),l=i("./src/mobile.editor.overlay/AbuseFilterPanel.js"),d=i("./src/mobile.startup/mfExtend.js"),c=i("./src/mobile.editor.overlay/BlockMessage.js"),h=i("./src/mobile.editor.overlay/VisualEditorOverlay.js");function p(e,t){this.isFirefox=/firefox/i.test(window.navigator.userAgent),this.gateway=new r({api:e.api,title:e.title,sectionId:e.sectionId,oldId:e.oldId,isNewPage:e.isNewPage,fromModified:!!t}),this.readOnly=!!e.oldId,this.dataPromise=t,this.isVisualEditorEnabled()&&(e.editSwitcher=!0),this.readOnly?(e.readOnly=!0,e.editingMsg=mw.msg("mobile-frontend-editor-viewing-source-page",e.title)):e.editingMsg=mw.msg("mobile-frontend-editor-editing-page",e.title),e.isVisualEditor=!1,e.previewingMsg=mw.msg("mobile-frontend-editor-previewing-page",e.title),o.call(this,n.extend(!0,{events:{"input .wikitext-editor":"onInputWikitextEditor"}},e))}d(p,o,{templatePartials:n.extend({},o.prototype.templatePartials,{content:n.template('\n<div lang="{{contentLang}}" dir="{{contentDir}}" class="editor-container">\n\t<textarea class="wikitext-editor" id="wikitext-editor" cols="40" rows="10" placeholder="{{placeholder}}"></textarea>\n\t<div class="preview content"></div>\n</div>\n\t\t')}),editor:"wikitext",sectionLine:"",isVisualEditorEnabled:function(){var e=mw.config.get("wgVisualEditorConfig")&&mw.config.get("wgVisualEditorConfig").namespaces;return e&&e.indexOf(mw.config.get("wgNamespaceNumber"))>-1&&"translation"!==mw.config.get("wgTranslatePageTranslation")&&"wikitext"===mw.config.get("wgPageContentModel")},onInputWikitextEditor:function(){this.gateway.setContent(this.$el.find(".wikitext-editor").val()),this.$el.find(".continue, .submit").prop("disabled",!1)},onClickBack:function(){o.prototype.onClickBack.apply(this,arguments),this._hidePreview()},postRender:function(){var e=this,t=this.options,i=t.isAnon&&!t.switched;this.log({action:"ready"}),this.log({action:"loaded"}),this.isVisualEditorEnabled()&&mw.loader.using("ext.visualEditor.switching").then(function(){var t,i=new OO.ui.ToolFactory,o=new OO.ui.ToolGroupFactory;i.register(mw.libs.ve.MWEditModeVisualTool),i.register(mw.libs.ve.MWEditModeSourceTool),(t=new OO.ui.Toolbar(i,o,{classes:["editor-switcher"]})).on("switchEditor",function(t){"visual"===t&&(e.gateway.hasChanged?e._switchToVisualEditor(e.options,e.gateway.content):e._switchToVisualEditor(e.options))}),t.setup([{name:"editMode",type:"list",icon:"edit",title:mw.msg("visualeditor-mweditmode-tooltip"),include:["editModeVisual","editModeSource"]}]),e.$el.find(".switcher-container").html(t.$element),t.emit("updateState")}),o.prototype.postRender.apply(this),this.$preview=this.$el.find(".preview"),this.$content=this.$el.find(".wikitext-editor"),this.$content.addClass("mw-editfont-"+mw.user.options.get("editfont")),i&&(this.$anonWarning=this.createAnonWarning(t),this.$el.find(".editor-container").append(this.$anonWarning),this.$content.hide(),this.$anonHiddenButtons=this.$el.find(".overlay-header .continue, .editor-switcher").hide(),this.hideSpinner()),this.$el.find(".license a").attr("target","_blank"),this.abuseFilterPanel=new l({overlayManager:this.overlayManager}).appendTo(this.$el.find(".panels")),this.readOnly&&this.$content.prop("readonly",!0),this.$content.on("input",this._resizeEditor.bind(this)),i||this._loadContent()},onClickAnonymous:function(){this.showSpinner(),this.$anonWarning.hide(),this.$anonHiddenButtons.show(),this._loadContent()},onStageChanges:function(){var e=this,t={text:this.getContent()};function i(){e.hideSpinner(),e.$preview.show()}this.scrollTop=n.getDocument().find("body").scrollTop(),this.$content.hide(),this.showSpinner(),mw.config.get("wgIsMainPage")&&(t.mainpage=1),this.gateway.getPreview(t).then(function(t){var o=t.text,n=t.line;e.sectionId=t.id,e.sectionLine=e.parseHTML("<div>").html(n).text(),new s({el:e.$preview,text:o}).$el.find("a").on("click",!1),i()},function(){e.$preview.addClass("error").text(mw.msg("mobile-frontend-editor-error-preview")),i()}),o.prototype.onStageChanges.apply(this,arguments)},_hidePreview:function(){this.gateway.abortPreview(),this.hideSpinner(),this.$preview.removeClass("error").hide(),this.$content.show(),window.scrollTo(0,this.scrollTop),this.showHidden(".initial-header"),this.abuseFilterPanel.hide()},_resizeEditor:function(){var e,t,i;this.isFirefox||(this.$scrollContainer?i=this.$scrollContainer:(t=OO.ui.Element.static.getClosestScrollableContainer(this.$content[0]),i=this.$el.find(t).length?this.$el.find(t):n.getDocument(),this.$scrollContainer=i,this.$content.css("padding-bottom",.6*this.$scrollContainer.height())),this.$content.prop("scrollHeight")&&i.length&&(e=i.scrollTop(),this.$content.css("height","auto").css("height",this.$content.prop("scrollHeight")+2+"px"),i.scrollTop(e)))},setContent:function(e){this.$content.show().val(e),this._resizeEditor()},getContent:function(){return this.$content.val()},_loadContent:function(){var e=this,t=this.$el;this.$content.hide(),this.showSpinner(),t.addClass("overlay-loading"),(this.dataPromise||this.gateway.getContent()).then(function(i){var o,n=i.text;e.setContent(n),e.gateway.fromModified&&e.onInputWikitextEditor(),i.blockinfo?mw.loader.using("moment").then(function(){o=e.parseBlockInfo(i.blockinfo),new c(o).toggle(),e.hide(),e.hideSpinner(),t.removeClass("overlay-loading")}):(e.hideSpinner(),t.removeClass("overlay-loading"))},function(){e.reportError(mw.msg("mobile-frontend-editor-error-loading")),t.removeClass("overlay-loading")})},_switchToVisualEditor:function(e,t){var i=this;this.log({action:"abort",type:"switchnochange",mechanism:"navigate"}),mw.storage.set("preferredEditor","VisualEditor"),this.showSpinner(),this.$content.hide(),mw.loader.using("ext.visualEditor.targetLoader").then(function(){return mw.libs.ve.targetLoader.addPlugin("mobile.editor.ve"),mw.libs.ve.targetLoader.loadModules("visual")}).then(function(){e.SourceEditorOverlay=p,e.switched=!0,i.hideSpinner(),delete e.className,t?e.dataPromise=mw.libs.ve.targetLoader.requestPageData("visual",mw.config.get("wgRelevantPageName"),{section:e.sectionId,oldId:e.oldId||mw.config.get("wgRevisionId"),targetName:"mobile",modified:!0,wikitext:t}):delete e.dataPromise,i.switching=!0,i.overlayManager.replaceCurrent(new h(e)),i.switching=!1},function(){i.hideSpinner(),i.$content.show()})},_showAbuseFilter:function(e,t){this.abuseFilterPanel.show(e,t),this.showHidden(".save-header"),this.$el.find(".continue, .submit").prop("disabled",this.abuseFilterPanel.isDisallowed)},onSaveBegin:function(){var e=this,t={summary:this.$el.find(".summary").val()};""!==e.sectionLine&&(t.summary="/* "+e.sectionLine+" */"+t.summary),o.prototype.onSaveBegin.apply(this,arguments),this.confirmAborted||(this.captchaId&&(t.captchaId=this.captchaId,t.captchaWord=this.$el.find(".captcha-word").val()),this.showHidden(".saving-header"),this.gateway.save(t).then(function(){var t=e.options.title;mw.config.get("wgIsMainPage")?window.location=mw.util.getUrl(t):e.onSaveComplete()},function(t){e.onSaveFailure(t)}))},onSaveFailure:function(e){var t,i;"captcha"===e.type?(this.captchaId=e.details.id,this.handleCaptcha(e.details)):"abusefilter"===e.type?this._showAbuseFilter(e.details.type,e.details.message):(i=a(e),"readonly"===e.type&&(t=mw.msg("apierror-readonly")),(i||t)&&(this.reportError(i,t),this.showHidden(".save-header, .save-panel"))),o.prototype.onSaveFailure.apply(this,arguments)},hasChanged:function(){return this.gateway.hasChanged}}),e.exports=p},"./src/mobile.editor.overlay/VisualEditorOverlay.js":function(e,t,i){var o=i("./src/mobile.editor.overlay/EditorOverlayBase.js"),n=i("./src/mobile.editor.overlay/EditorGateway.js"),s=i("./src/mobile.editor.overlay/BlockMessage.js"),a=i("./src/mobile.startup/mfExtend.js"),r=mw.loader.require("mediawiki.router"),l=i("./src/mobile.startup/util.js");function d(e){this.applyHeaderOptions(e,!0),o.call(this,l.extend({onBeforeExit:this.onBeforeExit.bind(this),isBorderBox:!1,className:"overlay editor-overlay editor-overlay-ve"},e)),this.SourceEditorOverlay=e.SourceEditorOverlay,this.isNewPage=e.isNewPage,this.gateway=new n({api:e.api,title:e.title,sectionId:e.sectionId,oldId:e.oldId,isNewPage:e.isNewPage})}a(d,o,{templatePartials:l.extend({},o.prototype.templatePartials,{editHeader:l.template('\n<div class="overlay-header header initial-header hideable hidden">\n\t<div class="toolbar"></div>\n</div>\n\t\t'),content:l.template('\n<div class="surface" lang="{{contentLang}}" dir="{{contentDir}}">\n</div>\n\t\t')}),editor:"visualeditor",applyHeaderOptions:function(e,t){e.hasToolbar=t,e.isVisualEditor=t},destroyTarget:function(){this.target&&(this.target.destroy(),this.target=null)},show:function(){var e=this,t=this.options,i=t.isAnon&&!t.switched;o.prototype.show.apply(this,arguments),this.options.switched||(this.hideSpinner(),this.$el.addClass("loading")),this.target=ve.init.mw.targetFactory.create("article",this,{$element:this.$el,section:this.options.sectionId||null}),this.target.once("surfaceReady",function(){this.emit("editor-loaded"),this.$el.removeClass("loading"),e.log({action:"ready"}),e.log({action:"loaded"})}.bind(this)),this.dataPromise=this.target.load(this.options.dataPromise),i?(this.$anonWarning=this.createAnonWarning(this.options),this.$el.append(this.$anonWarning),this.$el.find(".overlay-content").hide(),this.$el.removeClass("loading")):this.checkForBlocks()},onBeforeExit:function(e){var t=this;o.prototype.onBeforeExit.call(this,function(){e(),t.destroyTarget()})},onClickBack:function(){o.prototype.onClickBack.apply(this,arguments),this.switchToEditor()},onClickAnonymous:function(){var e=this;this.$anonWarning.hide(),this.checkForBlocks().then(function(){e.$el.find(".overlay-content").show()})},checkForBlocks:function(){var e=this;return this.dataPromise.then(function(t){t.visualeditor&&t.visualeditor.blockinfo&&mw.loader.using("moment").then(function(){var i=e.parseBlockInfo(t.visualeditor.blockinfo);new s(i).toggle(),e.hide()})})},switchToEditor:function(){this.showHidden(".initial-header")},switchToSourceEditor:function(e){var t=this.SourceEditorOverlay;this.log({action:"abort",type:"switchnochange",mechanism:"navigate"}),mw.storage.set("preferredEditor","SourceEditor"),this.showSpinner(),this.$el.find(".surface").hide(),this.hideSpinner(),this.applyHeaderOptions(this.options,!1),this.options.switched=!0,delete this.options.className,e&&(this.options.sectionId=null,r.navigateTo(document.title,{path:"#/editor/all",useReplaceState:!0})),this.switching=!0,this.overlayManager.replaceCurrent(new t(this.options,e)),this.switching=!1},onSaveComplete:function(){o.prototype.onSaveComplete.apply(this,arguments),this.destroyTarget()},hasChanged:function(){return this.target&&this.target.getSurface()&&this.target.getSurface().getModel().hasBeenModified()&&!this.saved}}),e.exports=d},"./src/mobile.editor.overlay/mobile.editor.overlay.js":function(e,t,i){var o=i("./src/mobile.startup/moduleLoaderSingleton.js"),n=i("./src/mobile.editor.overlay/SourceEditorOverlay.js"),s=i("./src/mobile.editor.overlay/VisualEditorOverlay.js"),a=i("./src/mobile.editor.overlay/schemaEditAttemptStep.js");o.define("mobile.editor.overlay/SourceEditorOverlay",n),o.define("mobile.editor.overlay/VisualEditorOverlay",s),a()},"./src/mobile.editor.overlay/schemaEditAttemptStep.js":function(e,t){e.exports=function(){var e=!!mw.util.getParamValue("trackdebug");(null!==mw.loader.getState("schema.EditAttemptStep")||e)&&mw.loader.using(["ext.eventLogging.subscriber"]).then(function(){var t=mw.eventLog.Schema,i=mw.user,o=mw.config.get("wgWMESchemaEditAttemptStepSamplingRate"),n={saveIntent:"save_intent",saveAttempt:"save_attempt",saveSuccess:"save_success",saveFailure:"save_failure"},s={},a=new t("EditAttemptStep",o,{page_id:mw.config.get("wgArticleId"),revision_id:mw.config.get("wgRevisionId"),page_title:mw.config.get("wgPageName"),page_ns:mw.config.get("wgNamespaceNumber"),user_id:i.getId(),user_class:i.isAnon()?"IP":void 0,user_editcount:mw.config.get("wgUserEditCount",0),mw_version:mw.config.get("wgVersion"),platform:"phone",integration:"page",page_token:i.getPageviewToken(),session_token:i.sessionId(),version:1});mw.trackSubscribe("mf.schemaEditAttemptStep",function(t,i,r){var l=n[i.action]||i.action,d=0;r=r||this.timeStamp,i[l+"_type"]=i.type,i[l+"_mechanism"]=i.mechanism,"init"!==i.action&&(d=Math.round(function(e,t,i){if(void 0!==t.timing)return t.timing;switch(e){case"ready":case"loaded":return i-s.init;case"saveIntent":return i-s.ready;case"saveAttempt":return i-s.saveIntent;case"saveSuccess":case"saveFailure":return mw.log.warn("mf.schemaEditAttemptStep: Do not rely on default timing value for saveSuccess/saveFailure"),-1;case"abort":switch(t.abort_type){case"preinit":return i-s.init;case"nochange":case"switchwith":case"switchwithout":case"switchnochange":case"abandon":return i-s.ready;case"abandonMidsave":return i-s.saveAttempt}return mw.log.warn("mf.schemaEditAttemptStep: Unrecognized abort type",t.type),-1}return mw.log.warn("mf.schemaEditAttemptStep: Unrecognized action",e),-1}(i.action,i,r)),i[l+"_timing"]=d),delete i.type,delete i.mechanism,i[l+"_message"]=i.message,delete i.message,i.is_oversample=!mw.eventLog.inSample(1/o),"abort"===i.action&&"switchnochange"!==i.abort_type?s={}:s[i.action]=r,"switchnochange"!==i.abort_type&&(s.abort&&"ready"===i.action?delete s.abort:e?function(){console.log.apply(console,arguments)}(t+"."+i.action,d+"ms",i):a.log(i,mw.config.get("wgWMESchemaEditAttemptStepOversample")||"all"===mw.config.get("wgMFSchemaEditAttemptStepOversample")||i.editor_interface===mw.config.get("wgMFSchemaEditAttemptStepOversample")?1:o))})})}}},[["./src/mobile.editor.overlay/mobile.editor.overlay.js",0,1]]]);
//# sourceMappingURL=mobile.editor.overlay.js.map.json