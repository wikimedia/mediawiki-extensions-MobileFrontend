this.mfModules=this.mfModules||{},this.mfModules["mobile.special.mobilediff.scripts"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{"./src/mobile.special.mobilediff.scripts.js":function(t,o,e){
/*!
* Animate patrol links to use asynchronous API requests to
* patrol pages, rather than navigating to a different URI.
*
* @author Florian Schmidt <florian.schmidt.welzow@t-online.de>
*/
var r=mw.user,s=e("./src/mobile.startup/Icon.js"),a=e("./src/mobile.startup/toast.js");r.tokens.exists("patrolToken")&&$(function(){var t,o,e=$(".patrollink a"),r=new s({name:"spinner",additionalClassNames:"savespinner loading"}).$el;e.on("click",function(s){$(s.target).hide().after(r),t=$(this).attr("href"),o=mw.util.getParamValue("rcid",t),(new mw.Api).postWithToken("patrol",{action:"patrol",rcid:o}).then(function(t){var o;e.closest(".patrollink").replaceWith($("<button>").addClass("mw-ui-button patrollink").prop("disabled",!0).text(e.closest(".patrollink").text())),r.remove(),void 0!==t.patrol?(o=new mw.Title(t.patrol.title),a.show(mw.msg("markedaspatrollednotify",o.toText()))):a.show(mw.msg("markedaspatrollederrornotify"),{type:"error"})},function(t){r.remove(),e.show(),"noautopatrol"===t?a.show(mw.msg("markedaspatrollederror-noautopatrol"),{type:"warn"}):a.show(mw.msg("markedaspatrollederrornotify"),{type:"error"})}),s.preventDefault()})})}},[["./src/mobile.special.mobilediff.scripts.js",0,1]]]);
//# sourceMappingURL=mobile.special.mobilediff.scripts.js.map.json