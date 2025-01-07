(self.webpackChunkmfModules=self.webpackChunkmfModules||[]).push([[898],{"./node_modules/@wikimedia/mediawiki.skins.clientpreferences/clientPreferences.js":e=>{function t(e){return document.documentElement.classList.contains(e+"-clientpref--excluded")}function n(e,t,n,s){const i=n[e],c=i.callback||(()=>{});mw.user.isNamed()?(n[e].options.forEach((t=>{document.documentElement.classList.remove(`${e}-clientpref-${t}`)})),document.documentElement.classList.add(`${e}-clientpref-${t}`),mw.util.debounce((()=>{(s=s||new mw.Api).saveOptions({[i.preferenceKey]:t}).then((()=>{c()}))}),100)()):(mw.user.clientPrefs.set(e,t),c())}const s=(e,t)=>`skin-client-pref-${e}-value-${t}`;function i(e,t,n){const i=document.createElement("input"),c=`skin-client-pref-${t}-group`,o=s(t,n);return i.name=c,i.id=o,i.type=e,"checkbox"===e?i.checked="1"===n:i.value=n,i.setAttribute("data-event-name",o),i}function c(e,t){const n=document.createElement("label");return n.textContent=mw.msg(`${e}-${t}-label`),n.setAttribute("for",s(e,t)),n}const o=e=>mw.message(`${e}-name`);function a(e,s,a,l){const r=o(s);if(r.exists()||"qqx"===mw.config.get("wgUserLanguage")){const d=`skin-client-prefs-${s}`,m=mw.util.addPortlet(d,r.text());if(a[s].betaMessage){const e=function(){const e=document.createElement("span"),t=document.createElement("span");return t.textContent=mw.message("vector-night-mode-beta-tag").text(),e.appendChild(t),e}();m.querySelector(".vector-menu-heading span")||(m.querySelector(".vector-menu-heading").textContent+=" ",m.querySelector(".vector-menu-heading").appendChild(e))}const p=m.querySelector("label"),u=mw.message(`${s}-description`);if(u.exists()){const e=document.createElement("span");e.classList.add("skin-client-pref-description"),e.textContent=u.text(),p&&p.parentNode&&p.appendChild(e)}const f=mw.message(`${s}-exclusion-notice`);if(f.exists()){const e=m.querySelector(".vector-menu-content"),t=document.createElement("span");t.classList.add("skin-client-pref-exclusion-notice"),t.textContent=f.text(),e&&e.appendChild(t)}e.appendChild(m);const g=function(e,s,a){const l=s[e],r=t(e);if(!l)return null;const d=mw.user.clientPrefs.get(e);if("boolean"==typeof d&&!r)return null;const m=function(){const e=document.createElement("div");return e.setAttribute("class",""),e}(),p=document.createElement("form");switch(l.type||"radio"){case"radio":l.options.forEach((o=>{!function(e,s,o,a,l,r){const d=i("radio",s,o);d.classList.add("cdx-radio__input"),a===o&&(d.checked=!0),t(s)&&(d.disabled=!0);const m=document.createElement("span");m.classList.add("cdx-radio__icon");const p=c(s,o);p.classList.add("cdx-radio__label");const u=document.createElement("div");u.classList.add("cdx-radio"),u.appendChild(d),u.appendChild(m),u.appendChild(p),e.appendChild(u),d.addEventListener("change",(()=>{n(s,o,l,r)}))}(p,e,o,String(d),s,a)}));break;case"switch":{const t=document.createElement("label");t.textContent=o(e).text(),function(e,t,s,o,a,l){const r=i("checkbox",t,o);r.classList.add("cdx-toggle-switch__input");const d=document.createElement("span");d.classList.add("cdx-toggle-switch__switch");const m=document.createElement("span");m.classList.add("cdx-toggle-switch__switch__grip"),d.appendChild(m);const p=s||c(t,o);p.classList.add("cdx-toggle-switch__label");const u=document.createElement("span");u.classList.add("cdx-toggle-switch"),u.appendChild(r),u.appendChild(d),u.appendChild(p),r.addEventListener("change",(()=>{n(t,r.checked?"1":"0",a,l)})),e.appendChild(u)}(p,e,t,String(d),s,a);break}default:throw new Error("Unknown client preference! Only switch or radio are supported.")}if(m.appendChild(p),r){const t=function(e){const t=document.createElement("p"),n=mw.message(`${e}-exclusion-notice`);return t.classList.add("exclusion-notice",`${e}-exclusion-notice`),t.textContent=n.text(),t}(e);m.appendChild(t)}return m}(s,a,l);if(g){const e=mw.util.addPortletLink(d,"","");if(e){const t=e.querySelector("a");t&&t.replaceWith(g)}if(a[s].betaMessage&&!t(s)){const e=document.createElement("span");e.id=`${s}-beta-notice`;const t=`[https://${window.location.hostname+mw.util.getUrl(mw.config.get("wgPageName"))} ${mw.config.get("wgTitle")}]`,n=mw.message("vector-night-mode-issue-reporting-preload-title",t).text(),i=mw.msg("vector-night-mode-issue-reporting-notice-url",window.location.host,n),c=mw.message("vector-night-mode-issue-reporting-link-label").text(),o=document.createElement("a");mw.user.isAnon()||(o.setAttribute("href",i),o.setAttribute("target","_blank")),o.textContent=c;const a=function(){const e=document.createElement("span");e.classList.add("vector-icon","vector-icon--heart"),o.textContent=mw.msg("vector-night-mode-issue-reporting-link-notification"),o.classList.add("skin-theme-beta-notice-success"),o.prepend(e),o.removeEventListener("click",a)};o.addEventListener("click",a),e.appendChild(o),g.appendChild(e)}}}}function l(e,t,n){const s=document.querySelector(e);return s?new Promise((e=>{(function(e){const t=Array.from(document.documentElement.classList).filter((e=>e.match(/-clientpref-/))).map((e=>e.split("-clientpref-")[0]));return Object.keys(e).filter((e=>t.indexOf(e)>-1))})(t).forEach((e=>{n=n||new mw.Api,a(s,e,t,n)})),mw.requestIdleCallback((()=>{e(s)}))})):Promise.reject()}e.exports={bind:function(e,t,n,s){let i=!1;const c=document.querySelector(e);c&&(s||(s=new mw.Api),c.checked?(l(t,n,s),i=!0):c.addEventListener("input",(()=>{i||(l(t,n,s),i=!0)})))},toggleDocClassAndSave:n,render:l}},"./src/mobile.special.mobileoptions.scripts.js":(e,t,n)=>{const s=n("./node_modules/@wikimedia/mediawiki.skins.clientpreferences/clientPreferences.js"),i=n("./src/mobile.startup/showOnPageReload.js"),c=n("./src/mobile.startup/amcOutreach/amcOutreach.js"),o="mf-expand-sections",a=mw.msg,l="mf-font-size";function r(e){e?i.showOnPageReload(a("mobile-frontend-settings-save")):mw.notify(a("mobile-frontend-settings-save"))}let d;function m(e){return d=d||new mw.Api,d.saveOptions(e,{global:"update"})}function p(e,t){const n=document.createElement("div"),i="mf-client-preferences";return n.id=i,e.prepend(n),s.render(`#${i}`,t,{saveOptions:m})}window.QUnit||mw.loader.using("oojs-ui-widgets").then((function(){const e=$("#mobile-options"),t=$("#enable-beta-toggle"),n=$("#enable-amc-toggle"),s=[];t.length&&s.push({$el:t,onToggle:()=>{}}),n.length&&s.push({$el:n,onToggle:e=>{!e&&c.loadCampaign().isCampaignActive()&&c.loadCampaign().makeAllActionsIneligible()}}),function(e,t){e.forEach((e=>{const n=e.$el,s=OO.ui.infuse(n),i=s.$element,c=new OO.ui.ToggleSwitchWidget({value:s.isSelected()});c.$element.insertAfter(i),i.hide(),i.on("change",(()=>{i.attr("disabled",!0),c.setValue(s.isSelected())})),c.on("change",(n=>{e.onToggle(n),c.setValue=function(){},i.find("input").prop("checked",n),r(!0),setTimeout((()=>{t.trigger("submit")}),250)}))}))}(s,e);const i={};mw.config.get("wgMFEnableFontChanger")&&(i[l]={options:["small","regular","large"],preferenceKey:l,callback:r});const a=mw.config.get("skin");function d(e){e.find(".skin-client-pref-description").appendTo(e.find(".cdx-toggle-switch__label")),e.find("> label").remove()}i["skin-theme"]={options:["day","night","os"],preferenceKey:`${a}-theme`},i[o]={options:["0","1"],type:"switch",preferenceKey:o,callback:r},mw.user.isAnon()||(i["mw-mf-amc"]={options:["0","1"],type:"switch",preferenceKey:"mf_amc_optin",callback:()=>location.reload()}),p(e,i).then((()=>{$("#amc-field .option-links").appendTo("#skin-client-prefs-mw-mf-amc"),d($("#skin-client-prefs-mf-expand-sections")),d($("#skin-client-prefs-mw-mf-amc")),$("#amc-field").remove()}))})),e.exports={test:{addClientPreferencesToForm:p}}}},e=>{e.O(0,[569],(()=>e(e.s="./src/mobile.special.mobileoptions.scripts.js")));var t=e.O();(this.mfModules=this.mfModules||{})["mobile.special.mobileoptions.scripts"]=t}]);
//# sourceMappingURL=mobile.special.mobileoptions.scripts.js.map.json