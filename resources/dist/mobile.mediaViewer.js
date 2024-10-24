(self.webpackChunkmfModules=self.webpackChunkmfModules||[]).push([[548],{"./src/mobile.mediaViewer/ImageCarousel.js":(e,t,i)=>{var s=i("./src/mobile.startup/View.js"),a=i("./src/mobile.startup/util.js"),n=i("./src/mobile.startup/mfExtend.js"),r=i("./src/mobile.startup/IconButton.js"),o=i("./src/mobile.startup/icons.js"),l=i("./src/mobile.startup/eventBusSingleton.js"),d=new(i("./src/mobile.startup/Button.js"))({label:mw.msg("mobile-frontend-media-details"),additionalClassNames:"button",progressive:!0}),m=new r({rotation:90,icon:"expand-invert",label:mw.msg("mobile-frontend-media-prev")}),h=new r({rotation:-90,icon:"expand-invert",label:mw.msg("mobile-frontend-media-next")}),u=i("./src/mobile.mediaViewer/LoadErrorMessage.js"),c=i("./src/mobile.mediaViewer/ImageGateway.js"),g=require("mediawiki.router");function p(e){this.gateway=e.gateway||new c({api:e.api}),this.router=e.router||g,this.eventBus=e.eventBus,this.hasLoadError=!1,s.call(this,a.extend({className:"image-carousel",events:{"click .image-wrapper":"onToggleDetails","click .slider-button":"onSlide"}},e))}n(p,s,{template:a.template('\n<button title="{{prevMsg}}" class="prev slider-button"></button>\n<div class="main">\n\t<div class="image-wrapper">\n\t\t<div class="image"></div>\n\t</div>\n\t\x3c!-- cancel button will go here --\x3e\n\t<div class="image-details">\n\t\t\x3c!-- details button will go here --\x3e\n\t\t<p class="truncated-text">{{caption}}</p>\n\t\t<p class="license"><a href="#">{{licenseLinkMsg}}</a></p>\n\t</div>\n</div>\n<button title="{{nextMsg}}" class="next slider-button"></button>\n\t'),defaults:a.extend({},s.prototype.defaults,{licenseLinkMsg:mw.msg("mobile-frontend-media-license-link"),prevMsg:mw.msg("mobile-frontend-media-prev"),nextMsg:mw.msg("mobile-frontend-media-next"),thumbnails:[]}),onSlide:function(e){var t=this.$el.find(e.target).closest(".slider-button").data("thumbnail"),i=t.options.filename;this.router.navigateTo(null,{path:"#/media/"+i,useReplaceState:!0}),this.options.title=t.options.filename;var s=new p(this.options);this.$el.replaceWith(s.$el),this.$el=s.$el},preRender:function(){var e=this;this.options.thumbnails.forEach((function(t,i){t.getFileName()===e.options.title&&(e.options.caption=t.getDescription(),e.galleryOffset=i)}))},_enableArrowImages:function(e){var t,i,s=this.galleryOffset;void 0===this.galleryOffset?(t=e[e.length-1],i=e[0]):(t=e[0===s?e.length-1:s-1],i=e[s===e.length-1?0:s+1]),this.$el.find(".prev").data("thumbnail",t),this.$el.find(".next").data("thumbnail",i)},_disableArrowImages:function(){this.$el.find(".prev, .next").remove()},_handleRetry:function(){this.router.emit("hashchange")},postRender:function(){var e,t=this.$el,i=o.spinner().$el,s=this.options.thumbnails||[],a=this,n=function(){a.hasLoadError=!0,i.hide(),t.find(".image img").hide(),0===t.find(".load-fail-msg").length&&new u({retryPath:a.router.getPath()}).on("retry",a._handleRetry.bind(a)).prependTo(t.find(".image"))},r=function(){e.addClass("image-loaded")};s.length<2?this._disableArrowImages():this._enableArrowImages(s),this.$details=t.find(".image-details"),t.find(".image").append(i),this.$details.prepend(d.$el),this.gateway.getThumb(a.options.title).then((function(s){var o,l=s.descriptionurl+"#mw-jump-to-license";i.hide(),a.thumbWidth=s.thumbwidth,a.thumbHeight=s.thumbheight,a.imgRatio=s.thumbwidth/s.thumbheight,(e=a.parseHTML("<img>",document)).on("load",r).on("error",n),e.attr("src",s.thumburl).attr("alt",a.options.caption),t.find(".image").append(e),a.$details.addClass("is-visible"),a._positionImage(),t.find(".image-details a").attr("href",l),s.extmetadata&&(s.extmetadata.LicenseShortName&&t.find(".license a").text(s.extmetadata.LicenseShortName.value).attr("href",l),s.extmetadata.Artist&&(o=s.extmetadata.Artist.value.replace(/<.*?>/g,""),t.find(".license").prepend(o+" &bull; "))),a.adjustDetails()}),(function(){n()})),l.on("resize:throttled",this._positionImage.bind(this)),this._positionImage()},onToggleDetails:function(){this.hasLoadError||(this.$el.find(".cancel, .slider-button").toggle(),this.$details.toggle(),this._positionImage())},_positionImage:function(){var e=a.getWindow();this.adjustDetails();var t=this.$details.is(":visible")?this.$details.outerHeight():0,i=e.width(),s=e.height()-t,n=i/s,r=this.$el.find("img");this.imgRatio>n?i<this.thumbWidth&&r.css({width:i,height:"auto"}):s<this.thumbHeight&&r.css({width:"auto",height:s}),this.$el.find(".image-wrapper").css("bottom",t),this.$el.find(".slider-button.prev").append(m.$el),this.$el.find(".slider-button.next").append(h.$el)},adjustDetails:function(){var e=a.getWindow().height();this.$el.find(".image-details").height()>.5*e&&this.$el.find(".image-details").css("max-height",.5*e)}}),e.exports=p},"./src/mobile.mediaViewer/ImageGateway.js":(e,t,i)=>{var s=[320,640,800,1024,1280,1920,2560,2880],a=i("./src/mobile.startup/actionParams.js"),n=i("./src/mobile.startup/util.js");function r(e){for(var t=0;e>s[t]&&t<s.length-1;)++t;return s[t]}function o(e){this._cache={},this.api=e.api}o.prototype.getThumb=function(e){var t=this._cache[e],i=n.getWindow(),s=window.devicePixelRatio&&window.devicePixelRatio>1?window.devicePixelRatio:1;return t||(this._cache[e]=this.api.get(a({prop:"imageinfo",titles:e,iiprop:["url","extmetadata"],iiurlwidth:r(i.width()*s),iiurlheight:r(i.height()*s)})).then((function(e){if(e.query&&e.query.pages&&e.query.pages[0]&&e.query.pages[0].imageinfo)return e.query.pages[0].imageinfo[0];throw new Error("The API failed to return any pages matching the titles.")}))),this._cache[e]},o._findSizeBucket=r,e.exports=o},"./src/mobile.mediaViewer/LoadErrorMessage.js":(e,t,i)=>{var s=i("./src/mobile.startup/util.js"),a=i("./src/mobile.startup/mfExtend.js"),n=i("./src/mobile.startup/icons.js"),r=i("./src/mobile.startup/View.js");function o(e){r.call(this,{events:{"click .load-fail-msg-link a":"onRetry"}},e)}a(o,r,{template:s.template('\n<div class="load-fail-msg">\n  <div class="load-fail-msg-text">{{msgToUser}}</div>\n  <div class="load-fail-msg-link">\n    <a href="#">{{retryTxt}}</a>\n  </div>\n</div>\n\t'),isTemplateMode:!0,defaults:s.extend({},o.prototype.defaults,{msgToUser:mw.msg("mobile-frontend-media-load-fail-message"),retryTxt:mw.msg("mobile-frontend-media-load-fail-retry")}),postRender:function(){this.$el.prepend(n.error().$el),this.$el.find(".load-fail-msg-link a").attr("href","#"+this.options.retryPath)},onRetry:function(){return this.emit("retry"),!1}}),e.exports=o},"./src/mobile.mediaViewer/mobile.mediaViewer.js":(e,t,i)=>{var s=i("./src/mobile.startup/moduleLoaderSingleton.js"),a=i("./src/mobile.mediaViewer/ImageCarousel.js");s.define("mobile.mediaViewer",{ImageCarousel:a})}},e=>{e.O(0,[569],(()=>e(e.s="./src/mobile.mediaViewer/mobile.mediaViewer.js")));var t=e.O();(this.mfModules=this.mfModules||{})["mobile.mediaViewer"]=t}]);
//# sourceMappingURL=mobile.mediaViewer.js.map.json