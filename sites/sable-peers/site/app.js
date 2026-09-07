/* block 1 */
/* button sounds: a short glass tick made by the browser itself, nothing loaded.
   Off switch in the header, remembered in localStorage. */
(function(){
  var KEY='sable-sound',on=true,ctx=null,played=0;
  var AC=window.AudioContext||window.webkitAudioContext;
  try{on=localStorage.getItem(KEY)!=='off';}catch(e){}
  var btn=document.getElementById('sound-btn');
  function paint(){if(!btn)return;btn.setAttribute('aria-pressed',String(on));btn.setAttribute('aria-label','Button sounds '+(on?'on':'off'));btn.title='Button sounds: '+(on?'on':'off');}
  function ac(){if(!AC)return null;if(!ctx){try{ctx=new AC();}catch(e){return null;}}if(ctx.state==='suspended'){try{ctx.resume();}catch(e){}}return ctx;}
  function partial(c,t,f0,f1,vol,dur){var o=c.createOscillator(),g=c.createGain();o.type='sine';
    o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+0.05);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.006);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+0.02);}
  function tick(kind){
    if(!on)return;var c=ac();if(!c)return;var t=c.currentTime;
    if(kind==='hit'){partial(c,t,180,120,0.12,0.22);partial(c,t,95,70,0.08,0.26);}
    else if(kind==='refuse'){var fr=1180*(1+(Math.random()-0.5)*0.05);partial(c,t,fr,fr*0.62,0.10,0.17);partial(c,t,fr*1.5,fr*0.93,0.04,0.12);partial(c,t+0.05,fr*2,fr*1.2,0.03,0.12);}
    else if(kind==='receipt'){partial(c,t,2200,1900,0.025,0.05);}
    else if(kind==='clean'){partial(c,t,880,880,0.06,0.18);partial(c,t+0.12,1320,1320,0.06,0.22);}
    else{var main=kind==='fill';var f0=(main?1180:1560)*(1+(Math.random()-0.5)*0.06);partial(c,t,f0,f0*0.62,main?0.09:0.07,main?0.16:0.11);if(main)partial(c,t,f0*1.5,f0*0.93,0.03,0.11);}
    played++;
  }
  document.addEventListener('click',function(e){
    var el=e.target&&e.target.closest?e.target.closest('button,a.pill,a.tile,#rail a,a.back'):null;
    if(!el||el.disabled)return;
    if(el===btn){on=!on;try{localStorage.setItem(KEY,on?'on':'off');}catch(e2){}paint();if(on)tick('fill');return;}
    tick(el.classList.contains('fill')?'fill':'tap');
  },true);
  paint();
  window.SABLE_SOUND={tick:function(k){tick(k||'tap')},supported:function(){return !!AC},enabled:function(){return on},set:function(v){on=!!v;try{localStorage.setItem(KEY,on?'on':'off');}catch(e){}paint();return on},played:function(){return played}};
})();

/* block 2 */
/* The guide. Speaks with the browser's own voice, captions every sentence,
   opens topics on request by tap or by voice. If an ElevenLabs agent id is
   set below, the panel hands over to Lisa, and the page gives her two tools:
   navigate(topic) and set_view(mode). */
window.SABLE_GUIDE={elevenlabsAgentId:'agent_6301m1xbpgm2eg8s3bjbc658p2ga',name:'Lisa'};   /* set the id and the name of your voice agent here */

/* block 3 */
/* The shell. One topic at a time in compact mode; the whole page in full mode.
   Hash-routed so every existing link (#door, #check, #updates) still lands. */
(function(){
  var body=document.body,content=document.getElementById('content'),back=document.getElementById('back');
  var TOPICS={home:['hero','home'],explained:['explained'],door:['door'],check:['check'],field:['field'],token:['token'],scenarios:['scenarios'],play:['play'],log:['updates','record'],community:['community']};
  var ALIAS={updates:'log',record:'log',hero:'home',join:'community',verify:'check',game:'play',gatekeeper:'play'};
  var sections=[].slice.call(content.querySelectorAll(':scope > section.band'));
  var links=[].slice.call(document.querySelectorAll('#rail a'));
  var mode='compact';
  try{var saved=localStorage.getItem('sable-view');if(saved==='full'||saved==='compact')mode=saved;}catch(e){}
  if(/[?&]view=full/.test(location.search))mode='full';
  function topicFromHash(){var h=(location.hash||'').replace('#','');if(!h)return 'home';if(TOPICS[h])return h;if(ALIAS[h])return ALIAS[h];var el=document.getElementById(h);if(el){var s=el.closest('section.band');if(s){for(var k in TOPICS){if(TOPICS[k].indexOf(s.id)>=0)return k;}}}return 'home';}
  var current='home';
  /* phone menu */
  var railnav=document.getElementById('railnav'),toggle=document.getElementById('rail-toggle');
  function closeMenu(){if(!railnav)return;railnav.classList.remove('open');if(toggle)toggle.setAttribute('aria-expanded','false');}
  function openMenu(){railnav.classList.add('open');toggle.setAttribute('aria-expanded','true');var first=railnav.querySelector('a[aria-current="page"]')||railnav.querySelector('a');if(first)first.focus();}
  if(toggle){toggle.addEventListener('click',function(){railnav.classList.contains('open')?closeMenu():openMenu();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&railnav.classList.contains('open')){closeMenu();toggle.focus();}});
    document.addEventListener('click',function(e){if(railnav.classList.contains('open')&&!railnav.contains(e.target))closeMenu();});}
  function setMode(m,fromUser){mode=m;body.classList.toggle('compact',m==='compact');body.classList.toggle('full',m==='full');
    document.getElementById('mode-compact').setAttribute('aria-pressed',String(m==='compact'));document.getElementById('mode-full').setAttribute('aria-pressed',String(m==='full'));
    try{localStorage.setItem('sable-view',m);}catch(e){}
    if(fromUser)show(current,true);}
  function show(topic,scroll){current=topic;var ids=TOPICS[topic]||TOPICS.home;
    sections.forEach(function(s){s.classList.toggle('on',ids.indexOf(s.id)>=0);});
    links.forEach(function(a){if(a.getAttribute('data-topic')===topic)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    var cur=document.getElementById('rail-cur');if(cur){var act=links.filter(function(a){return a.getAttribute('data-topic')===topic})[0];cur.textContent=act?act.lastElementChild.textContent:'Overview';}
    closeMenu();
    back.classList.toggle('on',topic!=='home');
    if(scroll){var target=mode==='full'?document.getElementById(ids[0]):content;var y=target.getBoundingClientRect().top+window.pageYOffset-(mode==='full'?8:0);window.scrollTo({top:Math.max(0,y),behavior:'instant'});}
    if(mode==='compact'&&topic!=='home'){var h=document.getElementById(ids[0]).querySelector('h2');if(h){h.setAttribute('tabindex','-1');try{h.focus({preventScroll:true});}catch(e){}}}}
  setMode(mode,false);
  show(topicFromHash(),!!location.hash);
  window.addEventListener('hashchange',function(){show(topicFromHash(),true);});
  document.getElementById('mode-compact').addEventListener('click',function(){setMode('compact',true);});
  document.getElementById('mode-full').addEventListener('click',function(){setMode('full',true);});
  /* tile and rail badges follow the live data already on the page */
  function txt(id){var e=document.getElementById(id);return e?e.textContent.trim():'';}
  /* Badges are written only when the text actually differs, and the observer
     watches the data sections, never the tiles, so a badge write can never
     retrigger itself. */
  function put(el,text,cls){if(!el)return;if(el.textContent!==text)el.textContent=text;if(cls!=null&&el.className!==cls)el.className=cls;}
  function stOk(){var st=document.getElementById('status');return !!(st&&st.classList.contains('good'));}
  function refresh(){
    var gw=txt('st-gw'),conf=txt('st-conf');
    if(gw&&gw!=='reading…'){var s='gateway '+gw+(conf&&conf!=='…'?' · '+conf.split('·')[0].trim():'');put(document.getElementById('t-verify'),s,'badge '+(stOk()?'ok':'warn'));put(document.getElementById('rail-gw'),s);}
    var pcs=[].slice.call(document.querySelectorAll('td.pc'));
    if(pcs.length){var changed=pcs.filter(function(td){return td.getAttribute('data-state')==='changed'}).length;var read=pcs.filter(function(td){return td.getAttribute('data-state')!=='reading'}).length;if(read)put(document.getElementById('t-field'),changed?changed+' of '+pcs.length+' project pages changed since watch began':'no project page changed since watch began','badge '+(changed?'warn':'ok'));}
    var sv=document.querySelector('.ladder .row.sable .val');if(sv){var v=sv.firstChild&&sv.firstChild.textContent.trim();if(v)put(document.getElementById('t-token'),'SABL '+v+' · '+(document.getElementById('mc-stamp').getAttribute('data-live')==='1'?'live':'as of 4 Sep 2026'));}
    var wl=txt('wp-last');if(wl&&wl!=='…')put(document.getElementById('t-log'),'whitepaper last changed '+wl.split('·')[0].trim());
  }
  var obs=new MutationObserver(function(){refresh();});
  ['check','field','token','updates'].forEach(function(id){var s=document.getElementById(id);if(s)obs.observe(s,{childList:true,subtree:true,characterData:true});});
  refresh();setTimeout(refresh,3000);setTimeout(refresh,8000);
  /* a small public surface for the guide and for Lisa's tools */
  window.SABLE_SHELL={open:function(topic){if(!TOPICS[topic])topic=ALIAS[topic]||'home';if(location.hash.replace('#','')===(topic==='home'?'home':TOPICS[topic][0])){show(topic,true);}else{location.hash=topic==='home'?'home':TOPICS[topic][0];}return topic;},setMode:function(m){if(m==='full'||m==='compact')setMode(m,true);return mode;},current:function(){return current;},mode:function(){return mode;},topics:Object.keys(TOPICS)};
})();

/* block 4 */
(function(){
  var $=function(id){return document.getElementById(id)};
  var btn=$('guide-btn'),panel=$('guide-panel'),cap=$('guide-cap'),start=$('guide-start'),stop=$('guide-stop'),mic=$('guide-mic'),close=$('guide-close'),topicsBox=$('guide-topics');
  if(!btn||!panel||!window.SABLE_SHELL)return;
  var S=window.SABLE_SHELL,synth=window.speechSynthesis,speaking=false,tourTimer=null,rec=null,listening=false;
  var lisaMode=!!((window.SABLE_GUIDE||{}).elevenlabsAgentId);
  var NAMES={home:'Overview',explained:'Explained',door:'Try it',check:'Verify',field:'The field',token:'Token',scenarios:'Scenarios',play:'Play',log:'Log',community:'Community'};
  var SAY={
    home:'This is the overview. The map is the whitepaper as a solar system: thirteen sections turn around one sentence, every dot is a sentence of the paper, orange where it changed. Tap a planet, or use the arrows under the map. The squares on the outer ring, and the row of buttons under the map, are the pages of this site: tap one to open it. You can also say: section five, today\'s sentence, or search receipt.',
    explained:'Sable, explained in plain words. Three promises: it forgets what you told it, it cannot overspend your budget, and it hands you a receipt you can check yourself. Then who it is for, what it costs, and what it is not yet.',
    door:'This is the door, a simulation that runs entirely in your browser. Type a prompt and press Send to watch it sealed, held against a five-cent budget, opened once, and receipted. Press Let it loop to watch a runaway agent get refused at the cap.',
    check:'Verify, do not trust. This reads Sable’s live status and published signer address, and lets you check a real receipt in your browser. No key? Load the test receipt and watch it pass, then change one character and watch it fail.',
    field:'The field. Eight projects on one checklist, read from their own documentation. The last column shows when each project’s public page last changed, checked daily. Scroll the table sideways on a phone.',
    token:'Where the token sits. A log-scale ladder of market caps, read live when the page opens. SABL’s only role is an optional pay-in that burns the token, and it is not live yet.',
    scenarios:'Scenarios, not predictions. Three bands for what the token could be worth, and what would have to be true first. No multiples, no targets.',
    play:'Gatekeeper, a game. You are Sable’s door: sealed requests pass and become receipts, broken seals and runaway loops must be refused before they reach the door. Only refusals build your streak. There is no clock: the shift lasts as long as your budget and every wave is harder than the last. The same arena for everyone today, and a leaderboard without accounts.',
    log:'The log. What changed on this page, the hourly reliability record from the watcher, how long Sable has been failing closed, the whitepaper watched hourly with every diff, and what this page got wrong, with dates.',
    community:'The community. Sable’s Telegram and X. Bring a question, not a price.'
  };
  var TOUR=[
    'Welcome to the Sable Observatory, an independent page that explains Sable Network and lets you check it yourself. It has two views: Compact opens one topic at a time, Full reads as one long page. The switch is at the top.',
    'There are eight topics: Explained, Try it, Verify, The field, Token, Scenarios, Log and Community. On a phone they are behind the Topics button; on a desktop they are in the rail on the left.',
    'If you have one minute, open Try it and press Send. If you have five, open Verify and load the test receipt. Say a topic, or tap one below, and I will open it and tell you what you are looking at.'
  ];
  function caption(t,dim){cap.textContent=t;cap.classList.toggle('dim',!!dim);}
  function stopSpeech(){if(synth){try{synth.cancel();}catch(e){}}speaking=false;btn.classList.remove('talking');if(tourTimer){clearTimeout(tourTimer);tourTimer=null;}stop.hidden=true;start.hidden=false;}
  /* Voice: the deepest calm English voice the browser has, pitched down a
     little and unhurried. Free, local, and as close to a benevolent machine
     as a system voice gets. Browsers deliver their voice list late, so it is
     warmed here and refreshed on voiceschanged. */
  var voiceList=[];function loadVoices(){try{voiceList=synth?synth.getVoices():[];}catch(e){voiceList=[];}}
  if(synth){loadVoices();if(typeof synth.addEventListener==='function')synth.addEventListener('voiceschanged',loadVoices);else synth.onvoiceschanged=loadVoices;}
  function pickVoice(){var en=voiceList.filter(function(x){return /^en[-_]/i.test(x.lang)});
    var prefer=[/Google UK English Male/i,/Microsoft (Ryan|Guy|Christopher|Eric|Roger|Brandon|Davis|Andrew|Brian)/i,/\b(Daniel|Arthur|Oliver|Rishi|Fred|Alex)\b/i,/Microsoft (David|Mark|George)/i,/Google US English/i,/\bmale\b/i];
    for(var i=0;i<prefer.length;i++){var v=en.filter(function(x){return prefer[i].test(x.name)})[0];if(v)return v;}
    return en[0]||null;}
  function speak(text,then){caption(text,false);if(lisaMode||!synth||!window.SpeechSynthesisUtterance){if(then)tourTimer=setTimeout(then,Math.min(9000,1800+text.length*45));return;}
    try{synth.cancel();var u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=0.95;u.pitch=0.8;if(!voiceList.length)loadVoices();var v=pickVoice();if(v)u.voice=v;
      speaking=true;btn.classList.add('talking');u.onend=function(){speaking=false;btn.classList.remove('talking');if(then)tourTimer=setTimeout(then,350);};u.onerror=function(){speaking=false;btn.classList.remove('talking');if(then)tourTimer=setTimeout(then,Math.min(9000,1800+text.length*45));};synth.speak(u);}
    catch(e){if(then)tourTimer=setTimeout(then,Math.min(9000,1800+text.length*45));}}
  function openPanel(){panel.hidden=false;btn.setAttribute('aria-expanded','true');start.focus();}
  function closePanel(){panel.hidden=true;btn.setAttribute('aria-expanded','false');stopSpeech();stopListening();btn.focus();}
  function goTopic(t){var opened=S.open(t);speak(SAY[opened]||SAY.home);}
  function tour(i){if(i>=TOUR.length){stop.hidden=true;start.hidden=false;return;}stop.hidden=false;start.hidden=true;speak(TOUR[i],function(){tour(i+1);});}
  /* topic buttons */
  Object.keys(NAMES).forEach(function(k){var b=document.createElement('button');b.type='button';b.textContent=NAMES[k];b.setAttribute('data-go',k);b.addEventListener('click',function(){goTopic(k);});topicsBox.appendChild(b);});
  btn.addEventListener('click',function(){panel.hidden?openPanel():closePanel();});
  close.addEventListener('click',closePanel);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)closePanel();});
  start.addEventListener('click',function(){tour(0);});
  stop.addEventListener('click',function(){stopSpeech();caption('Stopped. Tap a topic, or press Start to hear the tour again.',true);});
  /* voice commands, browser speech recognition, opt in */
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  function interpret(t){t=t.toLowerCase();
    if(/\b(full|whole|everything|long)\b/.test(t)){S.setMode('full');return speak('Switched to the full page. Everything is visible now, top to bottom.');}
    if(/\b(compact|one at a time|cards?)\b/.test(t)&&!/\btoken\b/.test(t)){S.setMode('compact');return speak('Switched to compact. One topic at a time.');}
    if(/\b(stop|quiet|enough)\b/.test(t)){stopSpeech();return caption('Okay.',true);}
    var O=window.SABLE_ORRERY;
    if(O){var W2={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13};
      var m1=t.match(/\b(?:section|planet|chapter)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen)\b/);
      if(m1){var n=W2[m1[1]]||parseInt(m1[1],10),secs=O.sections(),idx=-1;for(var k=0;k<secs.length;k++)if(parseInt(secs[k].n,10)===n)idx=k;
        if(idx>=0){S.open('home');O.select(idx);return speak('Section '+n+', '+secs[idx].title+'. '+secs[idx].count+' sentences'+(secs[idx].changed?', and it changed recently.':'.')+' Its first sentence is on screen.');}
        return speak('Sections run from one to thirteen.');}
      if(/\b(today|sentence of the day)\b/.test(t)){var td=O.today();if(td){var sx=O.sections()[td.i];S.open('home');O.select(td.i);var q=document.getElementById('orr-today-q');return speak('Today\'s sentence, from section '+sx.n+', '+sx.title+'. '+(q?q.textContent:''));}}
      var m2=t.match(/\b(?:search|find|look for)\s+(?:the word\s+)?([a-z0-9-]+)/);
      if(m2){S.open('home');O.search(m2[1]);var sp=document.querySelector('#orr-qres span');return speak('Searched the whitepaper for '+m2[1]+'. '+(sp?sp.textContent:'Nothing found')+'. The matching sentences light up on the map.');}
      if(/\b(map|orrery|solar|planets?|whitepaper)\b/.test(t))return goTopic('home');}
    var map=[[/(overview|home|start|menu)/,'home'],[/(explain|plain|what is sable|simple)/,'explained'],[/(door|try|prompt|send|loop|budget)/,'door'],[/(verify|check|receipt|status|signer|trust)/,'check'],[/(field|compare|comparison|projects|peers|table)/,'field'],[/(token|sabl|market|cap|ladder|price)/,'token'],[/(scenario|worth|future|bands?)/,'scenarios'],[/(play|game|gatekeeper|score|leaderboard)/,'play'],[/(log|updates?|ledger|wrong|corrections?)/,'log'],[/(community|telegram|join|twitter|\bx\b)/,'community']];
    for(var i=0;i<map.length;i++){if(map[i][0].test(t))return goTopic(map[i][1]);}
    speak('I did not catch a topic. You can say: explained, try it, verify, the field, token, scenarios, log, or community. Or say full, or compact.');}
  window.SABLE_GUIDE_API={interpret:interpret};
  function stopListening(){listening=false;mic.setAttribute('aria-pressed','false');mic.textContent='Voice commands';if(rec){try{rec.stop();}catch(e){}}}
  function listen(){if(!SR)return;if(listening){stopListening();caption('Voice commands off.',true);return;}
    try{rec=new SR();rec.lang='en-US';rec.interimResults=false;rec.maxAlternatives=3;
      rec.onresult=function(e){var t=e.results[0][0].transcript;caption('You said: '+t,true);setTimeout(function(){interpret(t);},250);};
      rec.onerror=function(e){caption('Voice error: '+(e.error||'unknown')+'. Tap a topic instead.',true);stopListening();};
      rec.onend=function(){if(listening){try{rec.start();}catch(e){stopListening();}}};
      listening=true;mic.setAttribute('aria-pressed','true');mic.textContent='Listening…';caption('Listening. Say a topic, or say full or compact.',true);stopSpeech();rec.start();}
    catch(e){caption('Voice commands are not available in this browser. Tap a topic instead.',true);stopListening();}}
  if(SR&&location.protocol!=='file:'){mic.hidden=false;mic.addEventListener('click',listen);}
  /* Lisa, when an ElevenLabs agent id is configured. She is driven from this
     panel through the ElevenLabs client SDK (site/lisa.js), fetched only when a
     visitor presses Talk to Lisa. No floating widget, no script on page load. */
  var cfg=window.SABLE_GUIDE||{};
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  if(cfg.elevenlabsAgentId){
    var NAME=cfg.name||'Guide';
    $('guide-name').textContent=NAME;$('guide-sub').textContent='voice agent · ElevenLabs · not run by Sable';
    $('guide-note').innerHTML=esc(NAME)+' is a voice agent hosted by ElevenLabs. When you press Talk to '+esc(NAME)+', what you say goes to ElevenLabs to be understood and answered; nothing goes to Sable. Hear the tour calls her too. If she cannot start, the tour uses your browser\'s voice instead, and the topic buttons always work.';
    start.textContent='Hear the tour';if(mic){mic.hidden=true;}
    caption('Hi. Press Talk to '+NAME+' and she opens topics and sections of the whitepaper as you speak. Or press Hear the tour, or tap a topic.',true);
    var TOOLS={
      navigate:function(p){var t=(p&&(p.topic||p.section)||'home').toString().toLowerCase();var opened=S.open(t);return 'Opened '+NAMES[opened]+'. '+(SAY[opened]||'');},
      set_view:function(p){var m=(p&&p.mode||'compact').toString().toLowerCase();return 'View is now '+S.setMode(m)+'.';},
      where_am_i:function(){return 'The visitor is on '+NAMES[S.current()]+' in '+S.mode()+' view. Topics: '+Object.keys(NAMES).map(function(k){return NAMES[k]}).join(', ')+'.';},
      open_section:function(p){var O=window.SABLE_ORRERY;if(!O)return 'The map is not available.';var n=String(p&&(p.section||p.number)||'').trim().replace(/^0/,'').toUpperCase();var secs=O.sections(),idx=-1;for(var k=0;k<secs.length;k++)if(String(parseInt(secs[k].n,10))===n||secs[k].n===n)idx=k;if(idx<0)return 'No section '+n+'. Sections run 01 to 13, plus A for the appendix.';S.open('home');O.select(idx);var sx=secs[idx],q=document.querySelector('#orr-panel .orr-their');return 'Opened section '+sx.n+', '+sx.title+': '+sx.count+' sentences'+(sx.changed?', changed on '+sx.changed:'')+'. Its first sentence: '+(q?q.textContent:'');},
      search_whitepaper:function(p){var O=window.SABLE_ORRERY;if(!O)return 'The map is not available.';var w=String(p&&(p.word||p.query)||'').trim();S.open('home');O.search(w);var sp=document.querySelector('#orr-qres span');return w?('Searched the whitepaper for "'+w+'": '+(sp?sp.textContent:'nothing found')+'. The matching sentences are lit on the map.'):'Search cleared.';},
      todays_sentence:function(){var O=window.SABLE_ORRERY,td=O&&O.today();if(!td)return 'The map has not loaded yet.';var sx=O.sections()[td.i];S.open('home');O.select(td.i);var q=document.getElementById('orr-today-q');return 'Today\'s sentence is from section '+sx.n+', '+sx.title+': '+(q?q.textContent:'');}
    };
    Object.keys(TOOLS).forEach(function(k){var f=TOOLS[k];TOOLS[k]=function(p){(window.__lisaCalls=window.__lisaCalls||[]).push([k,p||{}]);return f(p);};});
    function briefing(){var lines=Object.keys(NAMES).map(function(k){return '- '+NAMES[k]+' (topic id "'+k+'"): '+(SAY[k]||'');});
      return 'PAGE CONTEXT FOR THE GUIDE. You are speaking inside sable.primecircle.cloud, an independent page about Sable Network by a community member who holds SABL; you are not run by Sable. '+
        'The page has two views: compact (one topic at a time) and full (everything as one long page). The visitor is currently on "'+NAMES[S.current()]+'" in '+S.mode()+' view. '+
        'The page has exactly these '+Object.keys(NAMES).length+' topics right now. This list is current and replaces any list of pages in your instructions; every one of them opens with navigate, including Play:\n'+lines.join('\n')+'\n'+
        'You can move the page yourself with tools: navigate(topic) opens a topic by its id, one of '+Object.keys(NAMES).join(', ')+'; set_view(mode) switches compact or full; where_am_i tells you what is on screen; open_section(section) opens one section of the whitepaper on the map (1 to 13, or A) and returns its first sentence; search_whitepaper(word) lights up every sentence with that word and returns the count; todays_sentence opens the sentence of the day. '+
        'When the visitor asks for the tour, give it one page at a time in this order, calling navigate for each topic before you describe it in one or two sentences, then stop and wait until the visitor asks for the next page: '+TOUR.join(' ')+' '+
        'When asked to show, open or go to something, call navigate or open_section first, then describe what is now on screen. Keep answers to two sentences unless asked for more. No price predictions, no investment advice. If you do not know something about Sable, say so and point to buildsable.com.';}
    var host=document.createElement('div');host.id='lisa-host';host.className='lisa';
    host.innerHTML='<button type="button" class="pill fill" id="lisa-call">Talk to '+esc(NAME)+'</button><button type="button" class="pill" id="lisa-end" hidden>End the call</button><span class="lisa-status" id="lisa-status" aria-live="polite">voice, microphone needed</span>';
    panel.insertBefore(host,cap);
    var callBtn=$('lisa-call'),endBtn=$('lisa-end'),statusEl=$('lisa-status'),mod=null,inCall=false;
    function status(t){statusEl.textContent=t;}
    function setCall(on){inCall=on;callBtn.hidden=on;endBtn.hidden=!on;btn.classList.toggle('talking',on);if(!on){touring=false;pendingTour=false;start.textContent='Hear the tour';}}
    var pendingTour=false,sawSpeaking=false,tourWait=null,touring=false;
    function askTour(){pendingTour=false;if(tourWait){clearTimeout(tourWait);tourWait=null;}if(!(mod&&inCall))return;touring=true;start.textContent='Next page';mod.send('Please give me the tour of this page one page at a time. Open the first topic with navigate and describe it in one or two sentences, then stop and ask if I want the next page. Do not continue until I ask for it. Go through the topics in order until all ten are done.');status(NAME+' is giving the tour');}
    function nextPage(){if(!(mod&&inCall))return;mod.send('Next page, please.');status(NAME+' continues the tour');}
    function busy(on){callBtn.disabled=on;start.disabled=on;}
    /* one call, started from Talk to Lisa or from Hear the tour; `then` runs once she is connected and briefed */
    function connect(then,forTour){
      if(inCall){if(then)then();return;}
      var connected=false;stopSpeech();busy(true);status('connecting…');caption('Connecting to '+NAME+(forTour?' for the tour':'')+'…',true);
      function fail(e){busy(false);setCall(false);pendingTour=false;var why=e&&e.message?e.message:'connection failed';
        if(forTour&&!connected&&synth&&window.SpeechSynthesisUtterance){lisaMode=false;status(NAME+' could not start, so this is the browser voice');tour(0);return;}
        status('could not connect');caption(NAME+' could not start ('+why+'). Allow the microphone and try again, or tap a topic.',true);}
      (mod?Promise.resolve(mod):import('./lisa.js')).then(function(m){mod=m;return m.start({agentId:cfg.elevenlabsAgentId,tools:TOOLS,on:{
        status:function(st){if(st==='connected'){if(connected)return;connected=true;lisaMode=true;sawSpeaking=false;setCall(true);status(NAME+' is listening');setTimeout(function(){if(mod&&inCall){mod.context(briefing());if(then)then();}},400);}else if(st==='connecting'){status('connecting…');}else if(st==='disconnected'){setCall(false);pendingTour=false;status('call ended');busy(false);}},
        mode:function(md){if(!inCall)return;status(md==='speaking'?NAME+' is speaking':NAME+' is listening');if(md==='speaking')sawSpeaking=true;else if(md==='listening'&&pendingTour&&sawSpeaking)askTour();},
        message:function(src,text){if(!text)return;caption((src==='user'?'You: ':NAME+': ')+text,src==='user');},
        error:function(e){if(connected){setCall(false);busy(false);status('call dropped');caption(NAME+' dropped the call ('+(e&&e.message?e.message:'connection failed')+'). Press Talk to '+NAME+' to call again.',true);}else fail(e);}
      }});}).then(function(){busy(false);}).catch(fail);
    }
    callBtn.addEventListener('click',function(){connect(null,false);});
    endBtn.addEventListener('click',function(){if(mod)mod.stop();setCall(false);pendingTour=false;status('call ended');});
    /* Hear the tour: in a call she gives it now; outside a call she is called first and asked once her greeting is over */
    start.addEventListener('click',function(e){if(!lisaMode)return;e.stopImmediatePropagation();stopSpeech();
      if(inCall&&mod){if(touring)nextPage();else askTour();return;}
      connect(function(){pendingTour=true;tourWait=setTimeout(function(){if(pendingTour)askTour();},15000);},true);},true);
    window.addEventListener('hashchange',function(){if(inCall&&mod)mod.context('The visitor is now on "'+NAMES[S.current()]+'" in '+S.mode()+' view.');});
    close.addEventListener('click',function(){if(mod&&inCall){mod.stop();setCall(false);status('call ended');}});
    window.SABLE_LISA={call:function(){callBtn.click();},end:function(){endBtn.click();},tour:function(){start.click();},active:function(){return inCall;},send:function(t){return !!(mod&&inCall&&mod.send(t));},calls:function(){return window.__lisaCalls||[];}};
  }
})();

/* block 5 */
/* Where the page reads its live data from. On the live host everything goes
   through this host's own read-only cache, so a visitor's browser never
   contacts CoinGecko, DexScreener or GitHub. Anywhere else (the artifact,
   a local file) it falls back to the public endpoints directly. */
window.SABLE_EXT=(function(){
  var live=location.hostname==='sable.primecircle.cloud';
  var GH='https://raw.githubusercontent.com/CryptoWesAI/sable-whitepaper-watch/main/';
  return live?{markets:'/ext/markets',sabl:'/ext/sabl',record:'/ext/record',peers:'/ext/peers',ledger:'/ext/ledger',whitepaper:'/ext/whitepaper',board:'/api/game',status:'/sable-api/status',pubkey:'/sable-api/receipts/pubkey',models:'/sable-api/models'}
  :{markets:'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=automata,marlin,secret,pha,opengradient,nillion,iexec-rlc,oasis-network,akash-network,virtual-protocol,bittensor,near&per_page=50&page=1&sparkline=false&price_change_percentage=30d',
    sabl:'https://api.dexscreener.com/latest/dex/tokens/DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump',record:GH+'record.json',peers:GH+'peers-record.json',ledger:GH+'status/log.jsonl',whitepaper:GH+'whitepaper.json',board:'http://127.0.0.1:8791',status:'/sable-api/status',pubkey:'/sable-api/receipts/pubkey',models:'/sable-api/models'};
})();

/* block 6 */
/* The Orrery. The whitepaper as a solar system: thirteen sections turn around
   one sentence, every dot is a sentence of the paper, orange means it arrived
   or left after the first snapshot. Data is whitepaper.json from the watch
   repository, rebuilt hourly from the PDF snapshots. Motion is a function of
   the clock, so the map keeps turning while nobody looks and shows the same
   picture to everyone at the same moment. Canvas 2D, at most 30 frames a
   second, and only while it is on screen. */
(function(){
  var cv=document.getElementById('orr');if(!cv||!cv.getContext)return;
  var $=function(id){return document.getElementById(id)};
  var stage=$('orr-stage'),hud=$('orr-hud'),live=$('orr-live'),prev=$('orr-prev'),next=$('orr-next'),cur=$('orr-cur'),num=$('orr-num'),ttl=$('orr-title'),intro=$('orr-intro'),panel=$('orr-panel'),q=$('orr-q'),qres=$('orr-qres'),root=$('orrery');
  var ctx=cv.getContext('2d'),EY=0.56;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PDF='https://www.buildsable.com/sable-whitepaper.pdf',GH='https://github.com/CryptoWesAI/sable-whitepaper-watch/blob/main/';
  var OURS_DATE='2026-09-05';
  var OURS={
    '01':{topic:'explained',line:'An agent hands over everything it knows, all day, to whoever runs the model, and when the bill comes nobody can say what ran. Sable\'s answer to both starts with changing one line of code, and the same code runs elsewhere if Sable disappears.'},
    '02':{topic:'explained',line:'Sable does not sell the machine; it sells the meter, the budget and the proof that sit over it. Metering happens at the gateway, budgets are checked before the call, and a failed hardware check refuses the request instead of quietly downgrading it.'},
    '03':{topic:'explained',line:'Seven blunt rules enforced in code: prompts and code are never written to disk or logs, requests are sealed on arrival, only metadata is kept, keys are stored as hashes, and the portal cannot show a prompt because it never had one. The cost: abuse is handled per account, never by scanning content.'},
    '04':{topic:'door',line:'One pipeline for both kinds of work: seal the request, hold the budget, open it once right before dispatch, meter what happened, sign the receipt. The plaintext exists only in that one frame, and what Sable keeps per job is a single row of numbers.'},
    '05':{topic:'door',line:'A budget checked after the money is spent is not a budget. Sable holds the worst-case cost before any call, every key can carry a hard cap, and a key can only hand out smaller keys, with spending summed and revocation cascading down the tree.'},
    '06':{topic:'token',line:'Machines pay without a card: prepaid USDT on Ethereum, Arbitrum and Solana, verified on chain with strict checks, or x402 in the middle of a request. Everything is priced in dollars. Since 2 September SABL has one optional role, a pay-in that burns the token for a discount, still rolling out: no yield, no vote, no claim.'},
    '07':{topic:'check',line:'Every billable response is signed with a published key in a standard format, so ordinary wallet tooling can verify it. A receipt proves that Sable attests to this fingerprint at this cost and that nothing was altered since: an accountable statement by a named party, not a proof of physics.'},
    '08':{topic:'check',line:'On the confidential tier a request only goes to an Intel TDX enclave whose attestation the gateway verified first, and anything less is refused, never downgraded. The response is bound to the enclave\'s own key. The stated boundary: the enclave is run by a provider, not yet by Sable.'},
    '09':{topic:'field',line:'Agents write code, so Sable runs it: short jobs metered in CPU-seconds and gigabyte-seconds on the same key and balance, isolated with gVisor on one Sable-operated machine, network off by default. Code and output are returned once and never stored.'},
    '10':{topic:'explained',line:'A table that separates what the code does today from what it does not. Built: sealed ingress, receipts, holds, sub-keys, USDT and x402, TDX attestation, the MCP server. Not built: Sable-owned enclaves, confidential sandboxes, third-party operators, multi-region. Region pinning was described wrongly in the previous version and is now honest.'},
    '11':{topic:'scenarios',line:'The machines are the commodity; the trust layer over them is not. Compute stays rented, first by Sable, then from vetted operators, open supply last if ever. Sable commits not to call itself a marketplace or decentralised until independent operators serve a meaningful share of paid work.'},
    '12':{topic:'explained',line:'Defended today: interception, retention, tampering, unattested execution, runaway budgets, double billing. Not yet: the gateway process briefly sees plaintext on the standard tier, the sandbox host can read your code, and one gateway is a single point of failure. The roadmap is the shrinking of that list.'},
    '13':{topic:'check',line:'The durable position is neither the hardware nor the model but the layer that makes a unit of compute provable. In their words: trust through architecture, not assurances. Promises don\'t scale; verification does.'},
    'A':{topic:'check',line:'A representative slice of the API: chat, embeddings, messages, sandboxes, MCP, delegated keys, credit, models, attestation, receipts, billing methods, nodes. Every metered call carries the receipt in its response headers.'},
    'sun':{topic:'explained',line:'A gateway for AI agents that seals what you send, refuses to spend past your budget, and signs a receipt for every unit of work that anyone can check. That sentence is the whole paper; the thirteen sections are how.'}
  };
  var COVER_LINE='A control plane for agent compute: an OpenAI- and Anthropic-compatible API plus metered code sandboxes, where every unit of work is metered at the gateway, bounded by a budget the caller sets, paid in prepaid stablecoin, and signed on the way out as a receipt anyone can verify.';
  var FALLBACK=[['01','The delegation problem',18],['02','The control plane',23],['03','The privacy contract',26],['04','Architecture',20],['05','Metering, budgets & delegation',19],['06','Payment: prepaid USDT and x402',32],['07','Verifiable receipts',10],['08','Confidential execution & attestation',19],['09','Sandbox compute',17],['10','What is built, and what is not',9],['11','Direction: compute for rent',20],['12','Threat model & trust boundaries',24],['13','Conclusion',5],['A','Appendix: API surface',3]];
  var TOPICS={explained:'Explained',door:'Try it',check:'Verify',field:'The field',token:'Token',scenarios:'Scenarios',updates:'The log',community:'Community'};
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function day(l,short){if(!l)return '';var m=String(l).match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return String(l);var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return parseInt(m[3],10)+' '+M[parseInt(m[2],10)-1]+(short?'':' '+m[1]);}
  function safe(p){p=String(p||'');return /^[A-Za-z0-9._\/-]+$/.test(p)&&p.indexOf('..')<0?p:'';}
  var data=null,S=[],sel=-1,selSent=-1,filter=null,word='',W=0,H=0,dpr=1,cx=0,cy=0,R=0,frames=0,raf=0,last=0,inview=true,hoverI=-1,ready=false,today=null,fresh=null,visit=null,liveText='';
  function setLive(t){liveText=t;live.textContent=t;}
  var hoverT=null,MARKS=['explained','door','check','field','token','scenarios','play','log','community'];
  var NAMES_T={explained:'Explained',door:'Try it',check:'Verify',field:'The field',token:'Token',scenarios:'Scenarios',play:'Play',log:'Log',community:'Community'};
  var LINKS={explained:['01','02','03','10','12'],door:['04','05'],check:['07','08'],field:['09','10','11'],token:['06'],scenarios:['11','13'],play:['05','12'],log:['sun'],community:[]};
  function wide(){return W>=480;}
  var T0=Date.now()/1000;function clock(){return reduce?T0:Date.now()/1000;}
  function build(list){
    S=list.map(function(x){return {n:x.n,title:x.title,count:x.count||0,words:x.words||0,changed:x.changed||null,added:x.added||0,removed:x.removed||0,sents:x.sentences||[],ghosts:x.ghosts||[],hits:null}});
    var k=Math.max(S.length,2),maxc=1;S.forEach(function(x){if(x.count>maxc)maxc=x.count});
    S.forEach(function(x,i){x.r=0.24+0.63*(i/(k-1));x.T=80*Math.pow(x.r/S[0].r,1.5);x.phase=i*2.399963+0.7;x.size=3+3.4*Math.sqrt(x.count/maxc);
      x.moons=[];for(var m=0;m<x.count;m++)x.moons.push({rr:((m*7)%5)/5,T:7+((m*13)%11),ph:m*2.399963});});
  }
  function pos(x,t){var a=x.phase+2*Math.PI*t/x.T;return {x:cx+R*x.r*Math.cos(a),y:cy+R*x.r*EY*Math.sin(a),a:a};}
  function radius(x,p){return x.size*(0.86+0.28*(((p.y-cy)/(R*EY))+1)/2);}
  function markPos(j){var a=-Math.PI/2+j*2*Math.PI/MARKS.length,rx=R*0.985;return {x:cx+rx*Math.cos(a),y:cy+rx*EY*Math.sin(a),a:a};}
  function chipOf(tp){return document.querySelector('#orr-topics button[data-topic="'+tp+'"]');}
  function badgeOf(tp){var c=chipOf(tp),b=c&&c.querySelector('.badge');return b?{text:b.textContent.trim(),cls:/\bwarn\b/.test(b.className)?'warn':/\bok\b/.test(b.className)?'ok':''}:{text:'',cls:''};}
  function topicLine(tp){var l=LINKS[tp]||[],b=badgeOf(tp);return NAMES_T[tp]+(l.length?(l[0]==='sun'?' · watches the whole paper':' · checks section'+(l.length>1?'s ':' ')+l.join(', ')):' · a page of this site')+(b.text?' · '+b.text.split(' · ')[0]:'');}
  function litChip(tp){document.querySelectorAll('#orr-topics button.lit').forEach(function(c){if(c.getAttribute('data-topic')!==tp)c.classList.remove('lit')});var c=tp&&chipOf(tp);if(c)c.classList.add('lit');}
  function go(tp){if(window.SABLE_SHELL)window.SABLE_SHELL.open(tp);else location.hash=tp;}
  function links(t){if(!hoverT)return;var m=markPos(MARKS.indexOf(hoverT));var ends=(LINKS[hoverT]||[]).map(function(n){if(n==='sun')return {x:cx,y:cy};var x=null;for(var i=0;i<S.length;i++)if(S[i].n===n)x=S[i];return x?pos(x,t):null;}).filter(Boolean);
    ctx.strokeStyle='rgba(24,191,255,.4)';ctx.lineWidth=1;ends.forEach(function(e){ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(e.x,e.y);ctx.stroke();});}
  function markers(){ctx.beginPath();ctx.ellipse(cx,cy,R*0.985,R*0.985*EY,0,0,Math.PI*2);ctx.strokeStyle='rgba(114,220,255,.12)';ctx.lineWidth=0.8;ctx.setLineDash([2,5]);ctx.stroke();ctx.setLineDash([]);
    MARKS.forEach(function(tp,j){var m=markPos(j),b=badgeOf(tp),lit=hoverT===tp,sz=lit?7:5.5;
      var fill=b.cls==='warn'?'#E0BE72':b.cls==='ok'?'#8FD0B8':lit?'#18BFFF':'rgba(114,220,255,.35)';
      if(lit){ctx.shadowBlur=12;ctx.shadowColor='rgba(24,191,255,.9)';}
      ctx.fillStyle=fill;ctx.fillRect(m.x-sz/2,m.y-sz/2,sz,sz);ctx.shadowBlur=0;ctx.strokeStyle=lit?'#fff':'rgba(114,220,255,.8)';ctx.lineWidth=1;ctx.strokeRect(m.x-sz/2,m.y-sz/2,sz,sz);
      if(lit&&wide()){var c=Math.cos(m.a),sn=Math.sin(m.a);ctx.font='600 10px "IBM Plex Mono",monospace';ctx.fillStyle='#E8F2F8';ctx.textBaseline='middle';ctx.textAlign=c>0.3?'right':c<-0.3?'left':'center';ctx.fillText(NAMES_T[tp],c>0.3?m.x-10:c<-0.3?m.x+10:m.x,sn<-0.3?m.y+13:sn>0.3?m.y-13:m.y);}});}
  function moonPos(p,m,t,big,r){var a=m.ph+2*Math.PI*t/m.T;var rad=big?(r+6+m.rr*13):(r+2+m.rr*6);return {x:p.x+rad*Math.cos(a),y:p.y+rad*EY*Math.sin(a)};}
  function size(){var b=stage.getBoundingClientRect();W=Math.max(200,Math.round(b.width));H=Math.max(140,Math.round(b.height));dpr=Math.min(window.devicePixelRatio||1,2.5);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cx=W/2;cy=H/2+2;EY=Math.max(0.5,Math.min(0.92,(H/2-22)/(W/2-18)));R=Math.min(W/2-18,(H/2-22)/EY);}
  function sun(t){var g=ctx.createRadialGradient(cx,cy,0,cx,cy,30);g.addColorStop(0,'rgba(232,242,248,.95)');g.addColorStop(.2,'rgba(114,220,255,.55)');g.addColorStop(1,'rgba(24,191,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,30,0,Math.PI*2);ctx.fill();
    if(sel===-2){ctx.strokeStyle='rgba(232,242,248,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,11,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#F4FAFF';ctx.beginPath();ctx.arc(cx,cy,5.5,0,Math.PI*2);ctx.fill();
    if(wide()){ctx.font='500 9px "IBM Plex Mono",monospace';ctx.fillStyle='rgba(143,163,176,.8)';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('COMPUTE YOU CAN PROVE',cx,cy+17);}}
  function trail(x,i,a){var rx=R*x.r,ry=rx*EY,n=9,span=0.55,col=x.changed?'255,122,89':(i===sel?'24,191,255':'143,163,176');
    for(var k=0;k<n;k++){var a0=a-span+k*span/n,a1=a0+span/n+0.01;ctx.strokeStyle='rgba('+col+','+(0.04+0.34*(k/n))+')';ctx.lineWidth=i===sel?1.6:1.1;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,a0,a1);ctx.stroke();}}
  function planet(p,t){var x=p.s,i=p.i,big=i===sel,r=radius(x,p);
    trail(x,i,p.a);
    var hits=word&&x.hits,count=big?x.moons.length:Math.min(x.moons.length,14);
    for(var m=0;m<count;m++){var mo=x.moons[m],mp=moonPos(p,mo,t,big,r),idx=big?m:Math.floor(m*x.moons.length/count),se=x.sents[idx];
      var isNew=!!(se&&data&&se.s!==data.first),isHit=!!(hits&&hits.indexOf(idx)>=0),isToday=!!(today&&today.i===i&&today.m===idx),isFresh=!!(se&&fresh&&se.s>fresh);
      var col=isHit?'rgba(114,220,255,'+(big?1:.9)+')':(isNew||isFresh)?'rgba(255,122,89,'+(big?.95:.85)+')':isToday?'rgba(244,250,255,.98)':big?'rgba(232,242,248,.85)':'rgba(143,163,176,.5)';
      var mr=isHit?2:isToday?2.3:isNew?1.8:big?1.6:1.15;
      if(isToday||((isNew||isHit)&&big)){ctx.shadowBlur=isToday?12:8;ctx.shadowColor=col;}
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(mp.x,mp.y,mr,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      if(big&&selSent===idx){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(mp.x,mp.y,4.5,0,Math.PI*2);ctx.stroke();}}
    if(x.changed){var pulse=reduce?0.5:0.5+0.5*Math.sin(t*1.6+i);ctx.strokeStyle='rgba(255,122,89,'+(0.22+0.38*pulse)+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r+3.5,0,Math.PI*2);ctx.stroke();}
    if(big||hoverI===i){ctx.shadowBlur=16;ctx.shadowColor='rgba(24,191,255,.9)';}
    ctx.fillStyle=big?'#18BFFF':(hits&&hits.length)?'#72DCFF':'#E8F2F8';ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(wide()||big||x.changed||hoverI===i){ctx.font=(big?'600 11px':'500 9px')+' "IBM Plex Mono",monospace';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle=big?'#E8F2F8':x.changed?'rgba(255,122,89,.9)':'rgba(143,163,176,.75)';ctx.fillText(x.n,p.x+r+4,p.y-r-3);}}
  function draw(){var t=clock();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    S.forEach(function(x,i){ctx.beginPath();ctx.ellipse(cx,cy,R*x.r,R*x.r*EY,0,0,Math.PI*2);var hit=word&&x.hits&&x.hits.length;ctx.strokeStyle=i===sel?'rgba(24,191,255,.42)':hit?'rgba(114,220,255,.3)':x.changed?'rgba(255,122,89,.18)':'rgba(24,191,255,.13)';ctx.lineWidth=i===sel?1.2:0.8;ctx.stroke();});
    links(t);var ps=S.map(function(x,i){var p=pos(x,t);p.i=i;p.s=x;return p;}).sort(function(a,b){return a.y-b.y});var drewSun=false;
    ps.forEach(function(p){if(!drewSun&&p.y>cy){sun(t);drewSun=true;}planet(p,t);});if(!drewSun)sun(t);markers();}
  function nearest(px,py){var t=clock();
    for(var j=0;j<MARKS.length;j++){var mk=markPos(j);if(Math.hypot(mk.x-px,mk.y-py)<12)return {topic:MARKS[j]};}
    if(sel>=0){var x=S[sel],p=pos(x,t),r=radius(x,p);for(var m=0;m<x.moons.length;m++){var mp=moonPos(p,x.moons[m],t,true,r);if(Math.hypot(mp.x-px,mp.y-py)<7)return {moon:m};}}
    if(Math.hypot(cx-px,cy-py)<20)return {sun:true};
    var best=-1,bd=1e9;S.forEach(function(x,i){var p=pos(x,t),d=Math.hypot(p.x-px,p.y-py);if(d<bd){bd=d;best=i;}});
    return bd<26?{planet:best}:null;}
  function xy(e){var b=cv.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top};}
  function showHover(h){if(!h){live.textContent=liveText;return;}var x;if(h.topic){live.textContent=topicLine(h.topic);return;}
    if(h.moon!=null){x=S[sel];var se=x.sents[h.moon];live.textContent=se?se.t:liveText;}
    else if(h.sun){live.textContent='the centre · Compute you can prove';}
    else{x=S[h.planet];live.textContent=x.n+' · '+x.title+' · '+x.count+' sentences'+(x.changed?' · changed '+day(x.changed,true):'');}}
  cv.addEventListener('click',function(e){var p=xy(e),h=nearest(p.x,p.y);if(!h)return;if(window.SABLE_SOUND)window.SABLE_SOUND.tick('tap');if(h.topic){go(h.topic);return;}if(h.moon!=null)pick(sel,h.moon);else if(h.sun)select(-2);else select(h.planet);});
  cv.addEventListener('mousemove',function(e){var p=xy(e),h=nearest(p.x,p.y);hoverI=h&&h.planet!=null?h.planet:-1;var ht=h&&h.topic?h.topic:null;if(ht!==hoverT){hoverT=ht;litChip(ht);if(reduce)draw();}cv.style.cursor=h?'pointer':'';showHover(h);});
  cv.addEventListener('mouseleave',function(){hoverI=-1;if(hoverT){hoverT=null;litChip(null);if(reduce)draw();}live.textContent=liveText;});
  function orderIdx(){var o=[];for(var i=0;i<S.length;i++)o.push(i);o.push(-2);return o;}
  function step(d){var o=orderIdx(),k=o.indexOf(sel);k=k<0?(d>0?0:o.length-1):(k+d+o.length)%o.length;select(o[k]);}
  prev.addEventListener('click',function(){step(-1)});next.addEventListener('click',function(){step(1)});
  cur.addEventListener('click',function(){if(sel===-1)select(0);else panel.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});});
  root.addEventListener('keydown',function(e){if(e.target===q)return;if(e.key==='ArrowLeft'){step(-1);e.preventDefault();}else if(e.key==='ArrowRight'){step(1);e.preventDefault();}});
  function select(i,opts){opts=opts||{};sel=i;selSent=-1;if(!opts.keepFilter)filter=null;renderCtl();renderPanel();root.classList.toggle('open',i!==-1);if(reduce)draw();
    if(i!==-1&&window.innerWidth<901&&!opts.quiet)panel.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});}
  function pick(i,m){if(sel!==i)select(i,{quiet:true});selSent=m;var li=panel.querySelector('li[data-i="'+m+'"]');if(li&&li.hidden)expandAll();panel.querySelectorAll('li.picked').forEach(function(x){x.classList.remove('picked')});if(li){li.classList.add('picked');li.scrollIntoView({block:'nearest'});}if(reduce)draw();}
  function renderCtl(){cur.classList.remove('changed');
    if(sel===-1){num.textContent=(S.length?S.length-1:13)+' sections';ttl.textContent=visit||'tap a planet or search';}
    else if(sel===-2){num.textContent='the centre';ttl.textContent='Compute you can prove';}
    else{var x=S[sel];num.textContent=(x.n==='A'?'appendix':x.n+' / 13')+(x.changed?' · changed '+day(x.changed):'');ttl.textContent=x.title;cur.classList.toggle('changed',!!x.changed);}}
  function hl(t){if(!word)return esc(t);var i=t.toLowerCase().indexOf(word);if(i<0)return esc(t);return esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+word.length))+'</mark>'+esc(t.slice(i+word.length));}
  function renderPanel(){
    if(sel===-1){panel.hidden=true;intro.hidden=false;return;}
    intro.hidden=true;panel.hidden=false;var h='',d=data||{};
    if(sel===-2){
      h+='<div class="orr-ph"><span class="orr-n">☉</span><h2>Compute you can prove</h2><div class="orr-nav"><button type="button" class="x" id="orr-pprev" aria-label="Previous section">‹</button><button type="button" class="x" id="orr-pnext" aria-label="Next section">›</button><button type="button" class="x" id="orr-close" aria-label="Close">×</button></div></div>';
      h+='<p class="orr-meta">cover '+esc(d.cover||'v2.0, August 2026')+' · 13 sections · '+(d.sentence_count?d.sentence_count+' sentences · ':'')+(d.first?'watched since '+day(d.first)+' · latest snapshot '+day(d.latest):'record not loaded')+'</p>';
      h+='<blockquote class="orr-their" translate="no">'+esc(COVER_LINE)+'</blockquote>';
      h+='<p class="orr-ours"><b>In plain words.</b> '+esc(OURS.sun.line)+'<span class="orr-stamp">our words · written '+day(OURS_DATE)+' · the quote is the paper\'s own cover line</span></p>';
      h+='<div class="orr-links"><a class="pill ghost" href="'+PDF+'">The PDF</a><a class="pill ghost" href="#updates">Every recorded change</a><a class="pill ghost" href="#explained">Explained, at length</a></div>';
      panel.innerHTML=h;bind();return;}
    var x=S[sel],o=OURS[x.n]||{},changedAfter=!!(x.changed&&String(x.changed).slice(0,10)>OURS_DATE);
    h+='<div class="orr-ph'+(x.changed?' changed':'')+'"><span class="orr-n">'+esc(x.n)+'</span><h2>'+esc(x.title)+'</h2><div class="orr-nav"><button type="button" class="x" id="orr-pprev" aria-label="Previous section">‹</button><button type="button" class="x" id="orr-pnext" aria-label="Next section">›</button><button type="button" class="x" id="orr-close" aria-label="Close">×</button></div></div>';
    h+='<p class="orr-meta">'+x.count+' sentences'+(x.words?' · '+x.words.toLocaleString('en-US')+' words':'')+' · '+(x.changed?'<span class="chg">changed '+day(x.changed)+': +'+x.added+' −'+x.removed+'</span>':d.first?'unchanged since '+day(d.first):'')+'</p>';
    if(x.sents[0])h+='<blockquote class="orr-their" translate="no">'+esc(x.sents[0].t)+'</blockquote>';
    if(o.line)h+='<p class="orr-ours"><b>In plain words.</b> '+esc(o.line)+'<span class="orr-stamp">our words · written '+day(OURS_DATE)+(x.sents[0]?' · the quote above is the section\'s own first sentence':'')+'</span></p>';
    if(changedAfter)h+='<p class="orr-warn">This section changed on '+day(x.changed)+', after the summary above was written. Until it is re-read, trust the sentences below, not the summary.</p>';
    var diff=x.changed?safe('diffs/'+String(x.changed)+'.diff'):'';
    h+='<div class="orr-links">'+(o.topic&&TOPICS[o.topic]?'<a class="pill ghost" href="#'+o.topic+'">On this page: '+TOPICS[o.topic]+'</a>':'')+'<a class="pill ghost" href="'+PDF+'">The PDF</a>'+(diff?'<a class="pill ghost" href="'+GH+diff+'">The diff</a>':'')+'</div>';
    var list=x.sents.map(function(se,i){return {t:se.t,s:se.s,i:i}});
    if(filter)list=list.filter(function(y){return x.hits&&x.hits.indexOf(y.i)>=0});
    h+='<h3>'+(filter?'Sentences with \u201c'+esc(word)+'\u201d':'Every sentence')+' <span>('+list.length+')</span></h3>';
    if(!list.length)h+='<p class="orr-meta">'+(data?'none':'the sentences did not load; open the PDF above')+'</p>';
    h+='<ol class="orr-sents" translate="no">'+list.map(function(y,k){var isNew=!!(data&&y.s!==data.first),more=k>=6&&!filter;return '<li data-i="'+y.i+'" class="'+(isNew?'new ':'')+(filter?'hit ':'')+(more?'more':'')+'"'+(more?' hidden':'')+'>'+hl(y.t)+(isNew?'<span class="d">added '+day(y.s)+'</span>':'')+'</li>'}).join('')+'</ol>';
    if(list.length>6&&!filter)h+='<button type="button" class="orr-more" id="orr-more">Show all '+list.length+'</button>';
    if(filter)h+='<button type="button" class="orr-more" id="orr-unfilter">Show every sentence</button>';
    if(x.ghosts.length&&!filter)h+='<h3>No longer in the paper <span>('+x.ghosts.length+')</span></h3><ol class="orr-sents" translate="no">'+x.ghosts.map(function(g){return '<li class="ghost">'+esc(g.t)+(g.gone?'<span class="d">until '+day(g.gone)+'</span>':'')+'</li>'}).join('')+'</ol>';
    panel.innerHTML=h;bind();}
  function expandAll(){panel.querySelectorAll('li.more').forEach(function(li){li.hidden=false;li.classList.remove('more')});var m=$('orr-more');if(m)m.remove();}
  function bind(){var c=$('orr-close');if(c)c.addEventListener('click',function(){select(-1);cur.focus();});
    var pp=$('orr-pprev');if(pp)pp.addEventListener('click',function(){step(-1)});var pn=$('orr-pnext');if(pn)pn.addEventListener('click',function(){step(1)});
    var m=$('orr-more');if(m)m.addEventListener('click',expandAll);
    var u=$('orr-unfilter');if(u)u.addEventListener('click',function(){filter=null;renderPanel();});
    panel.querySelectorAll('li[data-i]').forEach(function(li){li.addEventListener('click',function(){selSent=parseInt(li.getAttribute('data-i'),10);panel.querySelectorAll('li.picked').forEach(function(y){y.classList.remove('picked')});li.classList.add('picked');if(reduce)draw();});});}
  var qt=0;q.addEventListener('input',function(){clearTimeout(qt);qt=setTimeout(search,160);});
  q.addEventListener('keydown',function(e){if(e.key==='Escape'){q.value='';search();}});
  function search(){word=q.value.trim().toLowerCase();
    if(word.length<2){word='';S.forEach(function(x){x.hits=null});qres.innerHTML='';if(filter){filter=null;renderPanel();}if(reduce)draw();return;}
    var total=0,secs=0;S.forEach(function(x){x.hits=[];x.sents.forEach(function(se,i){if(se.t.toLowerCase().indexOf(word)>=0)x.hits.push(i)});if(x.hits.length){secs++;total+=x.hits.length;}});
    qres.innerHTML=total?'<b>'+esc(word)+'</b><span>'+total+' sentence'+(total===1?'':'s')+' in '+secs+' section'+(secs===1?'':'s')+'</span>'+S.map(function(x,i){return x.hits.length?'<button type="button" data-i="'+i+'">'+esc(x.n)+' ×'+x.hits.length+'</button>':''}).join(''):'<b>'+esc(word)+'</b><span>'+(data?'not in the whitepaper':'the sentences did not load')+'</span>';
    qres.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){filter=word;select(parseInt(b.getAttribute('data-i'),10),{keepFilter:true});});});
    if(sel>=0){filter=word;renderPanel();}if(reduce)draw();}
  function pickToday(){var all=[];S.forEach(function(x,i){x.sents.forEach(function(se,m){if(se.t.length>=40&&se.t.length<=220)all.push({i:i,m:m})})});if(!all.length){today=null;return;}
    var d=new Date(),doy=Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,0))/864e5);today=all[(doy*37+d.getUTCFullYear())%all.length];
    var x=S[today.i],se=x.sents[today.m];$('orr-today-n').textContent=(x.n==='A'?'the appendix':'section '+x.n);$('orr-today-q').textContent=se.t;$('orr-today').hidden=false;}
  $('orr-today-go').addEventListener('click',function(){if(today)pick(today.i,today.m);});
  var VK='sable-orrery-seen';
  function visitNote(d){var prevSeen=null;try{prevSeen=localStorage.getItem(VK);localStorage.setItem(VK,String(d.latest));}catch(e){}
    if(!prevSeen)return null;fresh=prevSeen<String(d.latest)?prevSeen:null;var n=0;if(fresh)S.forEach(function(x){x.sents.forEach(function(se){if(se.s>fresh)n++})});
    return n?n+' new since your visit':'unchanged since your visit';}
  (function(){var box=document.getElementById('orr-topics');if(!box)return;
    box.querySelectorAll('button[data-topic]').forEach(function(c){var tp=c.getAttribute('data-topic');
      c.addEventListener('click',function(){go(tp);});
      c.addEventListener('mouseenter',function(){hoverT=tp;litChip(tp);live.textContent=topicLine(tp);if(reduce)draw();});
      c.addEventListener('mouseleave',function(){if(hoverT===tp){hoverT=null;litChip(null);live.textContent=liveText;if(reduce)draw();}});
      c.addEventListener('focus',function(){hoverT=tp;litChip(tp);if(reduce)draw();});
      c.addEventListener('blur',function(){if(hoverT===tp){hoverT=null;litChip(null);if(reduce)draw();}});});
    function sync(){box.querySelectorAll('button[data-topic]').forEach(function(c){var b=c.querySelector('.badge');if(!b)return;var st=/\bwarn\b/.test(b.className)?'warn':/\bok\b/.test(b.className)?'ok':'';var tx=b.textContent.trim();if(c.getAttribute('data-state')!==st)c.setAttribute('data-state',st);if((c.getAttribute('title')||'')!==tx)c.setAttribute('title',tx);});}
    new MutationObserver(sync).observe(box,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});sync();})();
  function loop(ts){raf=0;if(!inview||document.hidden)return;if(ts-last>=33){last=ts;frames++;draw();}raf=requestAnimationFrame(loop);}
  function start(){if(reduce){draw();return;}if(!raf)raf=requestAnimationFrame(loop);}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){inview=es[0].isIntersecting;if(inview)start();},{threshold:0.05}).observe(stage);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)start();});
  if('ResizeObserver' in window)new ResizeObserver(function(){size();if(reduce)draw();}).observe(stage);else window.addEventListener('resize',function(){size();if(reduce)draw();});
  build(FALLBACK.map(function(f){return {n:f[0],title:f[1],count:f[2]}}));size();renderCtl();start();
  var URL_=(window.SABLE_EXT||{}).whitepaper||'https://raw.githubusercontent.com/CryptoWesAI/sable-whitepaper-watch/main/whitepaper.json';
  fetch(URL_,{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(d){
    if(!d||!Array.isArray(d.sections)||!d.sections.length)return Promise.reject('empty');
    data=d;build(d.sections);ready=true;visit=visitNote(d);pickToday();
    var chg=S.filter(function(x){return x.changed}),lastChg=chg.length?chg.map(function(x){return x.changed}).sort().pop():null;
    setLive((wide()?String(d.cover||'').split(',')[0]+' · ':'')+d.sentence_count+' sentences · '+(lastChg?'changed '+day(lastChg,true)+' · '+chg.filter(function(x){return x.changed===lastChg}).map(function(x){return x.n}).join(', '):'no change since '+day(d.first,true)));
    renderCtl();if(sel!==-1)renderPanel();if(word)search();if(reduce)draw();
  }).catch(function(){hud.classList.add('off');setLive('the record did not answer · the map is drawn without its sentences');});
  window.SABLE_ORRERY={ready:function(){return ready},sections:function(){return S.map(function(x){return {n:x.n,title:x.title,count:x.count,changed:x.changed,added:x.added}})},select:function(i){select(i,{quiet:true})},selected:function(){return sel},pos:function(i){var p=pos(S[i],clock());return {x:p.x,y:p.y}},frames:function(){return frames},today:function(){return today},marker:function(tp){var m=markPos(MARKS.indexOf(tp));return {x:m.x,y:m.y}},visit:function(){return visit},search:function(w){q.value=w||'';search();},data:function(){return data}};
})();

/* block 7 */
/* Gatekeeper: the 3D client loads only when Play is pressed; the leaderboard
   table needs no 3D and reads the board service on this site's own origin. */
(function(){
  var play=document.getElementById('game-play'),demo=document.getElementById('game-demo'),again=document.getElementById('game-again'),form=document.getElementById('ge-form'),tabs=[].slice.call(document.querySelectorAll('.gb-tabs button')),tbl=document.getElementById('gb-table');
  if(!play||!tbl)return;
  var BOARD=(window.SABLE_EXT||{}).board||'/api/game';
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var myName='';try{myName=(localStorage.getItem('sable-game-name')||'').toLowerCase();}catch(e){}
  function load(period){period=period||'today';tabs.forEach(function(b){b.classList.toggle('on',b.getAttribute('data-period')===period)});
    return fetch(BOARD+'/top?period='+period,{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(j){var rows=j.rows||[];
      tbl.querySelector('tbody').innerHTML=rows.length?rows.map(function(r,i){var cls=[myName&&String(r.name).toLowerCase()===myName?'me':'',i<3?'p'+(i+1):''].join(' ').trim();return '<tr'+(cls?' class="'+cls+'"':'')+'><td class="n">'+(i<3?'<span class="rk">'+(i+1)+'</span>':(i+1))+'</td><td class="nm" translate="no">'+esc(r.name)+(r.handle?' <a href="https://x.com/'+esc(r.handle)+'">@'+esc(r.handle)+'</a>':'')+(i===0?'<span class="mote"></span><span class="mote"></span><span class="mote"></span>':'')+'</td><td class="s">'+Number(r.score).toLocaleString('en-US')+'</td><td class="n">'+esc(r.wave)+'</td><td class="n gb-day">'+esc(r.day)+'</td></tr>'}).join(''):'<tr><td colspan="5">'+(period==='today'?'nobody has played today yet':period==='contest'?'no contest runs yet. A run needs an X handle to count here.':'no scores yet')+'</td></tr>';
    }).catch(function(){tbl.querySelector('tbody').innerHTML='<tr><td colspan="5">the board did not answer</td></tr>';});}
  tabs.forEach(function(b){b.addEventListener('click',function(){load(b.getAttribute('data-period'))})});
  var loaded=false;function ensureBoard(){if(loaded)return;loaded=true;load('today');loadContest();}
  /* the contest, when the board has a window: a strip with the countdown, a tab, and the handle field marked as needed */
  var contestEl=document.getElementById('contest'),contestTab=tabs.filter(function(b){return b.getAttribute('data-period')==='contest'})[0],contest=null,contestTimer=null;
  function fmtDay(iso){var d=new Date(iso+'T00:00:00Z');return d.getUTCDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()];}
  function left(ms){var m=Math.max(0,Math.round(ms/60000)),d=Math.floor(m/1440),h=Math.floor(m%1440/60),mm=m%60;return d?d+' d '+h+' h':h?h+' h '+mm+' min':mm+' min';}
  function drawContest(){if(!contest||!contestEl)return;var now=Date.now(),start=Date.parse(contest.start+'T00:00:00Z'),end=Date.parse(contest.end+'T23:59:59Z');
    var st=now<start?'starts in '+left(start-now):now>end?'over':'ends in '+left(end-now);
    contestEl.innerHTML='<b>Contest</b><span>'+esc(fmtDay(contest.start)+' to '+fmtDay(contest.end))+' UTC</span><span class="cd">'+esc(st)+'</span><span class="rule">highest single run wins · your X handle on the run · post your card and tag @Sablenetwork</span>'+(now>end?'<a href="winner.html">the winner</a>':'<a href="#play" data-tab="contest">standings</a>')+'<a href="#play" data-daily>today\'s card</a>';
    contestEl.hidden=false;if(contestTab)contestTab.hidden=false;
    var hf=document.getElementById('gs-handle'),lab=hf&&hf.parentNode?hf.parentNode.querySelector('span'):null;if(lab)lab.textContent=now>=start&&now<=end?'X handle, needed for the contest':'X handle, optional';}
  var contestAsked=false;
  function loadContest(){if(contestAsked)return;contestAsked=true;fetch(BOARD+'/contest',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){contest=j&&j.contest;if(contest){drawContest();if(!contestTimer)contestTimer=setInterval(drawContest,60000);}}).catch(function(){});}
  var daily=document.getElementById('daily');
  function openDaily(){if(!contest||!daily)return;daily.hidden=false;var els={share:document.getElementById('daily-share'),save:document.getElementById('daily-save'),x:document.getElementById('daily-x')};
    import('./game/daily.js').then(function(m){return m.open({board:BOARD,contest:contest,canvas:document.getElementById('daily-cv'),els:els});}).then(function(d){window.__daily=d;}).catch(function(e){daily.hidden=true;});}
  if(contestEl)contestEl.addEventListener('click',function(e){var a=e.target.closest('a[data-tab]');if(a){e.preventDefault();ensureBoard();load('contest');tbl.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
    var b=e.target.closest('a[data-daily]');if(b){e.preventDefault();openDaily();}});
  var dailyClose=document.getElementById('daily-close');if(dailyClose)dailyClose.addEventListener('click',function(){daily.hidden=true;});
  if(location.protocol!=='file:')loadContest();
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){if(es[0].isIntersecting)ensureBoard();},{threshold:0.05}).observe(tbl);else ensureBoard();
  function run(opts){play.disabled=true;demo.disabled=true;document.getElementById('game-fine').textContent='loading the 3D library…';
    return import('./game/game.js').then(function(m){return m.start(Object.assign({board:BOARD},opts||{}))}).then(function(){play.disabled=false;demo.disabled=false;document.getElementById('game-fine').textContent='Loads a 3D library from jsdelivr when you press Play. Nothing you do here is sent to Sable.';})
      .catch(function(e){play.disabled=false;demo.disabled=false;document.getElementById('game-fine').textContent='The game could not load here ('+(e&&e.message?e.message:'unknown')+'). On the live site it loads from jsdelivr.';});}
  var gsName=document.getElementById('gs-name'),gsHandle=document.getElementById('gs-handle');
  try{gsName.value=localStorage.getItem('sable-game-name')||'';gsHandle.value=localStorage.getItem('sable-game-handle')||'';}catch(e){}
  play.addEventListener('click',function(){var name=gsName.value.trim(),handle=gsHandle.value.trim();try{localStorage.setItem('sable-game-name',name);localStorage.setItem('sable-game-handle',handle);}catch(e){}if(name)myName=name.toLowerCase();run({name:name,handle:handle})});
  demo.addEventListener('click',function(){run({demo:true})});
  again.addEventListener('click',function(){document.getElementById('game-end').hidden=true;document.getElementById('game-start').hidden=false;});
  form.addEventListener('submit',function(e){e.preventDefault();var R=window.SABLE_GAME_RUN;if(!R)return;var name=document.getElementById('ge-name').value.trim(),handle=document.getElementById('ge-handle').value.trim(),out=document.getElementById('ge-result'),btn=document.getElementById('ge-submit');
    btn.disabled=true;out.className='ge-result';out.textContent='sending…';
    R.submit(name,handle).then(function(j){if(j&&j.ok){out.textContent='On the board: #'+j.rank_today+' today, #'+j.rank_all+' all time.'+(j.flagged?' Flagged for a look before it counts in the contest: every tap landed at the same distance, or nothing slipped in a long shift.':'');myName=name.toLowerCase();load('today');}
      else{out.className='ge-result err';out.textContent=j&&j.error==='name'?'That name is not allowed: 3 to 20 letters, digits, spaces, _ . -':j&&j.error==='handle'?'That handle does not look like an X handle.':j&&j.error==='already submitted'?'This run is already on the board.':j&&j.error==='replay'?'The board could not replay this run, so it was not accepted.':'Not accepted: '+(j&&j.error||'unknown');btn.disabled=false;}});});
  document.addEventListener('sable-game-submitted',function(e){var j=e.detail||{};var out=document.getElementById('ge-result');if(j.ok){out.className='ge-result';out.textContent='On the board as '+j.name+': #'+j.rank_today+' today, #'+j.rank_all+' all time.'+(j.flagged?' Flagged for a look before it counts in the contest: every tap landed at the same distance, or nothing slipped in a long shift.':'');myName=String(j.name||'').toLowerCase();load('today');}
    else{out.className='ge-result err';out.textContent=j.error==='name'?'That name is not allowed: 3 to 20 letters, digits, spaces, _ . -':j.error==='handle'?'That handle does not look like an X handle.':j.error==='replay'?'The board could not replay this run, so it was not accepted.':'Not accepted: '+(j.error||'unknown');}});
  window.SABLE_GAME={run:run,load:load,board:BOARD};
})();

/* block 8 */
/* The sky. A static starfield drawn once; a shooting star every few seconds
   that animates only while it is in flight; and a drifter, Sable's robot or
   its moon mark, floating past behind the glass now and then. Everything
   stops when the tab is hidden and when the visitor prefers reduced motion. */
(function(){
  var c=document.getElementById('stars');if(!c||!c.getContext)return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx=c.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),stars=[],base=document.createElement('canvas'),bctx=base.getContext('2d'),W=0,H=0;
  function seed(){stars=[];var n=Math.round((window.innerWidth*window.innerHeight)/9000);
    for(var i=0;i<n;i++)stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.3+.3,a:Math.random()*.55+.15,c:Math.random()<.18?'24,191,255':'232,242,248'});}
  function draw(){W=window.innerWidth;H=window.innerHeight;c.width=base.width=W*dpr;c.height=base.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';
    bctx.setTransform(dpr,0,0,dpr,0,0);bctx.clearRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){var s=stars[i];bctx.beginPath();bctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);bctx.fillStyle='rgba('+s.c+','+s.a+')';bctx.fill();}
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(base,0,0);}
  seed();draw();
  var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(function(){seed();draw();},150);});
  /* shooting stars */
  var flying=false;
  function shoot(){if(flying||reduce||document.hidden)return;flying=true;
    var x0=W*(0.05+Math.random()*0.7),y0=H*(0.02+Math.random()*0.35),ang=(22+Math.random()*20)*Math.PI/180,len=160+Math.random()*180,dur=650+Math.random()*450,t0=performance.now();
    var dx=Math.cos(ang),dy=Math.sin(ang),travel=len*2.2;
    function frame(now){var p=Math.min(1,(now-t0)/dur);ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(base,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
      var hx=x0+dx*travel*p,hy=y0+dy*travel*p,tail=len*(p<0.5?p*2:1)*(1-p*0.4),fade=p<0.15?p/0.15:p>0.7?(1-p)/0.3:1;
      var g=ctx.createLinearGradient(hx-dx*tail,hy-dy*tail,hx,hy);g.addColorStop(0,'rgba(114,220,255,0)');g.addColorStop(1,'rgba(232,242,248,'+(0.9*fade)+')');
      ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx-dx*tail,hy-dy*tail);ctx.lineTo(hx,hy);ctx.stroke();
      ctx.beginPath();ctx.arc(hx,hy,1.8,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+fade+')';ctx.fill();
      if(p<1)requestAnimationFrame(frame);else{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(base,0,0);flying=false;}}
    requestAnimationFrame(frame);}
  function scheduleShoot(){setTimeout(function(){shoot();scheduleShoot();},5000+Math.random()*9000);}
  if(!reduce)scheduleShoot();
  /* the drifter */
  var img=document.getElementById('drifter'),drifting=false;
  /* The build step writes the file name here: robot.png when that file sits
     next to the page, otherwise Sable's moon mark. No probing, no 404s. */
  var DRIFTER='robot.png';
  function pick(){if(!DRIFTER||DRIFTER.indexOf('__')===0){img=null;return;}img.src=DRIFTER;}
  function drift(){if(drifting||reduce||document.hidden||!img.src||!img.animate)return;drifting=true;
    var w=img.getBoundingClientRect().width||140,fromLeft=Math.random()<0.5,y=H*(0.12+Math.random()*0.6),dur=20000+Math.random()*9000,x0=fromLeft?-w-20:W+20,x1=fromLeft?W+20:-w-20,amp=14+Math.random()*12,rot=(Math.random()<0.5?-1:1)*(4+Math.random()*4);
    var frames=[];for(var i=0;i<=16;i++){var p=i/16;frames.push({transform:'translate('+(x0+(x1-x0)*p)+'px,'+(y+Math.sin(p*Math.PI*3)*amp)+'px) rotate('+(rot*Math.sin(p*Math.PI*2))+'deg)',opacity:p<0.08?p/0.08*0.55:p>0.9?(1-p)/0.1*0.55:0.55});}
    img.hidden=false;var a=img.animate(frames,{duration:dur,easing:'linear'});a.onfinish=a.oncancel=function(){img.hidden=true;drifting=false;};}
  function scheduleDrift(){setTimeout(function(){drift();scheduleDrift();},18000+Math.random()*22000);}
  if(img&&!reduce){pick();setTimeout(drift,6000);scheduleDrift();}
  document.addEventListener('visibilitychange',function(){if(document.hidden&&img){var an=img.getAnimations?img.getAnimations():[];an.forEach(function(a){a.cancel();});}});
  window.SABLE_SKY={shoot:shoot,drift:drift};
})();

/* block 9 */
(function(){
  var $=function(id){return document.getElementById(id)};
  if(!$('send')||!window.crypto||!crypto.subtle){return;}
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RIN=2,ROUT=10; /* micro-dollars per token: sable-fast list price read from GET /v1/models on 4 Sep 2026 ($2 in, $10 out per million). Refreshed live below when the proxy is reachable. */
  var MAXOUT=400;    /* declared max completion, what the worst-case hold is computed from */
  var cap=0.05,bal=0.05,ctx=0,records=[],key=null,looping=null,busy=false;
  fetch('/sable-api/models',{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject()}).then(function(m){var f=(m.data||[]).filter(function(x){return x.id==='sable-fast'})[0];if(f&&f.prompt_usd_per_mtok&&f.completion_usd_per_mtok){RIN=f.prompt_usd_per_mtok;ROUT=f.completion_usd_per_mtok;var l=$('ratelbl');if(l)l.textContent='Sable’s live list price for sable-fast: $'+RIN+' in, $'+ROUT+' out per million tokens';}}).catch(function(){});
  var el={prompt:$('prompt'),cap:$('cap'),capval:$('capval'),fill:$('balfill'),hold:$('balhold'),baltxt:$('baltxt'),send:$('send'),loop:$('loop'),reset:$('reset'),refused:$('refused'),loopcount:$('loopcount'),s:[$('s1'),$('s2'),$('s3'),$('s4')],cipher:$('cipher'),holdtxt:$('holdtxt'),frame:$('frame'),receipt:$('receipt'),rwait:$('rwait'),kept:$('kept'),never:$('never'),search:$('search'),searchres:$('searchres')};
  function fmt(u){return '$'+u.toFixed(3)}
  function n(x){return x.toLocaleString('en-US')}
  function money(){el.baltxt.textContent=fmt(bal)+' of '+fmt(cap)+' left · '+records.length+' request'+(records.length===1?'':'s')+' · context '+n(ctx)+' tokens';el.fill.style.width=Math.max(0,bal/cap*100)+'%';}
  function wait(ms){return new Promise(function(r){setTimeout(r,reduce?0:ms)})}
  function hex(k){var s='';for(var i=0;i<k;i++)s+=(Math.random()*16|0).toString(16);return s}
  function b64(buf){var b='',a=new Uint8Array(buf);for(var i=0;i<a.length;i++)b+=String.fromCharCode(a[i]);return btoa(b)}
  function esc(s){return s.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function sha256(str){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)).then(function(h){return Array.from(new Uint8Array(h)).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')})}
  function sealed(len){return 'AES-256-GCM · nonce '+hex(24)+' · '+hex(Math.min(len*2,160))+(len*2>160?'…':'')}
  function scramble(node,text,fast){
    if(reduce){node.textContent=sealed(text.length);return Promise.resolve();}
    return new Promise(function(res){var i=0,len=text.length,steps=fast?6:Math.max(8,Math.min(22,Math.round(len/4)));
      var t=setInterval(function(){i++;var k=Math.floor(len*i/steps),out='';for(var j=0;j<len;j++){out+= j<k?(Math.random()*16|0).toString(16):text[j];}node.textContent=out;
        if(i>=steps){clearInterval(t);node.textContent=sealed(len);res();}},fast?30:45);});}
  function setStep(i,cls){el.s.forEach(function(li,j){li.classList.remove('on');if(j===i){li.classList.remove('bad');li.classList.add(cls||'on');}});}
  function clearSteps(){el.s.forEach(function(li){li.className='';});el.cipher.textContent='waiting';el.holdtxt.textContent='waiting';el.frame.className='mono frame';el.frame.textContent='waiting';el.receipt.hidden=true;el.rwait.hidden=false;el.rwait.textContent='waiting';el.refused.hidden=true;}
  function resetAll(){if(looping){clearInterval(looping);looping=null;el.loop.textContent='Let it loop';}bal=cap;ctx=0;records=[];busy=false;el.send.disabled=false;el.hold.style.width='0';clearSteps();el.kept.textContent='nothing yet';el.never.textContent='nothing yet';el.search.disabled=true;el.searchres.textContent='';el.loopcount.textContent='';money();}
  function ensureKey(){if(key)return Promise.resolve(key);return crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']).then(function(k){key=k;return k});}
  function send(fast){
    if(busy)return Promise.resolve(null);busy=true;el.send.disabled=true;
    var text=el.prompt.value.trim()||'(empty prompt)';var tin=Math.ceil(text.length/4)+ctx;var worst=tin*RIN+MAXOUT*ROUT;var capU=Math.round(cap*1e6);
    clearSteps();
    return ensureKey().then(function(){setStep(0);return scramble(el.cipher,text,fast);}).then(function(){return sha256(text);}).then(function(fp){
      el.s[0].classList.add('done');setStep(1);var balU=Math.round(bal*1e6);
      if(worst>balU){el.holdtxt.textContent='needs a hold of '+n(worst)+' µ$ for the worst case · only '+n(balU)+' µ$ spendable';setStep(1,'bad');el.refused.hidden=false;el.hold.style.width='0';busy=false;el.send.disabled=false;return false;}
      el.holdtxt.textContent='hold '+n(worst)+' µ$ placed before any call (context '+n(tin)+' × '+RIN+' + max '+MAXOUT+' out × '+ROUT+' µ$)';
      el.hold.style.left=Math.max(0,(balU-worst)/capU*100)+'%';el.hold.style.width=Math.min(100,worst/capU*100)+'%';
      return wait(fast?140:650).then(function(){el.s[1].classList.add('done');setStep(2);el.frame.className='mono frame open';el.frame.textContent=text;return wait(fast?140:750);}).then(function(){
        el.frame.className='mono frame gone';el.frame.textContent='gone. decrypted once for the call, never logged, never persisted.';el.s[2].classList.add('done');setStep(3);
        var tout=60+Math.floor(Math.random()*120);var cost=tin*RIN+tout*ROUT;bal=Math.max(0,bal-cost/1e6);ctx=tin+tout;el.hold.style.width='0';money();
        var rec={v:1,request_id:hex(12),content_fingerprint:fp.slice(0,16)+'…',model:'sable-fast',privacy_tier:'standard',prompt_tokens:tin,completion_tokens:tout,total_tokens:tin+tout,cost_micro_usd:cost,logging:'metadata-only',issued_at:new Date().toISOString()};
        var json=JSON.stringify(rec),data=new TextEncoder().encode(json);
        return crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key.privateKey,data).then(function(sig){
          var s=b64(sig);el.rwait.hidden=true;el.receipt.hidden=false;
          el.receipt.innerHTML=Object.keys(rec).map(function(k){return '<span class="k">'+k+'</span>: <span class="v">'+esc(String(rec[k]))+'</span>'}).join('\n')+'<div class="sig" translate="yes"><span>sig <span class="v" translate="no">'+s.slice(0,22)+'…</span></span><button class="pill ghost" id="verify" type="button">Verify in your browser</button><span id="vres"></span></div>';
          $('verify').addEventListener('click',function(){crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key.publicKey,sig,data).then(function(ok){$('vres').innerHTML=ok?'<span class="ok">✓ valid · checked by your browser, not by Sable</span>':'✗ invalid';});});
          records.push(rec);el.s[3].classList.add('done');
          el.kept.textContent='row '+records.length+': inference · sable-fast · '+n(tin+tout)+' tokens · '+n(cost)+' µ$ · '+rec.issued_at.slice(11,19)+' UTC';
          el.never.textContent=text;el.search.disabled=false;el.searchres.textContent='';money();busy=false;el.send.disabled=false;return true;});});});}
  el.cap.addEventListener('input',function(){cap=parseFloat(el.cap.value);el.capval.textContent=fmt(cap);resetAll();});
  el.send.addEventListener('click',function(){send(false);});
  el.reset.addEventListener('click',resetAll);
  el.loop.addEventListener('click',function(){
    if(looping){clearInterval(looping);looping=null;el.loop.textContent='Let it loop';return;}
    el.loop.textContent='Stop the loop';el.loopcount.textContent='';
    looping=setInterval(function(){if(busy)return;send(true).then(function(ok){if(ok===false){clearInterval(looping);looping=null;el.loop.textContent='Let it loop';el.loopcount.textContent='The loop ran '+records.length+' time'+(records.length===1?'':'s')+' and stopped at the cap, not at your card.';}});},reduce?200:400);});
  el.search.addEventListener('click',function(){el.searchres.textContent='scanning '+records.length+' stored row'+(records.length===1?'':'s')+'…';wait(700).then(function(){el.searchres.textContent='0 rows contain your words. There is no column that could hold them.';});});
  money();
})();

/* block 10 */
(function(){
  var $=function(id){return document.getElementById(id)};
  if(!$('verify-btn'))return;
  var EMB_SIGNER='0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812',EMB_DATE='4 Sep 2026';
  var TEST={address:'0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    receipt:'eyJ2IjoxLCJyZXF1ZXN0X2lkIjoidGVzdHZlY3RvciIsImNvbnRlbnRfZmluZ2VycHJpbnQiOiJhMWIyYzNkNGU1ZjYwNzE4IiwibW9kZWwiOiJzYWJsZSIsInByaXZhY3lfdGllciI6InN0YW5kYXJkIiwicHJvbXB0X3Rva2VucyI6MzAsImNvbXBsZXRpb25fdG9rZW5zIjoxMjAsInRvdGFsX3Rva2VucyI6MTUwLCJjb3N0X21pY3JvX3VzZCI6NTQwLCJsb2dnaW5nIjoibWV0YWRhdGEtb25seSIsImlzc3VlZF9hdCI6IjIwMjYtMDktMDRUMTI6MDA6MDBaIn0',
    signature:'0x05943f4e1d17deb0140d5df971f0aad8420356d901426c686c4f598c7a97c238380b86914ddc50c6aad72a0f2efa7afa673c249b8b6b21b2aa2bbb54716e071d1b'};
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function txt(id,v){var e=$(id);if(e)e.textContent=v;}
  fetch('/sable-api/status',{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(s){
    txt('st-gw',s.status||'unknown');txt('st-24',(s.uptime_24h_pct==null?'n/a':s.uptime_24h_pct+'%'));txt('st-30',(s.uptime_30d_pct==null?'n/a':s.uptime_30d_pct+'%'));
    var c=s.confidential||{};var ok=!!c.verified;
    txt('st-conf',ok?'attested and serving':'failing closed'+(c.error_class?' · '+c.error_class:'')+(c.consecutive_failures?' · '+c.consecutive_failures+' consecutive refusals':''));
    txt('st-when','live, '+new Date().toUTCString().slice(17,25)+' UTC');
    $('status').classList.add(ok?'good':'warn');
    var note=$('st-note');note.innerHTML=(ok?'Confidential requests are being served from a verified backend.':'Confidential requests are being <b>refused, not downgraded</b> to plaintext right now. That is the fail-closed behaviour the whitepaper promises in section 08, visible in public.')+' Read from <a href="https://api.buildsable.com/v1/status">api.buildsable.com/v1/status</a> through this site’s read-only proxy. Cross-check on <a href="https://www.buildsable.com/trust">buildsable.com/trust</a>. How long it has been like this: <a href="#log">the reliability record in the Log</a>.';
  }).catch(function(){txt('st-gw','live read failed');txt('st-24','n/a');txt('st-30','n/a');txt('st-conf','unknown right now');txt('st-when',location.protocol==='file:'?'this copy of the page has no proxy to Sable':'Sable’s API did not answer this site within a few seconds. Read it directly at buildsable.com/trust.');});
  fetch('/sable-api/receipts/pubkey',{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject()}).then(function(p){$('signer').textContent=p.signer_address;txt('signer-when','live · scheme '+p.scheme);$('exp').value=p.signer_address;}).catch(function(){$('signer').textContent=EMB_SIGNER;txt('signer-when','as published on '+EMB_DATE+'. Live read failed just now; confirm at api.buildsable.com/v1/receipts/pubkey.');$('exp').value=EMB_SIGNER;});
  /* whitepaper record, read from the public repository */
  (function(){
    var RAW=(window.SABLE_EXT||{}).record||'https://raw.githubusercontent.com/CryptoWesAI/sable-whitepaper-watch/main/record.json';
    var GHBASE='https://github.com/CryptoWesAI/sable-whitepaper-watch/blob/main/';
    var list=$('wp-list');if(!list)return;
    function when(iso){return iso?String(iso).replace('T',' ').replace(/:\d\dZ$/,' UTC'):'unknown';}
    function num(v){v=Number(v);return isFinite(v)?v:0;}
    function safePath(p){p=String(p||'');return /^[A-Za-z0-9._\/-]+$/.test(p)&&p.indexOf('..')<0?p:'';}
    fetch(RAW,{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(rec){
      var es=Array.isArray(rec.entries)?rec.entries:[];var latest=es[0]||{};
      txt('wp-version',String(rec.cover||latest.cover||'unknown')+(latest.label?' · file as seen '+String(latest.label):''));
      var changes=es.filter(function(e){return !e.first});
      var lc=changes[0];
      txt('wp-last',lc?(String(lc.label)+' · '+num(lc.added)+' sentences added, '+num(lc.removed)+' removed'):'no change recorded yet');
      var last=rec.last_check||{};
      txt('wp-check',when(last.t||rec.generated_at)+(last.status?' · gateway '+String(last.status):'')+(last.conf_verified===false?' · confidential failing closed':last.conf_verified===true?' · confidential verified':''));
      list.innerHTML=es.slice(0,8).map(function(e){
        var bytes=num(e.bytes)?num(e.bytes).toLocaleString('en-US')+' bytes':'';var d=safePath(e.diff),s=safePath(e.snapshot);
        var body=e.first?'<b>first snapshot in the record</b> · <span translate="no">'+esc(e.cover||'')+'</span> · '+bytes
          :'<b>'+num(e.added)+' added, '+num(e.removed)+' removed</b> · cover still says <span translate="no">'+esc(e.cover||'?')+'</span> · '+bytes+(d?' · <a href="'+GHBASE+esc(d)+'">diff</a>':'')+(s?' · <a href="'+GHBASE+esc(s)+'">PDF</a>':'');
        return '<li><span class="d">'+esc(e.label||'')+'</span><span>'+body+'</span></li>';}).join('');
    }).catch(function(){txt('wp-version','record not readable from here');txt('wp-last','open the repository link above');txt('wp-check','');});
  })();
  /* "page changed" column, read from the public repository */
  (function(){
    var cells=[].slice.call(document.querySelectorAll('td.pc'));if(!cells.length)return;
    var PEERS=(window.SABLE_EXT||{}).peers||'https://raw.githubusercontent.com/CryptoWesAI/sable-whitepaper-watch/main/peers-record.json',GH='https://github.com/CryptoWesAI/sable-whitepaper-watch/blob/main/';
    function n(v){v=Number(v);return isFinite(v)?v:0;}
    function ok(p){p=String(p||'');return /^[A-Za-z0-9._\/-]+$/.test(p)&&p.indexOf('..')<0?p:'';}
    fetch(PEERS,{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(rec){
      cells.forEach(function(td){
        var ids=td.getAttribute('data-peer').split(',');var best=null,first=null,down=null;
        ids.forEach(function(id){var e=rec[id];if(!e||typeof e!=='object')return;if(e.ok===false)down=e;if(e.first_seen&&(!first||e.first_seen<first))first=e.first_seen;if(e.last_change&&(!best||e.last_change>best.last_change))best=e;});
        if(best){var c=(best.changes&&best.changes[0])||{};var d=ok(c.diff);td.setAttribute('data-state','changed');td.innerHTML='<span class="m half">◐</span><span class="note">'+esc(String(best.last_change).slice(0,10))+' · +'+n(c.added)+' −'+n(c.removed)+(d?' · <a href="'+GH+esc(d)+'">diff</a>':'')+'</span>';}
        else if(first){td.setAttribute('data-state','same');td.innerHTML='<span class="m on">●</span><span class="note">no change since '+esc(first.slice(0,10))+'</span>';}
        else if(down){td.setAttribute('data-state','down');td.innerHTML='<span class="m q">?</span><span class="note">unreachable at last check</span>';}
        else{td.setAttribute('data-state','unwatched');td.innerHTML='<span class="note">not watched</span>';}
      });
    }).catch(function(){cells.forEach(function(td){td.setAttribute('data-state','error');td.innerHTML='<span class="note">record not readable here</span>';});});
  })();
  /* market-cap ladder, live at load */
  (function(){
    var rows=[].slice.call(document.querySelectorAll('.ladder .row'));var stamp=$('mc-stamp');if(!rows.length||!stamp)return;
    var map={ATA:'automata',POND:'marlin',SCRT:'secret',PHA:'pha',OPG:'opengradient',NIL:'nillion',RLC:'iexec-rlc',ROSE:'oasis-network',AKT:'akash-network',VIRTUAL:'virtual-protocol',TAO:'bittensor',NEAR:'near'};
    function fmt(v){return v>=1e9?'$'+(v/1e9).toFixed(2)+'B':v>=1e6?'$'+(v/1e6).toFixed(1)+'M':'$'+Math.round(v/1e3)+'K';}
    function width(v){return Math.max(0.5,Math.min(100,(Math.log10(v)-5)/4.5*100))+'%';}
    function sym(r){var l=r.querySelector('.lab');return (l.getAttribute('data-sym')||l.firstChild.textContent||'').trim();}
    var EXT=window.SABLE_EXT||{};
    var pCG=fetch(EXT.markets,{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(list){var by={};(Array.isArray(list)?list:[]).forEach(function(c){if(c&&c.id)by[c.id]=c});return by;});
    var pDX=fetch(EXT.sabl,{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(d){var ps=(d&&d.pairs)||[];return ps.filter(function(p){return p.dexId==='pumpswap'})[0]||ps[0];});
    Promise.allSettled([pCG,pDX]).then(function(res){
      var by=res[0].status==='fulfilled'?res[0].value:null,dx=res[1].status==='fulfilled'?res[1].value:null,n=0;
      rows.forEach(function(r){var s=sym(r),val=r.querySelector('.val'),bar=r.querySelector('.bar'),v=null,small='';
        if(s==='SABL'){if(dx&&dx.marketCap){v=dx.marketCap;small='liq $'+Math.round(((dx.liquidity&&dx.liquidity.usd)||0)/1e3)+'K';}}
        else if(by&&map[s]&&by[map[s]]&&by[map[s]].market_cap){var c=by[map[s]];v=c.market_cap;var f=c.fully_diluted_valuation,ch=c.price_change_percentage_30d_in_currency;
          if(f&&f/v>1.5)small='FDV '+fmt(f);else if(typeof ch==='number'&&ch<=-50)small=Math.round(ch)+'% in 30d';}
        if(v){n++;bar.style.width=width(v);val.innerHTML=fmt(v)+(small?'<small>'+esc(small)+'</small>':'');r.classList.toggle('fade',s==='SCRT');}
      });
      stamp.setAttribute('data-live',n?'1':'0');stamp.textContent=n?('Live: '+n+' of '+rows.length+' values read '+new Date().toUTCString().slice(17,25)+' UTC from '+(by?'CoinGecko':'')+(by&&dx?' and ':'')+(dx?'DexScreener':'')+'; bars rescaled.'):'Live read failed; values as read 4 Sep 2026 16:00 UTC.';
    });
  })();
  /* reliability record, read from the public repository */
  (function(){
    var grid=$('rgrid'),facts=$('rfacts'),tbl=$('ledger-table');if(!grid||!facts||!tbl)return;
    var RAW=(window.SABLE_EXT||{}).ledger||'https://raw.githubusercontent.com/CryptoWesAI/sable-whitepaper-watch/main/status/log.jsonl';
    var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function st(r){return r.conf_verified===true?'ok':r.conf_verified===false?'warn':'off';}
    function word(x){return x==='ok'?'verified':x==='warn'?'failing closed':'unreachable';}
    function reach(r){return typeof r.status==='string'&&r.status.indexOf('unreachable')!==0;}
    function dur(ms){var m=Math.max(0,Math.round(ms/60000)),d=Math.floor(m/1440),h=Math.floor(m%1440/60),mm=m%60;return d?d+' d '+h+' h':h?h+' h '+mm+' min':mm+' min';}
    function day(ms){return new Date(ms).toISOString().slice(0,10);}
    function label(iso){var d=new Date(iso+'T00:00:00Z');return d.getUTCDate()+' '+MON[d.getUTCMonth()];}
    function pad(n){return (n<10?'0':'')+n;}
    function when(iso){return iso.replace('T',' ').replace('Z','').slice(0,16)+' UTC';}
    fetch(RAW,{cache:'no-store'}).then(function(r){return r.ok?r.text():Promise.reject(r.status)}).then(function(t){
      var rows=t.split('\n').filter(Boolean).map(function(l){try{return JSON.parse(l)}catch(e){return null}}).filter(function(r){return r&&r.t&&!isNaN(Date.parse(r.t))});
      rows.sort(function(a,b){return Date.parse(a.t)-Date.parse(b.t)});
      var n=rows.length;if(!n){facts.innerHTML='<div class="rfact"><span class="k">record</span><span class="v">no checks yet</span></div>';return;}
      var last=rows[n-1],now=Date.now(),first=rows[0];
      /* the current run: how long the latest state has held, every check in a row */
      var cur=st(last),i=n-1;while(i>0&&st(rows[i-1])===cur)i--;var since=Date.parse(rows[i].t);
      var est='';
      if(cur==='warn'&&typeof first.conf_failures==='number'&&typeof last.conf_failures==='number'&&last.conf_failures>first.conf_failures&&n>1){
        var perMin=(last.conf_failures-first.conf_failures)/((Date.parse(last.t)-Date.parse(first.t))/60000);
        if(perMin>0){var start=Date.parse(last.t)-last.conf_failures/perMin*60000;var cad=perMin>=0.8&&perMin<=1.25?'about one a minute':perMin>1.25?'about '+perMin.toFixed(1)+' a minute':'about one every '+Math.round(1/perMin)+' minutes';
          est=' Sable\'s own counter stood at '+last.conf_failures.toLocaleString('en')+' consecutive failures at the last check, '+cad+', which puts the start near '+when(new Date(start).toISOString())+'.';}}
      var okN=0,reachN=0,signers={};rows.forEach(function(r){if(st(r)==='ok')okN++;if(reach(r))reachN++;if(typeof r.signer==='string'&&r.signer.indexOf('0x')===0)signers[r.signer.toLowerCase()]=1;});
      var sigN=Object.keys(signers).length;
      var nodes=[];if(Array.isArray(last.nodes))last.nodes.forEach(function(x){var p=String(x).split(':');var id=p[0],stt=p[p.length-1];if(id==='gateway'||id==='tee')nodes.push(id==='tee'?'TEE '+stt:'gateway '+stt);});
      /* the watcher counts every non-synthetic node; today that is Sable's own house runner. The paper says no third-party machine serves traffic yet. */
      var rn=last.third_party_nodes;if(typeof rn==='number'){var same=rows.every(function(r){return r.third_party_nodes===rn});nodes.push(rn===0?'no runner node':rn===1?'1 runner node online, the house machine Sable runs itself (the whitepaper says no third-party machine serves traffic yet)':rn+' runner nodes online');if(same&&rn>0)nodes[nodes.length-1]+=', the same at every check';}
      var f1='<div class="rfact"><span class="k">'+esc(word(cur))+' for</span><span class="v '+(cur==='ok'?'ok':'warn')+'">'+esc(dur(now-since))+'</span><span class="s">every check since '+esc(when(rows[i].t))+(i===0?', the first one in the record':'')+'.'+esc(est)+'</span></div>';
      var f2='<div class="rfact"><span class="k">confidential backend verified</span><span class="v '+(okN?(okN===n?'ok':''):'warn')+'">'+okN+' of '+n+' checks</span><span class="s">'+Math.round(100*okN/n)+'% of the checks since '+esc(label(day(Date.parse(first.t))))+'. Sable reports '+esc(String(last.uptime_24h==null?'?':last.uptime_24h))+'% uptime over 24 h and '+esc(String(last.uptime_30d==null?'?':last.uptime_30d))+'% over 30 days; that figure is the gateway, not the backend.</span></div>';
      var f3='<div class="rfact"><span class="k">gateway reachable</span><span class="v '+(reachN===n?'ok':'warn')+'">'+reachN+' of '+n+' checks</span><span class="s">'+(nodes.length?'Last check: '+esc(nodes.join(' · '))+'. ':'')+(sigN===1?'Signer unchanged across all '+n+' checks.':sigN>1?'Signer changed: '+sigN+' different addresses seen.':'')+'</span></div>';
      facts.innerHTML=f1+f2+f3;
      /* day by hour, worst check wins the cell */
      var byHour={},rank={ok:1,warn:2,off:3};
      rows.forEach(function(r){var ms=Date.parse(r.t),k=day(ms)+'T'+new Date(ms).getUTCHours(),x=st(r),c=byHour[k]||(byHour[k]={rank:0,s:'',list:[]});if(rank[x]>c.rank){c.rank=rank[x];c.s=x;}c.list.push(r.t.slice(11,16)+' '+word(x));});
      var days=[];for(var ms=Date.parse(day(Date.parse(first.t))+'T00:00:00Z'),end=Date.parse(day(now)+'T00:00:00Z');ms<=end;ms+=86400000)days.push(day(ms));
      if(days.length>60)days=days.slice(-60);
      var html='<span class="rl"></span>';for(var h=0;h<24;h++)html+='<span class="rh">'+(h%6===0?pad(h):'')+'</span>';
      days.forEach(function(dd){html+='<span class="rl">'+esc(label(dd))+'</span>';for(var h=0;h<24;h++){var c=byHour[dd+'T'+h];html+='<span class="rc'+(c?' '+c.s:'')+'" title="'+esc(label(dd)+' '+pad(h)+':00 UTC'+(c?' · '+c.list.join(', '):' · no check'))+'"></span>';}});
      grid.innerHTML=html;
      var body=rows.slice(-12).reverse().map(function(r){
        var c=r.conf_verified===true?'ok':r.conf_verified===false?'warn':'';
        var conf=r.conf_verified===true?'verified':r.conf_verified===false?('failing closed'+(r.conf_error?' · '+r.conf_error:'')):String(r.conf_error||'unknown');
        var sg=(typeof r.signer==='string'&&r.signer.indexOf('0x')===0)?r.signer.slice(0,6)+'…'+r.signer.slice(-4):'?';
        return '<tr><td>'+esc((r.t||'').replace('T',' ').replace('Z',''))+'</td><td>'+esc(String(r.status||''))+'</td><td class="'+c+'">'+esc(conf)+'</td><td>'+esc(r.conf_failures==null?'':String(r.conf_failures))+'</td><td>'+esc(sg)+(r.signer_changed_from?' <b>changed</b>':'')+'</td></tr>';}).join('');
      tbl.querySelector('tbody').innerHTML=body||'<tr><td colspan="5">no rows yet</td></tr>';
    }).catch(function(){facts.innerHTML='<div class="rfact"><span class="k">record</span><span class="v">not readable from here</span><span class="s">Open the raw ledger link above.</span></div>';tbl.querySelector('tbody').innerHTML='<tr><td colspan="5">record not readable from here; open the raw ledger link above.</td></tr>';});
  })();
  var viemP=null;function viem(){if(!viemP)viemP=import('https://cdn.jsdelivr.net/npm/viem@2.56.3/+esm');return viemP;}
  function b64url(s){s=s.trim().replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var bin=atob(s);var bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new TextDecoder().decode(bytes);}
  $('test-btn').addEventListener('click',function(){$('rcpt').value=TEST.receipt;$('sig').value=TEST.signature;$('exp').value=TEST.address;$('vout').textContent='Test receipt loaded. It is signed by a throwaway key, not by Sable, so the expected signer is set to that key. Press Verify, then change one character of the receipt and press it again.';});
  $('verify-btn').addEventListener('click',function(){var out=$('vout');var rc=$('rcpt').value.trim(),sg=$('sig').value.trim(),ex=$('exp').value.trim();
    if(!rc||!sg){out.textContent='Paste a receipt and its signature first, or load the test receipt.';return;}
    var msg;try{msg=b64url(rc);}catch(e){out.textContent='The receipt is not valid base64url.';return;}
    out.textContent='loading the verifier (viem, from jsdelivr)…';
    viem().then(function(v){return v.recoverMessageAddress({message:msg,signature:sg});}).then(function(addr){
      var ok=ex&&addr.toLowerCase()===ex.toLowerCase();var pretty;try{pretty=JSON.stringify(JSON.parse(msg),null,2);}catch(e){pretty=msg;}
      out.innerHTML='<div class="'+(ok?'ok':'bad')+'">'+(ok?'✓ signature valid · recovered signer matches <span translate="no">'+esc(ex)+'</span>':'✗ recovered signer <span translate="no">'+esc(addr)+'</span> does not match the expected <span translate="no">'+esc(ex||'(none)')+'</span>')+'</div><div class="lbl" style="margin-top:12px">Decoded receipt</div><pre translate="no">'+esc(pretty)+'</pre><div class="quiet" style="margin-top:8px">Checked in this browser with viem’s recoverMessageAddress (EIP-191, secp256k1). No request went to Sable or to this site.</div>';
    }).catch(function(e){out.textContent='Could not verify: '+(e&&e.message?e.message:String(e));});});
})();
