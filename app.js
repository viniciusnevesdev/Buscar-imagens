const $=(selector,root=document)=>root.querySelector(selector);
const status=$('#status');
const historyWrap=$('#historyWrap');
let cseReady=false;
let pendingQuery='';

const setStatus=(message='')=>status.textContent=message;
const saved=(key,fallback)=>JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));
const store=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const searchUrl=query=>'https://www.google.com/search?tbm=isch&q='+encodeURIComponent(query);

function drawHistory(){
  const items=saved('image-history',[]);
  const holder=$('#history');
  holder.innerHTML='';
  historyWrap.classList.toggle('hidden',!items.length);
  items.forEach(query=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='chip';
    button.textContent=query;
    button.onclick=()=>{ $('#query').value=query; runSearch(query); };
    holder.append(button);
  });
}
function remember(query){
  const history=saved('image-history',[]).filter(item=>item!==query);
  history.unshift(query);
  store('image-history',history.slice(0,8));
  drawHistory();
}
function runSearch(query){
  if(!cseReady){
    pendingQuery=query;
    setStatus('Aguarde um instante: preparando a busca do Google…');
    return;
  }
  const element=window.google?.search?.cse?.element?.getElement('pwaImages');
  if(!element){
    setStatus('A busca do Google ainda está carregando. Tente novamente em alguns segundos.');
    return;
  }
  remember(query);
  setStatus('');
  element.execute(query);
}
window.addEventListener('pwa-cse-ready',()=>{
  cseReady=true;
  setStatus('');
  if(pendingQuery){const query=pendingQuery;pendingQuery='';runSearch(query);}
});
$('#searchForm').addEventListener('submit',event=>{
  event.preventDefault();
  const query=$('#query').value.trim();
  if(query)runSearch(query);
});
$('#openGoogle').onclick=()=>{
  const query=$('#query').value.trim();
  if(!query){setStatus('Digite uma busca primeiro.');$('#query').focus();return;}
  window.open(searchUrl(query),'_blank','noopener');
};
$('#helpButton').onclick=()=>$('#helpDialog').showModal();
$('#closeHelp').onclick=()=>$('#helpDialog').close();
drawHistory();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js');