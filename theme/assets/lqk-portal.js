/* LQK Teacher Portal app */
(function(){
  var SELECTORS=[
    "sticky-header","header-group","site-header","header-wrapper",
    ".site-header","header[role='banner']",".announcement-bar",
    "#shopify-section-header",".header","site-footer",
    "footer[role='contentinfo']",".site-footer",".footer"
  ];
  function hide(el){
    if(el&&!el.closest(".wrap")&&!el.closest("#gate")){
      el.style.setProperty("display","none","important");
      el.style.setProperty("height","0","important");
      el.style.setProperty("overflow","hidden","important");
      el.style.setProperty("margin","0","important");
      el.style.setProperty("padding","0","important");
    }
  }
  function hideAll(){
    SELECTORS.forEach(function(s){
      try{document.querySelectorAll(s).forEach(hide);}catch(e){}
    });
    var main=document.querySelector("#MainContent,[role='main'],main");
    if(main){
      main.style.setProperty("padding-top","0","important");
      main.style.setProperty("margin-top","0","important");
    }
    document.documentElement.style.setProperty("scroll-padding-top","0","important");
    document.body.style.setProperty("padding-top","0","important");
  }
  hideAll();
  document.addEventListener("DOMContentLoaded",hideAll);
  // MutationObserver catches elements added after initial load (e.g. sticky headers)
  var obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes.forEach(function(n){
        if(n.nodeType===1){
          SELECTORS.forEach(function(s){
            try{
              if(n.matches&&n.matches(s))hide(n);
              n.querySelectorAll&&n.querySelectorAll(s).forEach(hide);
            }catch(e){}
          });
        }
      });
    });
  });
  obs.observe(document.documentElement,{childList:true,subtree:true});
  // Belt-and-braces: run again after short delays
  [100,300,600,1000].forEach(function(t){setTimeout(hideAll,t);});
})();

/* ═══════════ CONFIG ═══════════ */
var CONFIG={
  SCRIPT_URL:"https://script.google.com/macros/s/AKfycbxL2vyQWZbfEOrZWA-Z1vhhiDB0cCCmgaqUEIorDJ_lrbAZVTwRyyjJ1r5906r6rYMvwA/exec",
  TOKEN:"LQK-Teacher-App",
  PIN:"8888",
  ALLOW_PIN_FALLBACK:true,
  ADMIN_EMAILS:[],
  CLASSES:["WOODS SQUARE","PRIMZ BIZHUB","TAMPINES BLK 462","TAMPINES JUNCTION","MANAGEMENT TEAM"]
};
/* ════════════════════════════════ */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
var DEMO=!CONFIG.SCRIPT_URL;
var state={cls:CONFIG.CLASSES[0],students:[],mode:"pin",pending:0,draft:null,openId:null};

/* ── Quran data ── */
var SURAHS=("Al-Fatihah:7,Al-Baqarah:286,Ali 'Imran:200,An-Nisa:176,Al-Ma'idah:120,Al-An'am:165,Al-A'raf:206,Al-Anfal:75,At-Tawbah:129,Yunus:109,Hud:123,Yusuf:111,Ar-Ra'd:43,Ibrahim:52,Al-Hijr:99,An-Nahl:128,Al-Isra:111,Al-Kahf:110,Maryam:98,Ta-Ha:135,Al-Anbiya:112,Al-Hajj:78,Al-Mu'minun:118,An-Nur:64,Al-Furqan:77,Ash-Shu'ara:227,An-Naml:93,Al-Qasas:88,Al-'Ankabut:69,Ar-Rum:60,Luqman:34,As-Sajdah:30,Al-Ahzab:73,Saba:54,Fatir:45,Ya-Sin:83,As-Saffat:182,Sad:88,Az-Zumar:75,Ghafir:85,Fussilat:54,Ash-Shura:53,Az-Zukhruf:89,Ad-Dukhan:59,Al-Jathiyah:37,Al-Ahqaf:35,Muhammad:38,Al-Fath:29,Al-Hujurat:18,Qaf:45,Adh-Dhariyat:60,At-Tur:49,An-Najm:62,Al-Qamar:55,Ar-Rahman:78,Al-Waqi'ah:96,Al-Hadid:29,Al-Mujadilah:22,Al-Hashr:24,Al-Mumtahanah:13,As-Saff:14,Al-Jumu'ah:11,Al-Munafiqun:11,At-Taghabun:18,At-Talaq:12,At-Tahrim:12,Al-Mulk:30,Al-Qalam:52,Al-Haqqah:52,Al-Ma'arij:44,Nuh:28,Al-Jinn:28,Al-Muzzammil:20,Al-Muddaththir:56,Al-Qiyamah:40,Al-Insan:31,Al-Mursalat:50,An-Naba:40,An-Nazi'at:46,'Abasa:42,At-Takwir:29,Al-Infitar:19,Al-Mutaffifin:36,Al-Inshiqaq:25,Al-Buruj:22,At-Tariq:17,Al-A'la:19,Al-Ghashiyah:26,Al-Fajr:30,Al-Balad:20,Ash-Shams:15,Al-Layl:21,Ad-Duha:11,Ash-Sharh:8,At-Tin:8,Al-'Alaq:19,Al-Qadr:5,Al-Bayyinah:8,Az-Zalzalah:8,Al-'Adiyat:11,Al-Qari'ah:11,At-Takathur:8,Al-'Asr:3,Al-Humazah:9,Al-Fil:5,Quraysh:4,Al-Ma'un:7,Al-Kawthar:3,Al-Kafirun:6,An-Nasr:3,Al-Masad:5,Al-Ikhlas:4,Al-Falaq:5,An-Nas:6")
  .split(",").map(function(x){var i=x.lastIndexOf(":");return{n:x.slice(0,i),c:+x.slice(i+1)};});


/* ── helpers ── */
function sgDate(){
  var n=new Date(),sg=new Date(n.getTime()+(n.getTimezoneOffset()+480)*60000);
  var m=sg.getMonth()+1,d=sg.getDate();
  return sg.getFullYear()+"-"+(m<10?"0":"")+m+"-"+(d<10?"0":"")+d;
}
function fmtDate(d){
  var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var p=String(d).split("-");if(p.length<3)return d;
  return p[2]+" "+months[+p[1]-1]+" "+p[0];
}
var DAY_NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function todayLabel(){
  var n=new Date(),sg=new Date(n.getTime()+(n.getTimezoneOffset()+480)*60000);
  return DAY_NAMES[sg.getDay()]+", "+fmtDate(sgDate());
}
function initials(n){return n.split(" ").map(function(w){return w[0];}).join("").slice(0,2);}
function avatarHTML(student){
  if(student.photo){
    return '<img src="'+student.photo+'" alt="'+titleCase(student.name)+'" '+
           'onerror="this.style.display=\'none\';this.parentNode.textContent=\''+initials(student.name)+'\'">';
  }
  return initials(student.name);
}
function titleCase(name){
  if(!name)return name;
  if(name!==name.toUpperCase()||!/[A-Z]/.test(name))return name;
  var t=name.toLowerCase().replace(/(^|\s)([a-z])/g,function(_,sp,ch){return sp+ch.toUpperCase();});
  return t.replace(/\bD\/o\b/gi,"D/O").replace(/\bS\/o\b/gi,"S/O");
}
function gradeClass(g){if(!g)return "";g=g.toLowerCase();if(g==="excellent")return"exc";if(g==="repeat")return"rep";return"";}

function firstNameFrom(email){
  // prefer the actual Shopify first_name if available
  var T=typeof window!=='undefined'&&window.SHOPIFY_TEACHER;
  if(T&&T.firstName&&T.firstName.trim()){
    var n=T.firstName.trim();
    return n.charAt(0).toUpperCase()+n.slice(1);
  }
  // fallback: parse email local part
  var local=(email||'').split('@')[0].replace(/[.\-_]/g,' ').trim();
  var first=local.split(' ')[0]||'Teacher';
  return first.charAt(0).toUpperCase()+first.slice(1).toLowerCase();
}
function setWelcome(label){
  var el=document.getElementById('hdrWelcome');
  if(el)el.textContent=label?'Ahlan, '+label:'';
}
function loadTeacherPhoto(firstName){
  if(DEMO||!firstName)return;
  var u=CONFIG.SCRIPT_URL+"?token="+encodeURIComponent(CONFIG.TOKEN)+"&action=teacher&n="+encodeURIComponent(firstName);
  fetch(u).then(function(r){return r.json();}).then(function(j){
    if(j&&j.ok&&j.photo){
      var av=$("hdrAvatar");
      if(av){av.src=j.photo;av.style.display="block";
        av.onerror=function(){av.style.display="none";};}
    }
  }).catch(function(){});
}

/* ── access ── */
function resolveAccess(){
  var T=(typeof window!=="undefined"&&window.SHOPIFY_TEACHER)?window.SHOPIFY_TEACHER:null;
  if(T&&T.email){
    var tags=String(T.tags||"").toLowerCase().split(",").map(function(x){return x.trim();});
    if(tags.indexOf("admin")>-1||CONFIG.ADMIN_EMAILS.map(function(e){return e.toLowerCase();}).indexOf(T.email.toLowerCase())>-1)
      return{mode:"admin",email:T.email};
    for(var i=0;i<tags.length;i++){
      if(tags[i].indexOf("branch:")===0){
        var b=tags[i].slice(7).trim().toUpperCase();
        for(var j=0;j<CONFIG.CLASSES.length;j++)
          if(CONFIG.CLASSES[j].toUpperCase()===b)return{mode:"teacher",branch:CONFIG.CLASSES[j],email:T.email};
      }
    }
    return{mode:"denied",email:T.email};
  }
  return CONFIG.ALLOW_PIN_FALLBACK?{mode:"pin"}:{mode:"login"};
}

/* ── API ── */
function apiRoster(){
  if(DEMO)return Promise.resolve({classes:CONFIG.CLASSES,students:[
    {id:1,name:"AYAAN HUSSAIN",juz:12,pos:"Hifz · Juz 12",att:null,logged:false,lastRead:{s:11,f:10,t:12},photo:""},
    {id:2,name:"BILAL AHMED",juz:7,pos:"Nazirah · Juz 7",att:null,logged:true,lastRead:null,photo:""},
    {id:3,name:"HAMZA ALI",juz:3,pos:"Hifz · Juz 3",att:null,logged:false,lastRead:{s:2,f:255,t:257},photo:""}
  ]});
  var u=CONFIG.SCRIPT_URL+"?token="+encodeURIComponent(CONFIG.TOKEN)+"&action=roster&cls="+encodeURIComponent(state.cls)+"&date="+sgDate();
  return fetch(u).then(function(r){return r.json();}).then(function(j){if(!j.ok)throw new Error(j.error);return {students:j.students,classes:j.classes||[]};});
}
function apiHistory(sid){
  if(DEMO)return Promise.resolve([
    {date:sgDate(),sabaq:"Al-Baqarah 255–257",grade:"Excellent",slips:0,note:"",surah:2,from:255,to:257,savedAt:new Date().toISOString()},
    {date:"2026-06-28",sabaq:"Al-Baqarah 250–254",grade:"Pass",slips:2,note:"Focus on ayah 253",surah:2,from:250,to:254,savedAt:"2026-06-28T10:00:00Z"}
  ]);
  var u=CONFIG.SCRIPT_URL+"?token="+encodeURIComponent(CONFIG.TOKEN)+"&action=history&sid="+encodeURIComponent(sid);
  return fetch(u).then(function(r){return r.json();}).then(function(j){if(!j.ok)throw new Error(j.error);return j.lessons;});
}
function apiPost(body){
  if(DEMO)return Promise.resolve({ok:true});
  body.token=CONFIG.TOKEN;body.date=sgDate();body.cls=state.cls;
  return fetch(CONFIG.SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body)})
    .then(function(r){return r.json();}).then(function(j){if(!j.ok)throw new Error(j.error);return j;});
}
function trackSync(p,ok){
  state.pending++;setSync();
  return p.then(function(r){state.pending--;setSync();if(ok)toast(ok,false);return r;})
    .catch(function(e){state.pending--;setSync(true);toast("Couldn't save — check connection",true);throw e;});
}
function setSync(err){
  var s=$("sync");s.className="sync "+(err?"err":state.pending>0?"busy":"ok");
  $("syncTxt").textContent=DEMO?"Demo":err?"Retry":state.pending>0?"Saving…":"Saved ✓";
}

/* ── render roster ── */
function spineHTML(juz){var h="";for(var i=1;i<=30;i++)h+='<i class="'+(i<juz?"dn":i===juz?"nw":"")+'"></i>';return'<div class="spine">'+h+'</div>';}
function render(){
  var r=$("roster");r.innerHTML="";
  if(!state.students.length){var found=(state.sheetClasses&&state.sheetClasses.length)?'<br><br>Classes currently in your Sheet:<br><strong>'+state.sheetClasses.join(', ')+'</strong>':'';r.innerHTML='<div class="loading">No students in <strong>'+state.cls+'</strong> yet.'+found+'<br><br>The class column must match exactly:<br><code style="background:#F6E2CC;padding:2px 8px;border-radius:4px;font-size:12px;margin-top:6px;display:inline-block">'+state.cls+'</code></div>';renderSummary();return;}
  state.students.forEach(function(s){
    var c=document.createElement("div");c.className="card";c.setAttribute("data-sid",s.id);
    var lr=s.lastRead?SURAHS[s.lastRead.s-1].n+" "+s.lastRead.f+(s.lastRead.t>s.lastRead.f?"–"+s.lastRead.t:""):"Not yet logged";
    var grd=s.lastGrade||"";var grCl=gradeClass(grd);
    c.innerHTML=
      '<div class="ci"><div class="av">'+avatarHTML(s)+'</div>'+
      '<div style="min-width:0;flex:1"><div class="sn">'+titleCase(s.name)+'</div>'+
      '<div class="sp">'+(s.pos||"")+'</div></div>'+
      (grd?'<div class="cright"><span class="grade-pill '+grCl+'">'+grd+'</span>'+
        (s.lastDate?'<div class="cdate">'+fmtDate(s.lastDate)+'</div>':'')+'</div>':'')+
      '</div>'+
      spineHTML(s.juz)+
      '<div class="last-read"><span class="dott"></span>Last read: '+lr+'</div>'+
      '<div class="card-foot">'+
      (s.logged
        ? '<span class="logged-badge">✓ Logged today</span><button class="log-btn done" data-log="'+s.id+'">Edit log</button>'
        : '<button class="log-btn" data-log="'+s.id+'">Log today\'s lesson</button>'
      )+
      '</div>';
    r.appendChild(c);
  });
  renderSummary();renderPills();
}
function renderSummary(){
  var logged=state.students.filter(function(s){return s.logged;}).length;
  $("tLogged").textContent=logged+"/"+state.students.length;
  if(state.students.length){
    var avg=state.students.reduce(function(a,s){return a+Number(s.juz||1);},0)/state.students.length;
    $("tJuz").textContent=avg.toFixed(1);
  }else{$("tJuz").textContent="—";}
  $("clsName").textContent=state.cls;
  $("hdrDate").textContent=todayLabel();
}
function renderPills(){
  var p=$("pills");
  if(state.mode==="teacher"){p.className="pills";p.innerHTML="";return;}
  p.className="pills show";
  p.innerHTML=CONFIG.CLASSES.map(function(c){return'<button data-cls="'+c+'" class="'+(c===state.cls?"on":"")+'">'+c+'</button>';}).join("");
}

/* ── actions ── */
function saveLesson(sid,log){
  var s=state.students.filter(function(x){return x.id==sid;})[0];if(!s)return;
  s.logged=true;s.lastGrade=log.grade;s.lastDate=sgDate();
  if(log.surah){s.lastRead={s:log.surah,f:log.from,t:log.to};}
  render();
  return trackSync(apiPost({action:"lesson",sid:s.id,att:"p",log:{
    sabaq:log.sabaq,gSabaq:log.grade,gSabqi:"",gManzil:"",slips:log.slips,
    note:log.note,surah:log.surah,from:log.from,to:log.to
  }}),titleCase(s.name).split(" ")[0]+"'s lesson saved");
}
function reload(){
  $("roster").innerHTML='<div class="loading">Loading…</div>';
  return apiRoster().then(function(st){state.students=st.students||st;state.sheetClasses=st.classes||[];render();setSync();})
    .catch(function(){$("roster").innerHTML='<div class="loading">Couldn\'t reach the register.<br>Check your connection.</div>';setSync(true);});
}
function switchCls(c){
  if(CONFIG.CLASSES.indexOf(c)===-1||state.mode==="teacher")return;
  state.cls=c;renderPills();reload();
}

/* ── student detail panel ── */
function openPanel(sid){
  var s=state.students.filter(function(x){return x.id==sid;})[0];if(!s)return;
  $("ptName").textContent=titleCase(s.name);
  $("ptSub").textContent=(s.pos||"")+" · "+state.cls;
  var body=$("panelBody");body.innerHTML='<div class="loading" style="padding:30px 0">Loading history…</div>';
  $("panelWrap").classList.add("open");
  apiHistory(sid).then(function(lessons){
    var surahsSeen={};
    lessons.forEach(function(l){if(l.surah>0)surahsSeen[l.surah]=SURAHS[l.surah-1].n;});
    var surahList=Object.keys(surahsSeen);
    var h='';
    h+='<div class="sec-head">Surahs covered</div>';
    if(surahList.length){
      h+='<div class="surahs-done">'+surahList.map(function(k){return'<span class="stag">'+surahsSeen[k]+'</span>';}).join("")+'</div>';
    }else{h+='<div class="sp">None logged yet</div>';}
    h+='<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">Lesson history <button class="chip" style="font-size:11.5px" data-log-sid="'+sid+'">+ Log today</button></div>';
    if(lessons.length){
      lessons.forEach(function(l){
        var gc=gradeClass(l.grade);
        h+='<div class="hist-item" data-edit-sid="'+sid+'" data-edit-date="'+l.date+'">'+
          '<div class="hi-top"><span class="hi-date">'+fmtDate(l.date)+'</span>'+
          (l.grade?'<span class="hi-grade '+gc+'">'+l.grade+'</span>':'')+
          '</div>'+
          '<div class="hi-sabaq">'+(l.sabaq||"—")+'</div>'+
          
          (l.note?'<div class="hi-note">'+l.note+'</div>':'')+
          '</div>';
      });
    }else{h+='<div class="sp" style="padding:8px 0">No lessons logged yet — tap above to start.</div>';}
    body.innerHTML=h;
  }).catch(function(){body.innerHTML='<div class="loading">Couldn\'t load history.</div>';});
}
$("panelWrap").onclick=function(e){
  if(e.target===$("panelWrap"))$("panelWrap").classList.remove("open");
  var ls=e.target.closest("[data-log-sid]");
  if(ls){$("panelWrap").classList.remove("open");openSheet(+ls.getAttribute("data-log-sid"));}
  var ed=e.target.closest("[data-edit-sid]");
  if(ed){$("panelWrap").classList.remove("open");openSheet(+ed.getAttribute("data-edit-sid"),ed.getAttribute("data-edit-date"));}
};
$("panelClose").onclick=function(){$("panelWrap").classList.remove("open");};

/* ── Quran picker ── */
var qp={s:1,f:1,t:1};
function surahOpts(sel){return SURAHS.map(function(s,i){return'<option value="'+(i+1)+'"'+((i+1)===sel?" selected":"")+'>'+(i+1)+". "+s.n+'</option>';}).join("");}
function rangeOpts(n,sel){var h="";for(var i=1;i<=n;i++)h+='<option value="'+i+'"'+(i===sel?" selected":"")+'>'+i+'</option>';return h;}
function juzOpts(){var h='<option value="">Jump to Juz…</option>';for(var i=1;i<=30;i++)h+='<option value="'+i+'">Juz '+i+'</option>';return h;}
function refLabel(){return SURAHS[qp.s-1].n+" · "+qp.f+(qp.t>qp.f?"–"+qp.t:"");}
function sabaqLabel(){return SURAHS[qp.s-1].n+" "+qp.f+(qp.t>qp.f?"–"+qp.t:"");}
var prevTmr;
function setPicker(s,f,t){
  var c=SURAHS[s-1].c;f=Math.min(Math.max(1,f),c);t=Math.min(Math.max(f,t),c);
  qp.s=s;qp.f=f;qp.t=t;
  $("selJuz").innerHTML=juzOpts();
  $("selSurah").innerHTML=surahOpts(s);
  $("selFrom").innerHTML=rangeOpts(c,f);
  $("selTo").innerHTML=rangeOpts(c,t);
  updatePrev();
}
function updatePrev(){
  var el=$("qPrev");el.innerHTML='<div class="ref">'+refLabel()+'</div>';
  clearTimeout(prevTmr);
  prevTmr=setTimeout(function(){
    var key=qp.s+":"+qp.f;
    fetch("https://api.alquran.cloud/v1/ayah/"+key+"/quran-uthmani")
      .then(function(r){return r.json();})
      .then(function(j){
        if(qp.s+":"+qp.f!==key)return;
        if(j&&j.data&&j.data.text)el.innerHTML='<div class="ref">'+refLabel()+'</div><div class="ar">'+j.data.text+'</div>';
      }).catch(function(){});
  },300);
}
function nextFromLast(lr){
  var c=SURAHS[lr.s-1].c;
  if(lr.t>=c){if(lr.s<114){var s2=lr.s+1;return{s:s2,f:1,t:Math.min(3,SURAHS[s2-1].c)};}return{s:114,f:c,t:c};}
  var f=lr.t+1;return{s:lr.s,f:f,t:Math.min(f+2,c)};
}
$("selSurah").onchange=function(){var s=+this.value;setPicker(s,1,Math.min(3,SURAHS[s-1].c));};
$("selFrom").onchange=function(){setPicker(qp.s,+this.value,Math.max(qp.t,+this.value));};
$("selTo").onchange=function(){setPicker(qp.s,qp.f,+this.value);};
$("selJuz").onchange=function(){
  var v=+this.value,sel=this;if(!v)return;
  fetch("https://api.alquran.cloud/v1/juz/"+v+"/quran-uthmani?offset=0&limit=1")
    .then(function(r){return r.json();})
    .then(function(j){var a=j&&j.data&&j.data.ayahs&&j.data.ayahs[0];if(!a)throw 0;
      var sn=a.surah.number,ay=a.numberInSurah;setPicker(sn,ay,Math.min(ay+2,SURAHS[sn-1].c));})
    .catch(function(){toast("Quran service offline — use surah picker",true);sel.value="";});
};

/* ── lesson sheet ── */
function openSheet(id,editDate){
  state.openId=id;state.draft={gSabaq:null,slips:0};
  var s=state.students.filter(function(x){return x.id==id;})[0];
  $("shName").textContent=titleCase(s.name);
  $("shSub").textContent=(editDate?"Editing: "+fmtDate(editDate):(s.pos||""))+" · "+state.cls;
  $("noteField").value="";
    document.querySelectorAll(".grades button").forEach(function(b){b.classList.remove("sel");});
  if(s.lastRead){
    $("lastBar").style.display="flex";
    $("lastChip").textContent="Last: "+SURAHS[s.lastRead.s-1].n+" "+s.lastRead.f+(s.lastRead.t>s.lastRead.f?"–"+s.lastRead.t:"");
    var nxt=nextFromLast(s.lastRead);
    setPicker(nxt.s,nxt.f,nxt.t);
    $("contBtn").onclick=function(){var n=nextFromLast(s.lastRead);setPicker(n.s,n.f,n.t);};
  }else{$("lastBar").style.display="none";setPicker(1,1,3);}
  $("sheetWrap").classList.add("open");
}

document.addEventListener("click",function(e){
  var t=e.target;
  var logBtn=t.closest?t.closest("[data-log]"):null;
  if(logBtn){openSheet(+logBtn.getAttribute("data-log"));return;}
  var card=t.closest?t.closest(".card"):null;
  if(card){openPanel(+card.getAttribute("data-sid"));return;}
  var pc=t.closest?t.closest("[data-cls]"):null;
  if(pc){switchCls(pc.getAttribute("data-cls"));return;}
  var gb=t.closest?t.closest(".grades button"):null;
  if(gb&&state.draft){
    var grp=gb.parentElement;
    state.draft.gSabaq=state.draft.gSabaq===gb.textContent?null:gb.textContent;
    Array.from(grp.children).forEach(function(b){b.classList.toggle("sel",state.draft.gSabaq===b.textContent);});
  }
});
$("shClose").onclick=function(){$("sheetWrap").classList.remove("open");};
$("sheetWrap").onclick=function(e){if(e.target===$("sheetWrap"))$("sheetWrap").classList.remove("open");};

/* ── save + share ── */
$("shSave").onclick=function(){
  var s=state.students.filter(function(x){return x.id==state.openId;})[0];if(!s)return;
  var log={sabaq:sabaqLabel(),grade:state.draft.gSabaq||"",slips:0,
    note:$("noteField").value.trim()||"",surah:qp.s,from:qp.f,to:qp.t};
  $("sheetWrap").classList.remove("open");
  saveLesson(state.openId,log);
  buildShareCard(s,log);
  setTimeout(function(){doShare(s,log);},400);
};
function buildShareCard(s,log){
  $("scName").textContent=titleCase(s.name);
  $("scDate").textContent=todayLabel();
  $("scSurah").textContent=log.sabaq;
  $("scGrade").textContent=log.grade||"—";
  $("scNote").textContent=log.note||"";
  $("scNote").style.display=log.note?"":"none";
}
function doShare(s,log){
  var el=$("shareCard");
  if(typeof html2canvas==="undefined"){toast("Sharing unavailable — html2canvas not loaded",true);return;}
  html2canvas(el,{scale:2,backgroundColor:null,logging:false,useCORS:true}).then(function(canvas){
    canvas.toBlob(function(blob){
      if(!blob){toast("Couldn't create image",true);return;}
      var fname=titleCase(s.name).replace(/ /g,"_")+"_"+sgDate()+".png";
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],fname,{type:"image/png"})]})){
        navigator.share({title:"Lesson — "+titleCase(s.name),files:[new File([blob],fname,{type:"image/png"})]})
          .catch(function(e){if(e.name!=="AbortError")toast("Sharing failed",true);});
      }else{
        var url=URL.createObjectURL(blob);
        var a=document.createElement("a");a.href=url;a.download=fname;a.click();
        setTimeout(function(){URL.revokeObjectURL(url);},3000);
        toast("Image saved — share from your downloads",false);
      }
    },"image/png");
  }).catch(function(){toast("Screenshot failed — lesson was still saved",true);});
}

/* ── toast ── */
var tTmr;
function toast(msg,bad){
  $("toastTxt").textContent=msg;$("toast").className="toast show"+(bad?" bad":"");
  clearTimeout(tTmr);tTmr=setTimeout(function(){$("toast").className="toast"+(bad?" bad":"");},2800);
}

/* ── gate ── */
function unlock(pin){
  if(String(pin)===String(CONFIG.PIN)){$("gate").classList.add("off");setWelcome("Teacher");$("hdrLinks").style.display="flex";renderPills();reload();return true;}
  $("pinErr").textContent="Wrong PIN — try again";return false;
}
$("pinGo").onclick=function(){unlock($("pinIn").value);};
$("pinIn").addEventListener("keydown",function(e){if(e.key==="Enter")unlock($("pinIn").value);});
function gateMsg(html){
  $("gate").innerHTML='<div class="bism">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div><h1>Teacher Portal</h1>'+html;
}

/* ── prayer times (Aladhan API, MUIS method for Singapore) ── */
var _prayerTimings=null;
var _cdInterval=null;
function toMin(s){var p=String(s).split(":");return +p[0]*60+ +p[1];}
function loadPrayerTimes(){
  var sg=new Date(new Date().getTime()+(new Date().getTimezoneOffset()+480)*60000);
  var y=sg.getFullYear(),mo=sg.getMonth()+1,d=sg.getDate();
  fetch("https://api.aladhan.com/v1/timingsByCity/"+d+"-"+mo+"-"+y+"?city=Singapore&country=Singapore&method=11")
    .then(function(r){return r.json();})
    .then(function(j){
      var t=j&&j.data&&j.data.timings;if(!t)throw 0;
      _prayerTimings=t;
      renderPrayerGrid(t);
      startCountdown(t);
    }).catch(function(){
      var row=$("prTimings");
      if(row)row.innerHTML='<span style="font-size:11px;color:var(--bs);opacity:.7">Prayer times unavailable</span>';
    });
}
function renderPrayerGrid(t){
  var ORDER=["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"];
  var sg=new Date(new Date().getTime()+(new Date().getTimezoneOffset()+480)*60000);
  var now=sg.getHours()*60+sg.getMinutes();
  var nextKey=findNextPrayer(t,now);
  var row=$("prTimings");if(!row)return;
  row.innerHTML=ORDER.map(function(k){
    var isNext=(k===nextKey);
    return '<div class="pr-slot'+(isNext?' next-up':'')+'">'+
      '<span class="pr-sname">'+k+'</span>'+
      '<span class="pr-stime">'+t[k]+'</span>'+
      '</div>';
  }).join("");
}
function findNextPrayer(t,nowMin){
  var ORDER=["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"];
  var next=null,nextMin=Infinity;
  ORDER.forEach(function(k){
    var m=toMin(t[k]);
    if(m>nowMin&&m<nextMin){nextMin=m;next=k;}
  });
  return next||"Fajr";
}
function startCountdown(t){
  if(_cdInterval)clearInterval(_cdInterval);
  function tick(){
    var sg=new Date(new Date().getTime()+(new Date().getTimezoneOffset()+480)*60000);
    var now=sg.getHours()*60+sg.getMinutes();
    var nextKey=findNextPrayer(t,now);
    var nextMin=toMin(t[nextKey]);
    var diff=nextMin-now;
    if(diff<0)diff+=24*60;
    var h=Math.floor(diff/60),m=diff%60;
    var label=$("prNextName"),cd=$("prCountdown"),hint=$("prNextHint");
    if(label)label.textContent=nextKey+" in";
    if(cd)cd.textContent=(h>0?h+"h ":"")+m+"m";
    if(hint)hint.textContent="("+t[nextKey]+")";
    // refresh the highlighted slot each minute
    if(t)renderPrayerGrid(t);
  }
  tick();
  _cdInterval=setInterval(tick,60000);
}

/* ── ayah of the day (deterministic by day-of-year, alquran.cloud) ── */
function loadAyahOfDay(){
  var ar=$("ayahAr"),ref=$("ayahRef");
  if(!ar)return;
  var sg=new Date(new Date().getTime()+(new Date().getTimezoneOffset()+480)*60000);
  var doy=Math.floor((sg-new Date(sg.getFullYear(),0,0))/(1000*60*60*24));
  var ayahNum=(doy%6236)||1; // cycle through all 6236 ayahs
  fetch("https://api.alquran.cloud/v1/ayah/"+ayahNum+"/editions/quran-uthmani,en.sahih")
    .then(function(r){return r.json();})
    .then(function(j){
      var eds=j&&j.data;if(!eds||!eds[0])throw 0;
      var arabic=eds[0];
      var english=eds[1];
      ar.textContent=arabic.text;
      if(ref){
        var sn=arabic.surah.englishName;
        var an=arabic.numberInSurah;
        ref.textContent=sn+" : "+an+(english?" — "+english.text.slice(0,90)+(english.text.length>90?"…":""):"");
      }
    }).catch(function(){if(ar)ar.textContent="";});
}

/* ── boot ── */
var access=resolveAccess();state.mode=access.mode;
if(access.mode==="teacher"){state.cls=access.branch;setWelcome(firstNameFrom(access.email));loadTeacherPhoto(firstNameFrom(access.email));$("hdrLinks").style.display="flex";$("gate").classList.add("off");renderPills();reload();}
else if(access.mode==="admin"){setWelcome(firstNameFrom(access.email)+" (admin)");loadTeacherPhoto(firstNameFrom(access.email));$("hdrLinks").style.display="flex";$("gate").classList.add("off");renderPills();reload();}
else if(access.mode==="login"){
  // Gate HTML already shows login button prominently
  if(!CONFIG.ALLOW_PIN_FALLBACK){
    var gd=$('gateDivider'),gpi=$('pinIn'),gpb=$('pinGo');
    if(gd)gd.style.display='none';
    if(gpi)gpi.style.display='none';
    if(gpb)gpb.style.display='none';
  }
}
else if(access.mode==="denied"){gateMsg('<p>Your account ('+access.email+') isn\'t set up yet.<br>Ask admin to assign you to a branch.</p>');}
if(DEMO)$("demoBar").style.display="block";
loadPrayerTimes();
loadAyahOfDay();
setSync();
window.LQK={state:state,SURAHS:SURAHS,qp:qp,setPicker:setPicker,nextFromLast:nextFromLast,sabaqLabel:sabaqLabel,titleCase:titleCase,unlock:unlock,reload:reload,openSheet:openSheet,switchCls:switchCls,saveLesson:saveLesson};
})();