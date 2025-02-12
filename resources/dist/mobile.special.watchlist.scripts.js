(self.webpackChunkmfModules=self.webpackChunkmfModules||[]).push([[601],{"./src/mobile.special.watchlist.scripts/WatchList.js":(t,e,s)=>{var i=s("./src/mobile.startup/mfExtend.js"),l=s("./src/mobile.startup/PageList.js"),r=s("./src/mobile.startup/watchstar/WatchstarPageList.js"),n=s("./src/mobile.startup/ScrollEndEventEmitter.js"),a=s("./src/mobile.startup/util.js"),o=s("./src/mobile.special.watchlist.scripts/WatchListGateway.js");function c(t){var e,s=a.extend({},{isBorderBox:!1},t);this.scrollEndEventEmitter=new n(s.eventBus),this.scrollEndEventEmitter.on(n.EVENT_SCROLL_END,this._loadPages.bind(this)),s.el&&(e=this.getLastTitle(s.el)),this.gateway=new o(s.api,e),r.call(this,s)}i(c,r,{preRender:function(){this.scrollEndEventEmitter.disable(),this.scrollEndEventEmitter.setElement(this.$el)},postRender:function(){var t,e;l.prototype.postRender.apply(this),t=this.queryUnitializedItems(),e=Object.keys(this.parsePagesFromItems(t)).reduce((function(t,e){return t[e]=!0,t}),{}),this.renderItems(t,e),this.scrollEndEventEmitter.enable()},_loadPages:function(){this.gateway.loadWatchlist().then(function(t){t.forEach(function(t){this.appendPage(t)}.bind(this)),this.render()}.bind(this))},appendPage:function(t){var e=a.extend({},t,{wikidataDescription:void 0});this.$el.append(this.templatePartials.item.render(e))},getLastTitle:function(t){return t.find("li").last().attr("title")}}),t.exports=c},"./src/mobile.special.watchlist.scripts/WatchListGateway.js":(t,e,s)=>{var i=s("./src/mobile.startup/page/pageJSONParser.js"),l=s("./src/mobile.startup/util.js"),r=s("./src/mobile.startup/extendSearchParams.js");function n(t,e){this.api=t,this.limit=50,e?(this.continueParams={continue:"gwrcontinue||",gwrcontinue:"0|"+e.replace(/ /g,"_")},this.shouldSkipFirstTitle=!0):(this.continueParams={continue:""},this.shouldSkipFirstTitle=!1),this.canContinue=!0}n.prototype={loadWatchlist:function(){var t=this,e=r("watchlist",{prop:["info","revisions"],rvprop:"timestamp|user",generator:"watchlistraw",gwrnamespace:"0",gwrlimit:this.limit},this.continueParams);return!1===this.canContinue?l.Deferred().resolve([]):this.api.get(e,{url:this.apiUrl}).then((function(e){return void 0!==e.continue?t.continueParams=e.continue:t.canContinue=!1,t.parseData(e)}))},parseData:function(t){var e;return t.query&&t.query.pages?((e=t.query.pages).sort((function(t,e){return t.title===e.title?0:t.title<e.title?-1:1})),this.shouldSkipFirstTitle&&(e=e.slice(1),this.shouldSkipFirstTitle=!1),e.map(i.parse)):[]}},t.exports=n},"./src/mobile.special.watchlist.scripts/mobile.special.watchlist.scripts.js":(t,e,s)=>{var i=s("./src/mobile.special.watchlist.scripts/WatchList.js"),l=s("./src/mobile.startup/eventBusSingleton.js"),r="mfWatchlistView",n=mw.user.options.get(),a="mfWatchlistFilter";$((function(){var t,e=new mw.Api,s=$(".mw-mf-watchlist-button-bar .is-on a").data("view"),o=$(".mw-mf-watchlist-selector .selected a").data("filter");t=$("ul.mw-mf-watchlist-page-list"),0===$(".mw-mf-watchlist-selector").length&&new i({api:new mw.Api,el:t,funnel:"watchlist",skipTemplateRender:!0,eventBus:l}),t.find(".mw-mf-watchlist-more").remove(),s!==n[r]&&e.saveOption(r,s),o&&o!==n[a]&&e.saveOption(a,o)}))},"./src/mobile.startup/ScrollEndEventEmitter.js":(t,e,s)=>{var i=s("./src/mobile.startup/util.js"),l=s("./src/mobile.startup/mfExtend.js");function r(t,e){this.threshold=e||100,this.eventBus=t,this.enable(),OO.EventEmitter.call(this)}OO.mixinClass(r,OO.EventEmitter),r.EVENT_SCROLL_END="ScrollEndEventEmitter-scrollEnd",l(r,{_bindScroll:function(){this._scrollHandler||(this._scrollHandler=this._onScroll.bind(this),this.eventBus.on("scroll:throttled",this._scrollHandler))},_unbindScroll:function(){this._scrollHandler&&(this.eventBus.off("scroll:throttled",this._scrollHandler),this._scrollHandler=null)},_onScroll:function(){this.$el&&this.enabled&&this.scrollNearEnd()&&(this.disable(),this.emit(r.EVENT_SCROLL_END))},scrollNearEnd:function(){var t=i.getWindow(),e=t.scrollTop()+t.height(),s=this.$el.offset().top+this.$el.outerHeight();return e+this.threshold>s},enable:function(){this.enabled=!0,this._bindScroll()},disable:function(){this.enabled=!1,this._unbindScroll()},setElement:function(t){this.$el=t}}),t.exports=r}},t=>{t.O(0,[569],(()=>t(t.s="./src/mobile.special.watchlist.scripts/mobile.special.watchlist.scripts.js")));var e=t.O();(this.mfModules=this.mfModules||{})["mobile.special.watchlist.scripts"]=e}]);
//# sourceMappingURL=mobile.special.watchlist.scripts.js.map.json