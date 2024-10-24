(self.webpackChunkmfModules=self.webpackChunkmfModules||[]).push([[799],{"./src/mobile.languages.structured/LanguageSearcher.js":(e,t,a)=>{var s=a("./src/mobile.startup/View.js"),n=a("./src/mobile.startup/util.js"),r=a("./src/mobile.languages.structured/util.js");function l(e){var t=this,a=r.getStructuredLanguages(e.languages,e.variants,r.getFrequentlyUsedLanguages(),e.showSuggestedLanguages,e.deviceLanguage);s.call(this,n.extend({className:"language-searcher",events:{"click a":"onLinkClick","click .language-search-banner":"onSearchBannerClick","input .search":"onSearchInput"},inputPlaceholder:mw.msg("mobile-frontend-languages-structured-overlay-search-input-placeholder"),allLanguagesHeader:mw.msg("mobile-frontend-languages-structured-overlay-all-languages-header").toLocaleUpperCase(),suggestedLanguagesHeader:mw.msg("mobile-frontend-languages-structured-overlay-suggested-languages-header").toLocaleUpperCase(),noResultsFoundHeader:mw.msg("mobile-frontend-languages-structured-overlay-no-results"),noResultsFoundMessage:mw.msg("mobile-frontend-languages-structured-overlay-no-results-body"),allLanguages:a.all,allLanguagesCount:a.all.length,suggestedLanguages:a.suggested,suggestedLanguagesCount:a.suggested.length,showSuggestedLanguagesHeader:a.suggested.length>0},e));var l=e.onOpen;l&&setTimeout((function(){l(t)}),0)}a("./src/mobile.startup/mfExtend.js")(l,s,{template:n.template('\n<div class="panel">\n\t<div class="panel-body search-box">\n\t\t<input type="search" class="search" placeholder="{{inputPlaceholder}}">\n\t</div>\n</div>\n\n<div class="overlay-content-body">\n\t{{#showSuggestedLanguagesHeader}}\n\t<h3 class="list-header">{{suggestedLanguagesHeader}}</h3>\n\t{{/showSuggestedLanguagesHeader}}\n\t{{#suggestedLanguagesCount}}\n\t<ol class="site-link-list suggested-languages">\n\t\t{{#suggestedLanguages}}\n\t\t\t<li>\n\t\t\t\t<a href="{{url}}" class="{{lang}}" hreflang="{{lang}}" lang="{{lang}}" dir="{{dir}}">\n\t\t\t\t\t<span class="autonym">{{autonym}}</span>\n\t\t\t\t\t{{#title}}\n\t\t\t\t\t\t<span class="title">{{title}}</span>\n\t\t\t\t\t{{/title}}\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t{{/suggestedLanguages}}\n\t</ol>\n\t{{/suggestedLanguagesCount}}\n\t{{#bannerHTML}}\n\t<div class="language-search-banner">\n\t\t{{{.}}}\n\t</div>\n\t{{/bannerHTML}}\n\t{{#allLanguagesCount}}\n\t<h3 class="list-header">{{allLanguagesHeader}} ({{allLanguagesCount}})</h3>\n\t<ul class="site-link-list all-languages">\n\t\t{{#allLanguages}}\n\t\t\t<li>\n\t\t\t\t<a href="{{url}}" class="{{lang}}" hreflang="{{lang}}" lang="{{lang}}" dir="{{dir}}">\n\t\t\t\t\t<span class="autonym">{{autonym}}</span>\n\t\t\t\t\t{{#title}}\n\t\t\t\t\t\t<span class="title">{{title}}</span>\n\t\t\t\t\t{{/title}}\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t{{/allLanguages}}\n\t</ul>\n\t{{/allLanguagesCount}}\n\t<section class="empty-results hidden">\n\t\t<h4 class="empty-results-header">{{noResultsFoundHeader}}</h4>\n\t\t<p class="empty-results-body">{{noResultsFoundMessage}}</p>\n\t</section>\n</div>\n\t'),postRender:function(){this.$siteLinksList=this.$el.find(".site-link-list"),this.$languageItems=this.$siteLinksList.find("a"),this.$subheaders=this.$el.find("h3"),this.$emptyResultsSection=this.$el.find(".empty-results")},addBanner:function(e,t){this.options.bannerHTML=e,this.options.bannerFirstLanguage=t,this.options.showSuggestedLanguagesHeader=!0,this.render()},onSearchBannerClick:function(){this.$el.find(".search").val(this.options.bannerFirstLanguage).trigger("input")},onLinkClick:function(e){var t=this.$el.find(e.currentTarget).attr("lang");mw.hook("mobileFrontend.languageSearcher.linkClick").fire(t),r.saveLanguageUsageCount(t,r.getFrequentlyUsedLanguages())},onSearchInput:function(e){var t=void 0===e.originalEvent?"entrypoint-banner":"ui";this.filterLanguages(e.target.value.toLowerCase(),t)},filterLanguages:function(e,t){var a=[];e?(this.options.languages.forEach((function(t){var s=t.langname;(t.autonym.toLowerCase().indexOf(e)>-1||s&&s.toLowerCase().indexOf(e)>-1||t.lang.toLowerCase().indexOf(e)>-1)&&a.push(t.lang)})),this.options.variants&&this.options.variants.forEach((function(t){(t.autonym.toLowerCase().indexOf(e)>-1||t.lang.toLowerCase().indexOf(e)>-1)&&a.push(t.lang)})),this.$languageItems.addClass("hidden"),a.length?(this.$siteLinksList.find(".".concat(mw.util.escapeRegExp(a.join(",.")))).removeClass("hidden"),this.$emptyResultsSection.addClass("hidden")):(this.$emptyResultsSection.removeClass("hidden"),mw.hook("mobileFrontend.languageSearcher.noresults").fire(e,this.$emptyResultsSection.get(0),t)),this.$siteLinksList.addClass("filtered"),this.$subheaders.addClass("hidden")):(this.$languageItems.removeClass("hidden"),this.$siteLinksList.removeClass("filtered"),this.$subheaders.removeClass("hidden"),this.$emptyResultsSection.addClass("hidden"))}}),e.exports=l},"./src/mobile.languages.structured/mobile.languages.structured.js":(e,t,a)=>{var s=a("./src/mobile.startup/moduleLoaderSingleton.js"),n=a("./src/mobile.languages.structured/LanguageSearcher.js");s.define("mobile.languages.structured/LanguageSearcher",n)},"./src/mobile.languages.structured/rtlLanguages.js":e=>{e.exports=["acm","aeb","aeb-arab","apc","ar","arc","arq","ary","arz","azb","bcc","bgn","bqi","ckb","dv","fa","glk","he","hno","khw","kk-arab","kk-cn","ks","ks-arab","ku-arab","lki","lrc","luz","ms-arab","mzn","nqo","pnb","ps","sd","sdh","skr","skr-arab","ug","ug-arab","ur","yi"]},"./src/mobile.languages.structured/util.js":(e,t,a)=>{var s=a("./src/mobile.startup/util.js"),n=a("./src/mobile.languages.structured/rtlLanguages.js");e.exports={getDir:function(e){var t=n.indexOf(e.lang)>-1?"rtl":"ltr";return s.extend({},e,{dir:t})},getStructuredLanguages:function(e,t,a,s,n){var r=this,l=Object.prototype.hasOwnProperty,u=0,g=0,i=[],o=[];n=function(e,t){var a,s=Object.prototype.hasOwnProperty,n={};if(t){var r=t.indexOf("-");return-1!==r&&(a=t.slice(0,r)),e.forEach((function(e){e.lang!==a&&e.lang!==t||(n[e.lang]=!0)})),s.call(n,t)?t:s.call(n,a)?a:void 0}}(e,n),n&&(Object.keys(a).forEach((function(e){var t=a[e];u=u<t?t:u,g=g>t?t:g})),a[n]=u+1);var d=function(e){return e.dir?e:r.getDir(e)};return s?e.map(d).forEach((function(e){l.call(a,e.lang)?(e.frequency=a[e.lang],i.push(e)):o.push(e)})):o=e.map(d),t&&s&&t.map(d).forEach((function(e){l.call(a,e.lang)?e.frequency=a[e.lang]:e.frequency=g-1,i.push(e)})),i=i.sort((function(e,t){return t.frequency-e.frequency})),o=o.sort((function(e,t){return e.autonym.toLocaleLowerCase()<t.autonym.toLocaleLowerCase()?-1:1})),{suggested:i,all:o}},getFrequentlyUsedLanguages:function(){var e=mw.storage.get("langMap");return e?JSON.parse(e):{}},saveFrequentlyUsedLanguages:function(e){mw.storage.set("langMap",JSON.stringify(e))},saveLanguageUsageCount:function(e,t){var a=t[e]||0;a+=1,t[e]=a>100?100:a,this.saveFrequentlyUsedLanguages(t)}}}},e=>{e.O(0,[569],(()=>e(e.s="./src/mobile.languages.structured/mobile.languages.structured.js")));var t=e.O();(this.mfModules=this.mfModules||{})["mobile.languages.structured"]=t}]);
//# sourceMappingURL=mobile.languages.structured.js.map.json