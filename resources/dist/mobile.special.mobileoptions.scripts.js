(self.webpackChunkmfModules=self.webpackChunkmfModules||[]).push([[898],{"./node_modules/@wikimedia/mediawiki.skins.clientpreferences/clientPreferences.js":e=>{let t;function n(e,n,c){const i=c[e],s=i.callback||(()=>{});mw.user.isNamed()?(c[e].options.forEach((t=>{document.documentElement.classList.remove(`${e}-clientpref-${t}`)})),document.documentElement.classList.add(`${e}-clientpref-${n}`),mw.util.debounce((function(){t=t||new mw.Api,t.saveOption(i.preferenceKey,n).then((()=>{s()}))}),100)()):(mw.user.clientPrefs.set(e,n),s())}const c=(e,t)=>`skin-client-pref-${e}-value-${t}`;function i(e,t,n){const i=document.createElement("input"),s=`skin-client-pref-${t}-group`,o=c(t,n);return i.name=s,i.id=o,i.type=e,"checkbox"===e?i.checked="1"===n:i.value=n,i.setAttribute("data-event-name",o),i}function s(e,t){const n=document.createElement("label");return n.textContent=mw.msg(`${e}-${t}-label`),n.setAttribute("for",c(e,t)),n}const o=e=>mw.message(`${e}-name`);function a(e,t){const c=document.querySelector(e);return c?new Promise((e=>{(function(e){const t=Array.from(document.documentElement.classList).filter((e=>e.match(/-clientpref-/))).map((e=>e.split("-clientpref-")[0]));return Object.keys(e).filter((e=>t.indexOf(e)>-1))})(t).forEach((e=>{!function(e,t,c){const a=o(t);if(a.exists()||"qqx"===mw.config.get("wgUserLanguage")){const l=`skin-client-prefs-${t}`,r=mw.util.addPortlet(l,a.text()),d=r.querySelector("label"),m=mw.message(`${t}-description`);if(m.exists()){const e=document.createElement("span");e.classList.add("skin-client-pref-description"),e.textContent=m.text(),d&&d.parentNode&&d.appendChild(e)}const p=function(e,t){const c=t[e];if(!c)return null;const a=mw.user.clientPrefs.get(e);if("boolean"==typeof a)return null;const l=function(e){const t=document.createElement("div");return t.setAttribute("class",""),t}(),r=document.createElement("form");switch(c.type||"radio"){case"radio":c.options.forEach((c=>{!function(e,t,c,o,a){const l=i("radio",t,c);l.classList.add("cdx-radio__input"),o===c&&(l.checked=!0);const r=document.createElement("span");r.classList.add("cdx-radio__icon");const d=s(t,c);d.classList.add("cdx-radio__label");const m=document.createElement("div");m.classList.add("cdx-radio"),m.appendChild(l),m.appendChild(r),m.appendChild(d),e.appendChild(m),l.addEventListener("change",(()=>{n(t,c,a)}))}(r,e,c,a,t)}));break;case"switch":{const c=document.createElement("label");c.textContent=o(e).text(),function(e,t,c,o,a){const l=i("checkbox",t,o);l.classList.add("cdx-toggle-switch__input");const r=document.createElement("span");r.classList.add("cdx-toggle-switch__switch");const d=document.createElement("span");d.classList.add("cdx-toggle-switch__switch__grip"),r.appendChild(d);const m=c||s(t,o);m.classList.add("cdx-toggle-switch__label");const p=document.createElement("span");p.classList.add("cdx-toggle-switch"),p.appendChild(l),p.appendChild(r),p.appendChild(m),l.addEventListener("change",(()=>{n(t,l.checked?"1":"0",a)})),e.appendChild(p)}(r,e,c,a,t);break}default:throw new Error("Unknown client preference! Only switch or radio are supported.")}return l.appendChild(r),l}(t,c);if(e.appendChild(r),p){const e=mw.util.addPortletLink(l,"","");if(e){const t=e.querySelector("a");t&&t.replaceWith(p)}}}}(c,e,t)})),mw.requestIdleCallback((()=>{e(c)}))})):Promise.reject()}e.exports={bind:function(e,t,n){let c=!1;const i=document.querySelector(e);i&&(i.checked?(a(t,n),c=!0):i.addEventListener("input",(()=>{c||(a(t,n),c=!0)})))},toggleDocClassAndSave:n,render:a}},"./src/mobile.special.mobileoptions.scripts.js":(e,t,n)=>{var c=n("./node_modules/@wikimedia/mediawiki.skins.clientpreferences/clientPreferences.js"),i=n("./src/mobile.startup/showOnPageReload.js"),s=n("./src/mobile.startup/amcOutreach/amcOutreach.js"),o="mf-expand-sections",a=mw.msg,l="mf-font-size";function r(e){e?i.showOnPageReload(a("mobile-frontend-settings-save")):mw.notify(a("mobile-frontend-settings-save"))}mw.loader.using("oojs-ui-widgets").then((function(){var e=$("#mobile-options"),t=$("#enable-beta-toggle"),n=$("#enable-amc-toggle"),i=[];t.length&&i.push({$el:t,onToggle:function(){}}),n.length&&i.push({$el:n,onToggle:function(e){!e&&s.loadCampaign().isCampaignActive()&&s.loadCampaign().makeAllActionsIneligible()}}),function(e,t){e.forEach((function(e){var n,c,i,s=e.$el;c=OO.ui.infuse(s),i=c.$element,(n=new OO.ui.ToggleSwitchWidget({value:c.isSelected()})).$element.insertAfter(i),i.hide(),i.on("change",(function(){i.attr("disabled",!0),n.setValue(c.isSelected())})),n.on("change",(function(c){e.onToggle(c),n.setValue=function(){},i.find("input").prop("checked",c),r(!0),setTimeout((function(){t.trigger("submit")}),250)}))}))}(i,e);var a={};mw.config.get("wgMFEnableFontChanger")&&(a[l]={options:["small","regular","large"],preferenceKey:l,callback:r});var d=mw.config.get("skin");function m(e){e.find(".skin-client-pref-description").appendTo(e.find(".cdx-toggle-switch__label")),e.find("> label").remove()}a["skin-theme"]={options:["day","night","os"],preferenceKey:"".concat(d,"-theme")},a[o]={options:["0","1"],type:"switch",preferenceKey:o,callback:r},mw.user.isAnon()||(a["mw-mf-amc"]={options:["0","1"],type:"switch",preferenceKey:"mf_amc_optin",callback:function(){return location.reload()}}),function(e,t){var n=document.createElement("div"),i="mf-client-preferences";return n.id=i,e.prepend(n),c.render("#".concat(i),t,!0)}(e,a).then((function(){$("#amc-field .option-links").appendTo("#skin-client-prefs-mw-mf-amc"),m($("#skin-client-prefs-mf-expand-sections")),m($("#skin-client-prefs-mw-mf-amc")),$("#amc-field").remove()}))}))}},e=>{e.O(0,[569],(()=>("./src/mobile.special.mobileoptions.scripts.js",e(e.s="./src/mobile.special.mobileoptions.scripts.js"))));var t=e.O();(this.mfModules=this.mfModules||{})["mobile.special.mobileoptions.scripts"]=t}]);
//# sourceMappingURL=mobile.special.mobileoptions.scripts.js.map.json