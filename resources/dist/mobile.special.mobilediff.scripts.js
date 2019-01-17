this.mfModules=this.mfModules||{},this.mfModules["mobile.special.mobilediff.scripts"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{"./src/mobile.special.mobilediff.scripts.js":function(o,t,e){
/*!
* Animate patrol links to use asynchronous API requests to
* patrol pages, rather than navigating to a different URI.
*
* @author Florian Schmidt <florian.schmidt.welzow@t-online.de>
*/
var r=mw.user,s=e("./src/mobile.startup/Icon.js"),a=e("./src/mobile.startup/toast.js");r.tokens.exists("patrolToken")&&$(function(){var o,t,e=$(".patrollink a"),r=new s({name:"spinner",additionalClassNames:"savespinner loading"}).$el;e.on("click",function(s){$(s.target).hide().after(r),o=$(this).attr("href"),t=mw.util.getParamValue("rcid",o),(new mw.Api).postWithToken("patrol",{action:"patrol",rcid:t}).then(function(o){var t;e.closest(".patrollink").replaceWith($("<button>").addClass("mw-ui-button patrollink").prop("disabled",!0).text(e.closest(".patrollink").text())),r.remove(),void 0!==o.patrol?(t=new mw.Title(o.patrol.title),a.show(mw.msg("markedaspatrollednotify",t.toText()))):a.show(mw.msg("markedaspatrollederrornotify"),"error")},function(o){r.remove(),e.show(),"noautopatrol"===o?a.show(mw.msg("markedaspatrollederror-noautopatrol"),"warn"):a.show(mw.msg("markedaspatrollederrornotify"),"error")}),s.preventDefault()})})}},[["./src/mobile.special.mobilediff.scripts.js",0,1]]]);
//# sourceMappingURL=mobile.special.mobilediff.scripts.js.map.json