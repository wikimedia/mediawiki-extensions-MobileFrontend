(self.webpackChunkmfModules=self.webpackChunkmfModules||[]).push([[380],{"./src/mobile.startup/LanguageInfo.js":(e,t,s)=>{const r=s("./src/mobile.startup/util.js"),a=s("./src/mobile.startup/actionParams.js");e.exports=class{constructor(e){this.api=e}getLanguages(){return this.api.get(a({meta:"languageinfo",liprop:"code|autonym|name|bcp47"})).then((e=>{const t=[];return Object.keys(e.query.languageinfo).forEach((s=>{const r=e.query.languageinfo[s];r.code.toLowerCase()===r.bcp47.toLowerCase()&&r.autonym&&t.push(r)})),t}),(()=>r.Deferred().reject())).then((e=>({languages:e.map((e=>(e.url="#",e.lang=e.code,e.langname=e.name,e.title=e.name,e)))})),(()=>r.Deferred().reject()))}}},"./src/mobile.startup/MessageBox.js":(e,t,s)=>{const r=s("./src/mobile.startup/View.js"),a=s("./src/mobile.startup/util.js");e.exports=class extends r{constructor(e){super(e)}get isTemplateMode(){return!0}get defaults(){return{}}get template(){return a.template('\n<div\n  class="cdx-message cdx-message--block cdx-message--{{type}} {{className}}"\n  aria-live="polite"\n>\n  \x3c!-- Empty span for message icon. --\x3e\n  <span class="cdx-message__icon"></span>\n  \x3c!-- Div for content. --\x3e\n  <div class="cdx-message__content">\n  {{#heading}}<h2>{{heading}}</h2>{{/heading}}\n  {{{msg}}}\n  </div>\n</div>\n\t')}}},"./src/mobile.startup/Section.js":(e,t,s)=>{const r=s("./src/mobile.startup/util.js"),a=s("./src/mobile.startup/View.js");class n extends a{constructor(e){e.tag="h"+e.level,super(e),this.line=e.line,this.text=e.text,this.hasReferences=e.hasReferences||!1,this.id=e.id||null,this.anchor=e.anchor,this.subsections=[],(e.subsections||[]).forEach((e=>this.subsections.push(new n(e))))}get template(){return r.template('\n<h{{level}} id="{{anchor}}">{{{line}}}</h{{level}}>\n{{{text}}}\n\t')}get defaults(){return{line:void 0,text:""}}}e.exports=n},"./src/mobile.startup/languageOverlay/getDeviceLanguage.js":e=>{e.exports=function(e){const t=e.languages?e.languages[0]:e.language||e.userLanguage||e.browserLanguage||e.systemLanguage;return t?t.toLowerCase():void 0}},"./src/mobile.startup/languageOverlay/languageInfoOverlay.js":(e,t,s)=>{const r=s("./src/mobile.startup/moduleLoaderSingleton.js"),a=s("./src/mobile.startup/languageOverlay/getDeviceLanguage.js"),n=s("./src/mobile.startup/Overlay.js"),i=s("./src/mobile.startup/promisedView.js");function o(e,t){return mw.loader.using("mobile.languages.structured").then((()=>e.getLanguages())).then((e=>new(r.require("mobile.languages.structured/LanguageSearcher"))({languages:e.languages,variants:e.variants,showSuggestedLanguages:t,deviceLanguage:a(navigator)})))}function c(e,t){return n.make({heading:mw.msg("mobile-frontend-language-heading"),className:"overlay language-info-overlay"},i(o(e,t)))}c.test={loadLanguageInfoSearcher:o},e.exports=c},"./src/mobile.startup/languageOverlay/languageOverlay.js":(e,t,s)=>{const r=s("./src/mobile.startup/moduleLoaderSingleton.js"),a=s("./src/mobile.startup/languageOverlay/getDeviceLanguage.js"),n=s("./src/mobile.startup/Overlay.js"),i=s("./src/mobile.startup/MessageBox.js"),o=s("./src/mobile.startup/currentPageHTMLParser.js")(),c=s("./src/mobile.startup/promisedView.js");function l(){return mw.loader.using("mobile.languages.structured").then((()=>o.getLanguages(mw.config.get("wgTitle")))).then((e=>new(r.require("mobile.languages.structured/LanguageSearcher"))({languages:e.languages,variants:e.variants,showSuggestedLanguages:!0,deviceLanguage:a(navigator),onOpen:e=>mw.hook("mobileFrontend.languageSearcher.onOpen").fire(e)})),(()=>new i({type:"error",className:"content",msg:mw.msg("mobile-frontend-languages-structured-overlay-error")})))}function u(){return n.make({heading:mw.msg("mobile-frontend-language-heading"),className:"overlay language-overlay"},c(l()))}u.test={loadLanguageSearcher:l},e.exports=u},"./src/mobile.startup/mediaViewer/overlay.js":(e,t,s)=>{const r=s("./src/mobile.startup/moduleLoaderSingleton.js"),a=s("./src/mobile.startup/promisedView.js"),n=s("./src/mobile.startup/util.js"),i=s("./src/mobile.startup/headers.js").header,o=s("./src/mobile.startup/icons.js"),c=s("./src/mobile.startup/Overlay.js");e.exports=function(e){return c.make({headers:[i("",[],o.cancel("gray"))],className:"overlay media-viewer"},a(n.Promise.all([mw.loader.using("mobile.mediaViewer")]).then((()=>new(0,r.require("mobile.mediaViewer").ImageCarousel)(e)))))}},"./src/mobile.startup/mobile.startup.js":(e,t,s)=>{const r=s("./src/mobile.startup/currentPageHTMLParser.js"),a=s("./src/mobile.startup/time.js"),n=s("./src/mobile.startup/LanguageInfo.js"),i=s("./src/mobile.startup/currentPage.js"),o=s("./src/mobile.startup/Drawer.js"),c=s("./src/mobile.startup/CtaDrawer.js"),l=s("./src/mobile.startup/lazyImages/lazyImageLoader.js"),u=s("./src/mobile.startup/icons.js"),h=s("./src/mobile.startup/PageHTMLParser.js"),m=s("./src/mobile.startup/showOnPageReload.js"),p=s("./src/mobile.startup/OverlayManager.js"),d=s("./src/mobile.startup/View.js"),g=s("./src/mobile.startup/Overlay.js"),f=s("./src/mobile.startup/references/references.js"),b={SearchOverlay:s("./src/mobile.startup/search/SearchOverlay.js"),SearchGateway:s("./src/mobile.startup/search/SearchGateway.js")},w=s("./src/mobile.startup/promisedView.js"),v=s("./src/mobile.startup/headers.js"),y=s("./src/mobile.startup/Skin.js"),j={overlay:s("./src/mobile.startup/mediaViewer/overlay.js")},x=s("./src/mobile.startup/languageOverlay/languageInfoOverlay.js"),S=s("./src/mobile.startup/languageOverlay/languageOverlay.js"),R=s("./src/mobile.startup/amcOutreach/amcOutreach.js"),C=s("./src/mobile.startup/util.js"),O=s("./src/mobile.startup/actionParams.js"),L=s("./src/mobile.startup/Icon.js"),k=s("./src/mobile.startup/IconButton.js"),T=s("./src/mobile.startup/MessageBox.js"),$=s("./src/mobile.startup/Section.js"),M=s("./src/mobile.startup/Button.js");e.exports={Section:$,MessageBox:T,Icon:L,IconButton:k,Button:M,actionParams:O,util:C,amcOutreach:R,headers:v,overlayHeader:v.header,Drawer:o,CtaDrawer:c,View:d.ClassES5,Overlay:g.ClassES5,currentPageHTMLParser:r,getOverlayManager:()=>p.getSingleton(),currentPage:i,PageHTMLParser:h,spinner:u.spinner,cancelIcon:u.cancel,mediaViewer:j,references:f,search:b,time:a,promisedView:w,loadAllImagesInPage:()=>l.loadImages(l.queryPlaceholders(document.getElementById("content"))),notifyOnPageReload:e=>m(e),license:()=>y.getSingleton().getLicenseMsg(),languages:{languageOverlay:S,languageInfoOverlay:(e,t)=>x(new n(e),t)}}},"./src/mobile.startup/promisedView.js":(e,t,s)=>{const r=s("./src/mobile.startup/icons.js"),a=s("./src/mobile.startup/View.js");e.exports=function(e){const t=new a({className:"promised-view"});return t.$el.append(r.spinner().$el),e.then((e=>{t.$el.replaceWith(e.$el),t.$el=e.$el}),(e=>{e&&e.$el&&(t.$el.replaceWith(e.$el),t.$el=e.$el)})),t}},"./src/mobile.startup/references/ReferencesGateway.js":e=>{class t{constructor(e){this.api=e}getReference(e,t,s){}}t.ERROR_NOT_EXIST="NOT_EXIST_ERROR",t.ERROR_OTHER="OTHER_ERROR",e.exports=t},"./src/mobile.startup/references/ReferencesHtmlScraperGateway.js":(e,t,s)=>{const r=s("./src/mobile.startup/references/ReferencesGateway.js"),a=s("./src/mobile.startup/util.js");e.exports=class extends r{constructor(){super(arguments),this.EXTERNAL_LINK_CLASS="external--reference"}getReferenceFromContainer(e,t){const s=a.Deferred(),n=t.find("#"+a.escapeSelector(e));if(n.length){let e;const t=n.closest("ol"),r=t.hasClass("mw-extended-references");r&&(e=t.parent()),(e||n).find(".external").addClass(this.EXTERNAL_LINK_CLASS),s.resolve({text:this.getReferenceHtml(n),parentText:this.getReferenceHtml(e),isSubref:r})}else s.reject(r.ERROR_NOT_EXIST);return s.promise()}getReferenceHtml(e){return e?e.children(".mw-reference-text, .reference-text").first().html():""}getReference(e,t,s){const r=mw.util.percentDecodeFragment(e.slice(1));return this.getReferenceFromContainer(r,s.$el.find("ol.references"))}}},"./src/mobile.startup/references/references.js":(e,t,s)=>{const r=s("./src/mobile.startup/Drawer.js"),a=s("./src/mobile.startup/util.js"),n=s("./src/mobile.startup/icons.js"),i=s("./src/mobile.startup/references/ReferencesGateway.js"),o=s("./src/mobile.startup/Icon.js"),c=s("./src/mobile.startup/references/ReferencesHtmlScraperGateway.js"),l=s("./src/mobile.startup/IconButton.js");function u(e){return t=>{const s=t.currentTarget.querySelector("a");if(s)return e(s.getAttribute("href"),s.textContent),!1}}function h(e){const t=e.error?new l({name:"error",isSmall:!0}).$el:null,s=e.isSubref?e.parentText:e.text,i=a.parseHTML("<div>").addClass("main-reference-content").html(s);s||i.append(n.spinner().$el);const c=e.isSubref?a.parseHTML("<div>").html(e.text):"";return new r(a.extend({showCollapseIcon:!1,className:"drawer position-fixed text references-drawer",events:{"click sup a":e=>{e.preventDefault()},"click sup":e.onNestedReferenceClick&&u(e.onNestedReferenceClick)},children:[a.parseHTML("<div>").addClass("references-drawer__header").append([new o({icon:"reference",isSmall:!0}).$el,a.parseHTML("<span>").addClass("references-drawer__title").text(mw.msg("mobile-frontend-references-citation")),n.cancel("gray",{isSmall:!0,additionalClassNames:"mf-button-flush-right"}).$el]),a.parseHTML("<div>").addClass("mw-parser-output").append([t,a.parseHTML("<sup>").text(e.title),i,c])]},e))}const m={test:{makeOnNestedReferenceClickHandler:u},ReferencesHtmlScraperGateway:c,referenceDrawer:h,showReference:(e,t,s,r,n,o,c)=>n.getReference(e,t,r).then((e=>{const i=h(a.extend({title:s,text:e.text,parentText:e.parentText,isSubref:e.isSubref,onNestedReferenceClick(e,s){m.showReference(e,t,s,r,n).then((e=>{o.onShowNestedReference?c(i,e):(mw.log.warn("Please provide onShowNestedReferences parameter."),document.body.appendChild(e.$el[0]),i.hide(),e.show())}))}},o));return i}),(e=>{if(e!==i.ERROR_NOT_EXIST)return h({error:!0,title:s,text:mw.msg("mobile-frontend-references-citation-error")})}))};e.exports=m},"./src/mobile.startup/search/SearchGateway.js":(e,t,s)=>{const r=s("./src/mobile.startup/page/pageJSONParser.js"),a=s("./src/mobile.startup/util.js"),n=s("./src/mobile.startup/extendSearchParams.js");e.exports=class{constructor(e){this.api=e,this.searchCache={},this.generator=mw.config.get("wgMFSearchGenerator"),this.searchNamespace=0}getApiData(e){const t=this.generator.prefix,s=n("search",{generator:this.generator.name});return s.redirects="",s["g"+t+"search"]=e,s["g"+t+"namespace"]=this.searchNamespace,s["g"+t+"limit"]=15,s.pilimit&&(s.pilimit=15,s.pithumbsize=mw.config.get("wgMFThumbnailSizes").tiny),s}_createSearchRegEx(e){return e=e.replace(/[-\[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),new RegExp("^("+e+")","ig")}_highlightSearchTerm(e,t){return e=a.parseHTML("<span>").text(e).html(),t=t.trim(),t=a.parseHTML("<span>").text(t).html(),e.replace(this._createSearchRegEx(t),"<strong>$1</strong>")}_getPage(e,t){const s=r.parse(t);return s.displayTitle=this._highlightSearchTerm(t.displaytext?t.displaytext:s.title,e),s.index=t.index,s}_processData(e,t){let s=[];return t.query&&(s=t.query.pages||{},s=Object.keys(s).map((t=>this._getPage(e,s[t]))),s.sort(((e,t)=>e.index-t.index))),s}search(e){const t=mw.config.get("wgMFScriptPath");if(!this.isCached(e)){const s=this.api.get(this.getApiData(e),t?{url:t}:void 0),r=s.then(((t,s)=>({query:e,results:this._processData(e,t),searchId:s&&s.getResponseHeader("x-search-id")})),(()=>{this.searchCache[e]=void 0}));this.searchCache[e]=r.promise({abort(){s.abort()}})}return this.searchCache[e]}isCached(e){return Boolean(this.searchCache[e])}}},"./src/mobile.startup/search/SearchHeaderView.js":(e,t,s)=>{const r=s("./src/mobile.startup/util.js"),a=s("./src/mobile.startup/View.js"),n=s("./src/mobile.startup/IconButton.js");e.exports=class extends a{constructor(e){super(r.extend({autocapitalize:"sentences"},e,{events:{"input input":"onInput"}}))}onInput(e){const t=e.target.value;this.options.onInput(t),t?this.clearIcon.$el.show():this.clearIcon.$el.hide()}get isTemplateMode(){return!0}get template(){return r.template('<div class="overlay-title search-header-view">\n\t\t<form method="get" action="{{action}}" class="search-box">\n\t\t<input class="search mf-icon-search" type="search" name="search"\n\t\t\tautocapitalize="{{autocapitalize}}"\n\t\t\tautocomplete="off" placeholder="{{placeholderMsg}}" aria-label="{{placeholderMsg}}" value="{{searchTerm}}">\n\t\t<input type="hidden" name="title" value="{{defaultSearchPage}}">\n\t\t</form>\n</div>')}postRender(){const e=new n({tagName:"button",icon:"clear",size:"medium",isSmall:!0,label:mw.msg("mobile-frontend-clear-search"),additionalClassNames:"clear",events:{click:()=>(this.$el.find("input").val("").trigger("focus"),this.options.onInput(""),e.$el.hide(),!1)}});this.clearIcon=e,e.$el.hide(),e.$el.attr("aria-hidden","true"),this.$el.find("form").append(e.$el)}}},"./src/mobile.startup/search/SearchOverlay.js":(e,t,s)=>{const r=s("./src/mobile.startup/Overlay.js"),a=s("./src/mobile.startup/util.js"),n=s("./src/mobile.startup/search/searchHeader.js"),i=s("./src/mobile.startup/search/SearchResultsView.js"),o=s("./src/mobile.startup/watchstar/WatchstarPageList.js");e.exports=class extends r{constructor(e){const t=n(e.placeholderMsg,e.action||mw.config.get("wgScript"),(e=>this.performSearch(e)),e.defaultSearchPage||"",e.autocapitalize),s=a.extend(!0,{headerChrome:!0,isBorderBox:!1,className:"overlay search-overlay",headers:[t],events:{"click .search-content":"onClickSearchContent","click .overlay-content":"onClickOverlayContent","click .overlay-content > div":e=>{mw.hook("ext.wikimediaEvents.webUIClick.event").fire(e),e.stopPropagation()},"touchstart .results":"hideKeyboardOnScroll","mousedown .results":"hideKeyboardOnScroll","click .results a":"onClickResult"}},e);super(s),this.header=t,this.api=s.api,this.gateway=s.gateway||new s.gatewayClass(this.api),this.router=s.router,this.currentSearchId=null,this.resetSearch(!0)}onClickSearchContent(){const e=this.$el.find("form"),t=e[0].parentNode;this.parseHTML("<input>").attr({type:"hidden",name:"fulltext",value:"search"}).appendTo(e),setTimeout((()=>{e[0].parentNode||e.appendTo(t),e.trigger("submit")}),0)}onClickOverlayContent(){this.$el.find(".cancel").trigger("click")}hideKeyboardOnScroll(){this.getInput().trigger("blur")}onClickResult(e){const t=this.$el.find(e.currentTarget);mw.hook("ext.MobileFrontend.searchOverlay.click").fire(),e.preventDefault(),this.router.back().then((()=>{if(this.currentSearchId){const e=new URL(location.href);e.searchParams.set("searchToken",this.currentSearchId),this.router.navigateTo(document.title,{path:e.toString(),useReplaceState:!0}),this.currentSearchId=null}window.location.href=t.attr("href")}))}getInput(){return this.$el.find(this.header).find("input")}postRender(){const e=new i({searchContentLabel:mw.msg("mobile-frontend-search-content"),noResultsMsg:mw.msg("mobile-frontend-search-no-results"),searchContentNoResultsMsg:mw.message("mobile-frontend-search-content-no-results").parse()});let t;this.$el.find(".overlay-content").append(e.$el),super.postRender();const s=this.getInput();this.$searchContent=e.$el.hide(),this.$resultContainer=e.$el.find(".results-list-container"),this.$resultContainer[0].addEventListener("touchstart",(e=>{document.activeElement===s[0]&&e.stopPropagation()}));const r=()=>{this.$spinner.hide(),clearTimeout(t)};this.$spinner=e.$el.find(".spinner-container"),this.on("search-start",(e=>{t&&r(),t=setTimeout((()=>this.$spinner.show()),2e3-e.delay)})),this.on("search-results",r)}showKeyboard(){const e=this.getInput(),t=e.val().length;e.trigger("focus"),e[0].setSelectionRange&&e[0].setSelectionRange(t,t)}show(){super.show(),mw.hook("ext.MobileFrontend.searchOverlay.open").fire(),this.showKeyboard()}performSearch(e){this.resetSearch();const t=this.getInput(),s=this.api,r=this.gateway.isCached(e)?0:300;e!==this.lastQuery&&(mw.hook("ext.MobileFrontend.searchOverlay.startQuery").fire(),this._pendingQuery&&this._pendingQuery.abort(),clearTimeout(this.timer),e.length?this.timer=setTimeout((()=>{const r=this.gateway.search(e);this._pendingQuery=r.then((e=>{this.currentSearchId=e.searchId,e&&e.query===t.val()&&(this.$el.toggleClass("no-results",0===e.results.length),this.$searchContent.show().find("p").hide().filter(e.results.length?".with-results":".without-results").show(),new o({api:s,funnel:"search",pages:e.results,el:this.$resultContainer}),this.$results=this.$resultContainer.find("li")),mw.hook("ext.MobileFrontend.searchOverlay.displayResults").fire()})).promise({abort(){r.abort()}})}),r):this.resetSearch(!0),this.lastQuery=e)}resetSearch(e){const t=this.$el.find(".overlay-content");t.children().hide(),e&&mw.hook("ext.MobileFrontend.searchOverlay.empty").fire(t[0])}}},"./src/mobile.startup/search/SearchResultsView.js":(e,t,s)=>{const r=s("./src/mobile.startup/View.js"),a=s("./src/mobile.startup/Icon.js"),n=s("./src/mobile.startup/Anchor.js"),i=s("./src/mobile.startup/icons.js").spinner().$el,o=s("./src/mobile.startup/util.js");e.exports=class extends r{get isTemplateMode(){return!0}get template(){return o.template('\n<div class="search-results-view">\n\t<div class="search-content">\n\t\t<div class="caption">\n\t\t\t<p class="with-results">{{searchContentLabel}}</p>\n\t\t\t<p class="without-results">{{noResultsMsg}}</p>\n\t\t\t<p class="without-results">{{{searchContentNoResultsMsg}}}</p>\n\t\t</div>\n\t</div>\n\t<div class="spinner-container position-fixed"></div>\n\t<div class="results">\n\t\t<div class="results-list-container"></div>\n\t\t{{#feedback}}\n\t\t\t<div class="search-feedback">\n\t\t\t\t{{prompt}}\n\t\t\t</div>\n\t\t{{/feedback}}\n\t</div>\n</div>')}preRender(){mw.config.get("wgCirrusSearchFeedbackLink")&&(this.options.feedback={prompt:mw.msg("mobile-frontend-search-feedback-prompt")})}postRender(e){const t=mw.config.get("wgCirrusSearchFeedbackLink");super.postRender(e),this.$el.find(".search-content").prepend(new a({icon:"articlesSearch"}).$el),this.$el.find(".spinner-container").append(i),t&&this.$el.find(".search-feedback").append(new n({label:mw.msg("mobile-frontend-search-feedback-link-text"),href:t}).$el)}}},"./src/mobile.startup/search/searchHeader.js":(e,t,s)=>{const r=s("./src/mobile.startup/headers.js").formHeader,a=s("./src/mobile.startup/search/SearchHeaderView.js"),n=s("./src/mobile.startup/icons.js");e.exports=function(e,t,s,i,o){return r(new a({placeholderMsg:e,autocapitalize:o,action:t,onInput:s,defaultSearchPage:i}),[n.cancel()],!1)}},"./src/mobile.startup/time.js":(e,t,s)=>{const r=["seconds","minutes","hours","days","months","years"],a=s("./src/mobile.startup/util.js"),n=[1,60,3600,86400,2592e3,31536e3];function i(e){let t=0;for(;t<n.length&&e>n[t+1];)++t;return{value:Math.round(e/n[t]),unit:r[t]}}function o(e){return i(Math.round(Date.now()/1e3)-e)}function c(e){return"seconds"===e.unit&&e.value<10}e.exports={getLastModifiedMessage:function(e,t,s,r){const n=void 0===r,i=[];s=s||"unknown";const l=o(e);c(l)?i.push("mobile-frontend-last-modified-with-user-just-now",s,t):i.push({seconds:"mobile-frontend-last-modified-with-user-seconds",minutes:"mobile-frontend-last-modified-with-user-minutes",hours:"mobile-frontend-last-modified-with-user-hours",days:"mobile-frontend-last-modified-with-user-days",months:"mobile-frontend-last-modified-with-user-months",years:"mobile-frontend-last-modified-with-user-years"}[l.unit],s,t,mw.language.convertNumber(l.value));const u=n?a.parseHTML("<strong>").attr("class","last-modified-text-accent"):a.parseHTML("<a>").attr("href",r||"#"),h=n?a.parseHTML("<span>").attr("class","last-modified-text-accent"):a.parseHTML("<a>").attr("href",mw.util.getUrl("User:"+t));return i.push(u,mw.language.convertNumber(t?1:0),t?h:""),mw.message.apply(this,i).parse()},getRegistrationMessage:function(e,t){const s=[];t=t||"unknown";const r=o(parseInt(e,10));return c(r)?s.push("mobile-frontend-joined-just-now",t):s.push({seconds:"mobile-frontend-joined-seconds",minutes:"mobile-frontend-joined-minutes",hours:"mobile-frontend-joined-hours",days:"mobile-frontend-joined-days",months:"mobile-frontend-joined-months",years:"mobile-frontend-joined-years"}[r.unit],t,mw.language.convertNumber(r.value)),mw.message.apply(this,s).parse()},timeAgo:i,getTimeAgoDelta:o,isNow:c,isRecent:function(e){return["seconds","minutes","hours"].indexOf(e.unit)>-1}}}},e=>{e.O(0,[569],(()=>e(e.s="./src/mobile.startup/mobile.startup.js")));var t=e.O();(this.mfModules=this.mfModules||{})["mobile.startup"]=t}]);
//# sourceMappingURL=mobile.startup.js.map.json