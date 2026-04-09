const THEME_KEY = "doc-mgmt-theme";

let state = { users: [], documents: [] };

let session = {
  userId:null,
  role:null,
  id:null,
  name:null
};

let documentEditorContext={
mode:"create",
documentId:null,
ownerId:null
};

let userEditorContext={
mode:"create",
userInternalId:null
};

let localProgrammingDataset=null;

const LOCAL_FALLBACK_KEY="docu-local-fallback-v1";

let useLocalFallback=false;

let fallbackWarned=false;

function fakeEmbedding(text){

const v=new Array(64).fill(0);

for(let i=0;i<text.length;i++){

v[i%64]+=text.charCodeAt(i)/255;

}

return v;

}

function cosine(a=[],b=[]){

if(!a.length || !b.length)
return -1;

if(a.length!==b.length)
return -1;

let dot=0;
let na=0;
let nb=0;

for(let i=0;i<a.length;i++){

dot+=a[i]*b[i];

na+=a[i]*a[i];

nb+=b[i]*b[i];

}

if(!na || !nb)
return -1;

return dot/(Math.sqrt(na)*Math.sqrt(nb));

}

async function getLocalProgrammingDataset(){

if(localProgrammingDataset)
return localProgrammingDataset;

const possibleFiles=[

'data/stackoverflow_3000.json',

'data.json',

'stackoverflow_3000.json'

];

for(const file of possibleFiles){

try{

const res=await fetch(file);

if(!res.ok)
continue;

const raw=await res.json();

localProgrammingDataset=
raw
.filter(r=>Array.isArray(r.embedding))
.slice(0,3000);

if(localProgrammingDataset.length){

console.log(
"Dataset loaded:",
localProgrammingDataset.length
);

return localProgrammingDataset;

}

}
catch(e){

console.log(
"Dataset load failed:",
file
);

}

}

console.log("Dataset missing");

localProgrammingDataset=[];

return localProgrammingDataset;

}

async function localApi(path,options={}){

if(path==="/api/programming-search"){

const body=
JSON.parse(options.body || "{}");

const query=
String(body.query || "").trim();

if(!query)
throw new Error("Query required");

const dataset=
await getLocalProgrammingDataset();

if(!dataset.length){

return{

results:[],

datasetSize:0

};

}

const qv=fakeEmbedding(query);

const results=
dataset
.map(row=>{

const vec=row.embedding || [];

return{

question:row.question,

answer:row.answer,

tags:row.tags,

score:cosine(

qv,

vec.length?
vec:
fakeEmbedding(
row.question ||
row.answer ||
''
)

)

};

})
.filter(r=>r.score>=0)
.sort((a,b)=>b.score-a.score)
.slice(0,10);

return{

results,

datasetSize:dataset.length

};

}

throw new Error("Unsupported route");

}

async function api(path,options={}){

if(useLocalFallback)
return localApi(path,options);

try{

const res=
await fetch(path,options);

const text=
await res.text();

let data;

try{

data=
JSON.parse(text || "{}");

}
catch{

throw new Error(
"API returned invalid JSON"
);

}

if(!res.ok)
throw new Error(
data.error ||
"Request failed"
);

return data;

}
catch(error){

useLocalFallback=true;

if(!fallbackWarned){

fallbackWarned=true;

console.log(
"Backend unavailable using fallback"
);

}

return localApi(path,options);

}

}

function renderProgrammingResults(container,results=[]){

if(!container)
return;

container.innerHTML="";

if(!results.length){

container.innerHTML=

`<div class="rounded-xl border border-dashed p-3 text-sm">

No programming results found

</div>`;

return;

}

results.forEach((item,idx)=>{

const card=
document.createElement('div');

card.className=
'rounded-xl border p-3';

const tags=
(item.tags || [])
.slice(0,5)
.join(',');

card.innerHTML=`

<p>

#${idx+1}

Score:
${Number(item.score).toFixed(4)}

</p>

<h4>

${item.question || "Question"}

</h4>

<p>

${(item.answer||"")
.slice(0,300)}

</p>

<p>

${tags}

</p>

`;

container.appendChild(card);

});

}

async function runProgrammingSearch({
queryInput,
button,
meta,
resultsContainer
}){

const query=
String(queryInput.value || "")
.trim();

if(!query){

alert(
"Enter programming question"
);

return;

}

button.disabled=true;

const original=
button.textContent;

button.textContent=
"Searching...";

try{

const data=
await api(
'/api/programming-search',
{

method:'POST',

headers:{
'Content-Type':
'application/json'
},

body:
JSON.stringify({
query
})

}
);

if(meta){

meta.textContent=
`Dataset size:
${data.datasetSize}`;

}

renderProgrammingResults(

resultsContainer,

data.results

);

}
catch(error){

renderProgrammingResults(

resultsContainer,

[]

);

alert(

"Search failed.\n"+
"Dataset missing.\n"+
"Place stackoverflow_3000.json in data folder."

);

}
finally{

button.disabled=false;

button.textContent=
original;

}

}