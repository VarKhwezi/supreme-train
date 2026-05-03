import { useState, useMemo, useCallback, useRef, useEffect } from "react";

/* ═══════ RETAILERS ═══════ */
const RETAILERS = {
  evetech: { name: "Evetech", url: "https://www.evetech.co.za", color: "#e63946", search: "https://www.evetech.co.za/search?query=" },
  wootware: { name: "Wootware", url: "https://www.wootware.co.za", color: "#2a9d8f", search: "https://www.wootware.co.za/catalogsearch/result/?q=" },
  dreamware: { name: "Dreamware", url: "https://dreamwaretech.co.za", color: "#8338ec", search: "https://dreamwaretech.co.za/?s=" },
  titanice: { name: "Titan Ice", url: "https://www.titanice.co.za", color: "#0077b6", search: "https://www.titanice.co.za/search?q=" },
};
const shopUrl = (r, q) => RETAILERS[r].search + encodeURIComponent(q);

/* ═══════ PARTS (ZAR incl VAT) ═══════ */
const PARTS = [
  { id:"cpu", label:"Processor", icon:"⚙", picks:[
    {id:"r3-4100",name:"AMD Ryzen 3 4100",price:1499,note:"4C/8T · 3.8GHz · entry",socket:"AM4",plat:"AM4",tags:"amd ryzen budget",tdp:65},
    {id:"r5-5500",name:"AMD Ryzen 5 5500",price:2199,note:"6C/12T · 3.6GHz · solid budget",socket:"AM4",plat:"AM4",tags:"amd ryzen",tdp:65},
    {id:"r5-5600",name:"AMD Ryzen 5 5600",price:2499,note:"6C/12T · 3.5GHz · great value",socket:"AM4",plat:"AM4",tags:"amd ryzen popular",tdp:65},
    {id:"r5-5600x",name:"AMD Ryzen 5 5600X",price:2999,note:"6C/12T · 3.7GHz · legend",socket:"AM4",plat:"AM4",tags:"amd ryzen popular gaming",tdp:65},
    {id:"r7-5700x",name:"AMD Ryzen 7 5700X",price:3599,note:"8C/16T · 3.4GHz · workhorse",socket:"AM4",plat:"AM4",tags:"amd ryzen 8core",tdp:65},
    {id:"r7-5800x",name:"AMD Ryzen 7 5800X",price:3999,note:"8C/16T · 3.8GHz · powerful",socket:"AM4",plat:"AM4",tags:"amd ryzen 8core",tdp:105},
    {id:"r7-5800x3d",name:"AMD Ryzen 7 5800X3D",price:4999,note:"8C/16T · 3D V-Cache gaming king",socket:"AM4",plat:"AM4",tags:"amd ryzen gaming 3d vcache best",tdp:105},
    {id:"r9-5900x",name:"AMD Ryzen 9 5900X",price:5999,note:"12C/24T · 3.7GHz · creator",socket:"AM4",plat:"AM4",tags:"amd ryzen 12core creator",tdp:105},
    {id:"r5-7600",name:"AMD Ryzen 5 7600",price:3799,note:"6C/12T · 3.8GHz · AM5 budget",socket:"AM5",plat:"AM5",tags:"amd ryzen ddr5 budget",tdp:65},
    {id:"r5-7600x",name:"AMD Ryzen 5 7600X",price:4299,note:"6C/12T · 4.7GHz · new gen",socket:"AM5",plat:"AM5",tags:"amd ryzen ddr5",tdp:105},
    {id:"r7-7700x",name:"AMD Ryzen 7 7700X",price:5499,note:"8C/16T · 4.5GHz · all-rounder",socket:"AM5",plat:"AM5",tags:"amd ryzen ddr5",tdp:105},
    {id:"r7-7800x3d",name:"AMD Ryzen 7 7800X3D",price:6999,note:"8C/16T · 3D V-Cache beast",socket:"AM5",plat:"AM5",tags:"amd ryzen gaming 3d vcache best ddr5",tdp:120},
    {id:"r9-7900x",name:"AMD Ryzen 9 7900X",price:8499,note:"12C/24T · 4.7GHz · creator",socket:"AM5",plat:"AM5",tags:"amd ryzen creator ddr5",tdp:170},
    {id:"r9-7950x",name:"AMD Ryzen 9 7950X",price:11499,note:"16C/32T · 4.5GHz · top tier",socket:"AM5",plat:"AM5",tags:"amd ryzen creator flagship ddr5",tdp:170},
    {id:"i3-12100f",name:"Intel Core i3-12100F",price:1899,note:"4C/8T · 3.3GHz · budget entry",socket:"LGA1700",plat:"Intel 12th",tags:"intel 12th gen budget alder lake",tdp:58},
    {id:"i5-12400f",name:"Intel Core i5-12400F",price:2999,note:"6C/12T · 2.5GHz · budget king",socket:"LGA1700",plat:"Intel 12th",tags:"intel 12th gen popular alder lake",tdp:65},
    {id:"i5-12600k",name:"Intel Core i5-12600K",price:4499,note:"10C/16T · 3.7GHz · OC capable",socket:"LGA1700",plat:"Intel 12th",tags:"intel 12th gen overclockable alder lake",tdp:125},
    {id:"i7-12700k",name:"Intel Core i7-12700K",price:5999,note:"12C/20T · 3.6GHz · power user",socket:"LGA1700",plat:"Intel 12th",tags:"intel 12th gen alder lake",tdp:125},
    {id:"i5-13400f",name:"Intel Core i5-13400F",price:3499,note:"10C/16T · 2.5GHz · value pick",socket:"LGA1700",plat:"Intel 13th",tags:"intel 13th gen raptor lake",tdp:65},
    {id:"i5-14600k",name:"Intel Core i5-14600K",price:5499,note:"14C/20T · 3.5GHz · excellent",socket:"LGA1700",plat:"Intel 14th",tags:"intel 14th gen popular",tdp:125},
    {id:"i7-14700k",name:"Intel Core i7-14700K",price:7499,note:"20C/28T · 3.4GHz · workstation",socket:"LGA1700",plat:"Intel 14th",tags:"intel 14th gen",tdp:125},
    {id:"i9-14900k",name:"Intel Core i9-14900K",price:10999,note:"24C/32T · 3.2GHz · flagship",socket:"LGA1700",plat:"Intel 14th",tags:"intel 14th gen flagship",tdp:125},
  ]},
  { id:"gpu", label:"Graphics Card", icon:"▦", picks:[
    {id:"rx6600",name:"AMD Radeon RX 6600",price:3999,note:"8GB · 1080p budget champ",watt:132,tags:"amd radeon budget 1080p"},
    {id:"rx6650xt",name:"AMD Radeon RX 6650 XT",price:4499,note:"8GB · solid 1080p",watt:180,tags:"amd radeon 1080p"},
    {id:"rtx3060",name:"NVIDIA RTX 3060",price:5499,note:"12GB · still very capable",watt:170,tags:"nvidia rtx 3000 1080p popular"},
    {id:"rx6700xt",name:"AMD Radeon RX 6700 XT",price:5999,note:"12GB · 1080p/1440p",watt:230,tags:"amd radeon 1440p"},
    {id:"rtx4060",name:"NVIDIA RTX 4060",price:6499,note:"8GB · DLSS3 · efficient",watt:115,tags:"nvidia rtx 4000 1080p popular dlss"},
    {id:"arc770",name:"Intel Arc A770",price:5999,note:"16GB · great VRAM value",watt:225,tags:"intel arc 1080p 1440p"},
    {id:"rtx4060ti",name:"NVIDIA RTX 4060 Ti",price:8499,note:"8GB · 1080p ultra king",watt:160,tags:"nvidia rtx 4000 1080p"},
    {id:"rx7700xt",name:"AMD RX 7700 XT",price:8999,note:"12GB · 1440p sweet spot",watt:245,tags:"amd radeon 1440p popular"},
    {id:"rx7800xt",name:"AMD RX 7800 XT",price:9999,note:"16GB · incredible value",watt:263,tags:"amd radeon 1440p 16gb popular"},
    {id:"rtx4070s",name:"NVIDIA RTX 4070 Super",price:11999,note:"12GB · 1440p champion",watt:220,tags:"nvidia rtx 4000 1440p popular dlss"},
    {id:"rtx4070tis",name:"NVIDIA RTX 4070 Ti Super",price:16499,note:"16GB · 4K capable",watt:285,tags:"nvidia rtx 4000 4k dlss"},
    {id:"rx7900xtx",name:"AMD RX 7900 XTX",price:18999,note:"24GB · AMD flagship",watt:355,tags:"amd radeon 4k flagship 24gb"},
    {id:"rtx4080s",name:"NVIDIA RTX 4080 Super",price:22999,note:"16GB · premium 4K",watt:320,tags:"nvidia rtx 4000 4k premium dlss"},
    {id:"rtx4090",name:"NVIDIA RTX 4090",price:39999,note:"24GB · the absolute king",watt:450,tags:"nvidia rtx 4000 4k flagship best dlss"},
  ]},
  { id:"mobo", label:"Motherboard", icon:"⊞", picks:[
    {id:"a520m",name:"Gigabyte A520M",price:1299,note:"AM4 · mATX · basic",socket:"AM4",ram:"DDR4",tags:"amd am4 matx budget"},
    {id:"b450m",name:"MSI B450M PRO-VDH",price:1599,note:"AM4 · mATX · reliable",socket:"AM4",ram:"DDR4",tags:"amd am4 matx msi"},
    {id:"b550m",name:"MSI PRO B550M-P",price:1999,note:"AM4 · mATX · PCIe 4.0",socket:"AM4",ram:"DDR4",tags:"amd am4 matx msi pcie4"},
    {id:"b550atx",name:"ASUS TUF B550-PLUS WiFi",price:2999,note:"AM4 · ATX · WiFi",socket:"AM4",ram:"DDR4",tags:"amd am4 atx asus wifi"},
    {id:"x570",name:"ASUS TUF X570-PLUS",price:3799,note:"AM4 · ATX · full PCIe 4.0",socket:"AM4",ram:"DDR4",tags:"amd am4 atx asus premium"},
    {id:"a620m",name:"Gigabyte A620M Gaming X",price:2199,note:"AM5 · mATX · budget DDR5",socket:"AM5",ram:"DDR5",tags:"amd am5 matx ddr5 budget"},
    {id:"b650m",name:"MSI PRO B650M-P",price:3199,note:"AM5 · mATX · DDR5",socket:"AM5",ram:"DDR5",tags:"amd am5 matx msi ddr5"},
    {id:"b650atx",name:"MSI MAG B650 Tomahawk",price:4499,note:"AM5 · ATX · WiFi",socket:"AM5",ram:"DDR5",tags:"amd am5 atx msi wifi ddr5"},
    {id:"x670e",name:"ASUS ROG Strix X670E",price:7999,note:"AM5 · ATX · PCIe 5.0",socket:"AM5",ram:"DDR5",tags:"amd am5 atx asus pcie5 ddr5"},
    {id:"h610m",name:"Gigabyte H610M DDR4",price:1499,note:"LGA1700 · mATX · entry",socket:"LGA1700",ram:"DDR4",tags:"intel lga1700 matx ddr4 budget"},
    {id:"b660m",name:"MSI PRO B660M-A DDR4",price:2299,note:"LGA1700 · mATX",socket:"LGA1700",ram:"DDR4",tags:"intel lga1700 matx msi ddr4"},
    {id:"b760m",name:"MSI B760M Mortar WiFi",price:3499,note:"LGA1700 · DDR5 · WiFi",socket:"LGA1700",ram:"DDR5",tags:"intel lga1700 matx msi wifi ddr5"},
    {id:"z690",name:"ASUS TUF Z690-PLUS WiFi",price:4499,note:"LGA1700 · ATX · OC ready",socket:"LGA1700",ram:"DDR5",tags:"intel lga1700 atx asus wifi ddr5"},
    {id:"z790",name:"ASUS ROG Strix Z790-E",price:8499,note:"LGA1700 · ATX · flagship",socket:"LGA1700",ram:"DDR5",tags:"intel lga1700 atx asus ddr5 premium"},
  ]},
  { id:"ram", label:"Memory", icon:"≡", picks:[
    {id:"ddr4-8",name:"8GB DDR4-3200",price:499,note:"2×4GB · bare minimum",type:"DDR4",tags:"ddr4 8gb budget"},
    {id:"ddr4-16",name:"16GB DDR4-3200",price:799,note:"2×8GB · most common",type:"DDR4",tags:"ddr4 16gb popular"},
    {id:"ddr4-16h",name:"16GB DDR4-3600 CL16",price:1099,note:"fast · Ryzen sweet spot",type:"DDR4",tags:"ddr4 16gb fast ryzen"},
    {id:"ddr4-32",name:"32GB DDR4-3600",price:1799,note:"2×16GB · futureproof",type:"DDR4",tags:"ddr4 32gb creator"},
    {id:"ddr5-16",name:"16GB DDR5-5600",price:1299,note:"2×8GB · DDR5 entry",type:"DDR5",tags:"ddr5 16gb"},
    {id:"ddr5-32",name:"32GB DDR5-6000 CL30",price:2199,note:"AM5 sweet spot",type:"DDR5",tags:"ddr5 32gb popular fast"},
    {id:"ddr5-32h",name:"32GB DDR5-6400 CL32",price:2999,note:"enthusiast speed",type:"DDR5",tags:"ddr5 32gb fast"},
    {id:"ddr5-64",name:"64GB DDR5-6000",price:4299,note:"2×32GB · workstation",type:"DDR5",tags:"ddr5 64gb workstation"},
  ]},
  { id:"storage", label:"Storage", icon:"◻", picks:[
    {id:"sata-500",name:"500GB SATA SSD",price:599,note:"basic · quick for OS",tags:"sata 500gb budget"},
    {id:"nvme3-500",name:"500GB NVMe Gen3",price:699,note:"fast boot drive",tags:"nvme gen3 500gb"},
    {id:"nvme3-1tb",name:"1TB NVMe Gen3",price:1099,note:"most popular pick",tags:"nvme gen3 1tb popular"},
    {id:"nvme4-1tb",name:"1TB NVMe Gen4",price:1499,note:"blazing · 7000MB/s",tags:"nvme gen4 1tb fast"},
    {id:"nvme4-2tb",name:"2TB NVMe Gen4",price:2699,note:"room for everything",tags:"nvme gen4 2tb"},
    {id:"nvme4-4tb",name:"4TB NVMe Gen4",price:5499,note:"no compromise",tags:"nvme gen4 4tb"},
    {id:"hdd-2tb",name:"2TB HDD 7200RPM",price:999,note:"bulk storage add-on",tags:"hdd 2tb"},
    {id:"hdd-4tb",name:"4TB HDD 5400RPM",price:1699,note:"media / backups",tags:"hdd 4tb"},
  ]},
  { id:"psu", label:"Power Supply", icon:"⏚", picks:[
    {id:"500w",name:"500W 80+ Bronze",price:799,note:"basic builds only",watt:500,tags:"500w bronze budget"},
    {id:"550w",name:"550W 80+ Bronze",price:999,note:"entry gaming",watt:550,tags:"550w bronze"},
    {id:"650w",name:"650W 80+ Gold Modular",price:1499,note:"mid builds · reliable",watt:650,tags:"650w gold modular popular"},
    {id:"750w",name:"750W 80+ Gold Modular",price:1999,note:"recommended",watt:750,tags:"750w gold modular"},
    {id:"850w",name:"850W 80+ Gold Modular",price:2499,note:"high-end builds",watt:850,tags:"850w gold modular"},
    {id:"1000w",name:"1000W 80+ Platinum",price:3999,note:"4080/4090 territory",watt:1000,tags:"1000w platinum"},
    {id:"1200w",name:"1200W 80+ Titanium",price:5999,note:"overkill (good kind)",watt:1200,tags:"1200w titanium"},
  ]},
  { id:"case", label:"PC Case", icon:"⊡", picks:[
    {id:"matx-bud",name:"Budget mATX Case",price:599,note:"basic · gets the job done",tags:"matx budget"},
    {id:"mesh-mid",name:"Mesh Mid-Tower ATX",price:1199,note:"airflow · popular",tags:"atx mesh airflow popular"},
    {id:"4000d",name:"Corsair 4000D Airflow",price:1699,note:"everyone's fave",tags:"corsair atx airflow popular"},
    {id:"h7",name:"NZXT H7 Flow",price:2199,note:"clean · good thermals",tags:"nzxt atx clean"},
    {id:"lancool",name:"Lian Li Lancool III",price:2799,note:"premium airflow",tags:"lian li atx premium"},
    {id:"5000t",name:"Corsair 5000T RGB",price:5999,note:"full tower · E-ATX · flashy",tags:"corsair full tower rgb"},
  ]},
  { id:"cooler", label:"CPU Cooler", icon:"❋", picks:[
    {id:"stock",name:"Stock Cooler (included)",price:0,note:"comes with some CPUs",tags:"stock free included"},
    {id:"air-bud",name:"DeepCool Gammaxx 400",price:399,note:"budget air cooler",tags:"air budget deepcool"},
    {id:"air-mid",name:"ID-Cooling SE-226-XT",price:699,note:"great value tower",tags:"air tower value"},
    {id:"air-nh12",name:"Noctua NH-U12S",price:1399,note:"silent · premium 120mm",tags:"air noctua silent premium"},
    {id:"air-nhd15",name:"Noctua NH-D15",price:1999,note:"air cooling king",tags:"air noctua best silent"},
    {id:"aio240",name:"240mm AIO Liquid",price:2199,note:"good balance",tags:"aio liquid 240mm water"},
    {id:"aio360",name:"360mm AIO Liquid",price:3499,note:"max cooling",tags:"aio liquid 360mm water premium"},
  ]},
];

const PRESETS = [
  {label:"Budget AM4",tag:"~R14k",sel:{cpu:"r5-5600",gpu:"rx6600",mobo:"b550m",ram:"ddr4-16",storage:"nvme3-1tb",psu:"550w",case:"mesh-mid",cooler:"stock"}},
  {label:"Sweet Spot",tag:"~R25k",sel:{cpu:"r5-7600x",gpu:"rtx4060",mobo:"b650m",ram:"ddr5-16",storage:"nvme4-1tb",psu:"650w",case:"4000d",cooler:"air-mid"}},
  {label:"Intel Mid",tag:"~R28k",sel:{cpu:"i5-12600k",gpu:"rx7800xt",mobo:"z690",ram:"ddr5-32",storage:"nvme4-2tb",psu:"750w",case:"h7",cooler:"aio240"}},
  {label:"Ultra",tag:"~R80k+",sel:{cpu:"r7-7800x3d",gpu:"rtx4080s",mobo:"x670e",ram:"ddr5-32h",storage:"nvme4-4tb",psu:"1000w",case:"lancool",cooler:"aio360"}},
];

/* ═══════ COMPATIBILITY FILTER ═══════ */
function getCompat(pick, catId, sel) {
  const cpu = PARTS[0].picks.find(p=>p.id===sel.cpu);
  const mobo = PARTS[2].picks.find(p=>p.id===sel.mobo);
  const gpu = PARTS[1].picks.find(p=>p.id===sel.gpu);
  if (catId==="mobo" && cpu && pick.socket!==cpu.socket) return {ok:false, why:`needs ${cpu.socket}`};
  if (catId==="ram" && mobo && pick.type!==mobo.ram) return {ok:false, why:`board needs ${mobo.ram}`};
  if (catId==="ram" && cpu && cpu.socket==="AM4" && pick.type==="DDR5") return {ok:false, why:"AM4 = DDR4 only"};
  if (catId==="psu" && (cpu||gpu)) { const need=(gpu?.watt||150)+(cpu?.tdp||100)+100; if(pick.watt&&pick.watt<need) return {ok:false, why:`need ~${need}W`}; }
  return {ok:true};
}
function getWarnings(sel) {
  const w=[];
  const cpu=PARTS[0].picks.find(p=>p.id===sel.cpu), mobo=PARTS[2].picks.find(p=>p.id===sel.mobo);
  const ram=PARTS[3].picks.find(p=>p.id===sel.ram), gpu=PARTS[1].picks.find(p=>p.id===sel.gpu), psu=PARTS[5].picks.find(p=>p.id===sel.psu);
  if(cpu&&mobo&&cpu.socket!==mobo.socket) w.push(`Socket mismatch — ${cpu.name} (${cpu.socket}) ≠ ${mobo.name} (${mobo.socket})`);
  if(mobo&&ram&&mobo.ram!==ram.type) w.push(`RAM mismatch — ${mobo.name} needs ${mobo.ram}, you picked ${ram.type}`);
  if(gpu&&psu){const e=(gpu.watt||200)+(cpu?.tdp||100)+100; if(psu.watt<e) w.push(`PSU too weak — need ~${e}W, have ${psu.watt}W`);}
  return w;
}
const fmtR = v => `R ${v.toLocaleString("en-ZA")}`;

/* ═══════ SEARCH ═══════ */
function searchParts(query) {
  if(!query||query.length<2) return [];
  const q=query.toLowerCase().split(/\s+/), results=[];
  PARTS.forEach(cat=>{cat.picks.forEach(pick=>{
    const hay=`${pick.name} ${pick.note} ${pick.tags||""} ${pick.socket||""} ${pick.plat||""} ${pick.type||""} ${cat.label}`.toLowerCase();
    const score=q.reduce((s,w)=>s+(hay.includes(w)?1:0),0);
    if(score===q.length) results.push({...pick,catId:cat.id,catLabel:cat.label,catIcon:cat.icon,score});
  });});
  return results.sort((a,b)=>b.score-a.score||a.price-b.price);
}

/* ═══════ THEMES ═══════ */
const TH = {
  chalk: {
    bg:"#2a3a2a", bgG:"radial-gradient(ellipse at 30% 20%,#2f4030 0%,#243024 40%,#1a261a 100%)",
    tx:"#d4d8c8", dim:"#8a9a7c", acc:"#f0d060", acc2:"#68b8e8", ok:"#7ec87e", warn:"#e87070",
    bdr:"#5a6a50", card:"rgba(255,255,255,0.03)", selBg:"rgba(240,208,96,0.08)", selBdr:"#f0d060",
    tag:"rgba(240,208,96,0.12)", stk:"rgba(30,44,30,0.96)", stkSh:"0 -4px 24px rgba(0,0,0,0.5)",
    searchBg:"rgba(255,255,255,0.06)", searchBdr:"#5a6a50", searchFocus:"#f0d060",
    incomp:"rgba(255,255,255,0.015)", tex:true,
  },
  white: {
    bg:"#f3f1ec", bgG:"linear-gradient(180deg,#f7f5f0 0%,#eae7df 100%)",
    tx:"#2a2a2a", dim:"#888880", acc:"#e03030", acc2:"#2060d0", ok:"#1a8a3a", warn:"#c04010",
    bdr:"#ccc8bc", card:"rgba(0,0,0,0.02)", selBg:"rgba(224,48,48,0.06)", selBdr:"#e03030",
    tag:"rgba(32,96,208,0.1)", stk:"rgba(243,241,236,0.96)", stkSh:"0 -4px 24px rgba(0,0,0,0.08)",
    searchBg:"#fff", searchBdr:"#ccc8bc", searchFocus:"#e03030",
    incomp:"rgba(0,0,0,0.01)", tex:false,
  },
};

const CSS = `
@keyframes rowIn{from{opacity:0;max-height:0;transform:translateY(-6px)}to{opacity:1;max-height:80px;transform:translateY(0)}}
.build-row-enter{animation:rowIn .3s cubic-bezier(.34,1.56,.64,1) forwards}
`;

/* ═══════ APP ═══════ */
export default function PCBuilder() {
  const [mode,setMode]=useState("white");
  const [sel,setSel]=useState({});
  const [q,setQ]=useState("");
  const [focused,setFocused]=useState(false);
  const [collapsed,setCollapsed]=useState(()=>Object.fromEntries(PARTS.map(c=>[c.id,true])));
  const [hiIdx,setHiIdx]=useState(-1);
  const [animKeys,setAnimKeys]=useState({});
  const inputRef=useRef(null);
  const dropRef=useRef(null);
  const t=TH[mode];

  const results=useMemo(()=>{
    const raw=searchParts(q);
    const hasCtx=!!(sel.cpu||sel.mobo||sel.gpu);
    if(!hasCtx) return raw;
    return raw.filter(r=>getCompat(r,r.catId,sel).ok);
  },[q,sel]);
  const showDrop=focused&&q.length>=2;
  useEffect(()=>{setHiIdx(-1);},[q]);

  const handlePick=useCallback((catId,pickId)=>{
    setSel(prev=>{const next={...prev,[catId]:prev[catId]===pickId?undefined:pickId}; if(next[catId]) setAnimKeys(ak=>({...ak,[catId]:Date.now()})); return next;});
    setCollapsed(prev=>({...prev,[catId]:false}));
  },[]);

  const handleKey=(e)=>{
    if(!showDrop||!results.length) return;
    if(e.key==="ArrowDown"){e.preventDefault();setHiIdx(i=>Math.min(i+1,results.length-1));}
    else if(e.key==="ArrowUp"){e.preventDefault();setHiIdx(i=>Math.max(i-1,0));}
    else if(e.key==="Enter"&&hiIdx>=0){e.preventDefault();handlePick(results[hiIdx].catId,results[hiIdx].id);setQ("");inputRef.current?.blur();}
    else if(e.key==="Escape"){setQ("");inputRef.current?.blur();}
  };

  useEffect(()=>{if(hiIdx>=0&&dropRef.current?.children[hiIdx+1]) dropRef.current.children[hiIdx+1].scrollIntoView({block:"nearest"});},[hiIdx]);
  useEffect(()=>{const h=e=>{if((e.key==="/"||((e.metaKey||e.ctrlKey)&&e.key==="k"))&&document.activeElement!==inputRef.current){e.preventDefault();inputRef.current?.focus();}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

  const total=useMemo(()=>PARTS.reduce((s,c)=>{const p=c.picks.find(x=>x.id===sel[c.id]);return s+(p?.price||0);},0),[sel]);
  const filled=PARTS.filter(c=>sel[c.id]).length;
  const warnings=useMemo(()=>getWarnings(sel),[sel]);

  const ChalkLine=()=>(<div style={{height:2,margin:"4px 0 10px",opacity:t.tex?.35:.45,background:t.tex?`repeating-linear-gradient(90deg,${t.dim} 0px,${t.dim} 4px,transparent 4px,transparent 8px)`:`repeating-linear-gradient(90deg,${t.bdr} 0px,${t.bdr} 6px,transparent 6px,transparent 10px)`}}/>);

  return (
    <div style={{minHeight:"100vh",background:t.bgG,color:t.tx,fontFamily:"'Patrick Hand', cursive",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&family=Indie+Flower&display=swap" rel="stylesheet"/>
      <style>{CSS}</style>

      {/* Textures */}
      {t.tex&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}><svg width="100%" height="100%" style={{opacity:.04}}><filter id="n"><feTurbulence baseFrequency=".9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg></div>}
      {!t.tex&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:.2,backgroundImage:"linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>}

      <div style={{position:"relative",zIndex:1,maxWidth:720,margin:"0 auto",padding:"0 16px 100px"}}>

        {/* Header */}
        <header style={{padding:"20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h1 style={{fontFamily:"'Caveat', cursive",fontSize:"clamp(28px,6vw,42px)",fontWeight:700,margin:0,color:t.acc,textShadow:mode==="chalk"?"2px 2px 0 rgba(0,0,0,.3)":"none",lineHeight:1}}>PC Builder ZA</h1>
            <p style={{fontFamily:"'Patrick Hand', cursive",fontSize:13,color:t.dim,margin:"2px 0 0"}}>🇿🇦 ZAR incl. VAT · search · compare · build</p>
          </div>
          <button onClick={()=>setMode(m=>m==="chalk"?"white":"chalk")} style={{padding:"5px 12px",border:`1.5px solid ${t.bdr}`,borderRadius:20,background:t.card,color:t.dim,fontFamily:"'Patrick Hand', cursive",fontSize:13,cursor:"pointer"}}>{mode==="chalk"?"☀ whiteboard":"● chalkboard"}</button>
        </header>

        {/* ══════ SEARCH ══════ */}
        <div style={{position:"relative",margin:"16px 0 12px",zIndex:200}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:showDrop?"10px 10px 0 0":10,border:`2.5px solid ${focused?t.searchFocus:t.searchBdr}`,background:t.searchBg,boxShadow:focused?`0 0 0 3px ${t.searchFocus}20, 0 8px 32px rgba(0,0,0,${t.tex?".3":".06"})`:"none",transition:"all .2s"}}>
            <span style={{fontSize:18,opacity:.5}}>🔍</span>
            <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setTimeout(()=>setFocused(false),200)} onKeyDown={handleKey}
              placeholder="Search parts — RTX 4060, Ryzen 5600X, AM4, DDR5..."
              style={{flex:1,border:"none",outline:"none",background:"transparent",fontFamily:"'Caveat', cursive",fontSize:20,fontWeight:600,color:t.tx}}/>
            {q&&<button onClick={()=>{setQ("");inputRef.current?.focus();}} style={{background:"none",border:"none",color:t.dim,cursor:"pointer",fontSize:16}}>✕</button>}
            <span style={{fontSize:10,fontFamily:"'Patrick Hand', cursive",color:t.dim,padding:"2px 6px",border:`1px solid ${t.bdr}`,borderRadius:4,opacity:focused?0:.6}}>press /</span>
          </div>

          {showDrop&&(
            <div ref={dropRef} style={{position:"absolute",top:"100%",left:0,right:0,maxHeight:400,overflowY:"auto",border:`2.5px solid ${t.searchFocus}`,borderTop:"none",borderRadius:"0 0 10px 10px",background:t.tex?"rgba(30,44,30,.98)":"rgba(247,245,240,.99)",boxShadow:`0 12px 40px rgba(0,0,0,${t.tex?".4":".1"})`,backdropFilter:"blur(12px)"}}>
              {results.length===0?(
                <div style={{padding:20,textAlign:"center",color:t.dim,fontFamily:"'Indie Flower', cursive",fontSize:16}}>no parts match "{q}"</div>
              ):(
                <>
                  <div style={{padding:"6px 14px",fontSize:11,color:t.dim,fontFamily:"'Patrick Hand', cursive",borderBottom:`1px dashed ${t.bdr}`}}>{results.length} result{results.length!==1?"s":""}
                    {!!(sel.cpu||sel.mobo||sel.gpu)&&<span style={{marginLeft:6,color:t.ok}}>· filtered to compatible</span>}
                    {" "}· ↑↓ Enter</div>
                  {results.map((r,i)=>{const isHi=i===hiIdx,isSel=sel[r.catId]===r.id;return(
                    <button key={r.catId+r.id} onMouseDown={e=>{e.preventDefault();handlePick(r.catId,r.id);setQ("");}} onMouseEnter={()=>setHiIdx(i)}
                      style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",border:"none",borderBottom:`1px solid ${t.bdr}22`,background:isHi?`${t.searchFocus}15`:isSel?t.selBg:"transparent",cursor:"pointer",textAlign:"left",outline:"none"}}>
                      <span style={{fontSize:9,fontWeight:700,fontFamily:"'Patrick Hand', cursive",padding:"2px 7px",borderRadius:4,background:t.tag,color:t.acc2,whiteSpace:"nowrap",minWidth:55,textAlign:"center"}}>{r.catIcon} {r.catLabel}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Caveat', cursive",fontWeight:700,fontSize:16,color:isSel?t.selBdr:t.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isSel&&"✓ "}{r.name}</div>
                        <div style={{fontFamily:"'Patrick Hand', cursive",fontSize:12,color:t.dim}}>{r.note}{r.socket&&` · ${r.socket}`}</div>
                      </div>
                      <span style={{fontFamily:"'Caveat', cursive",fontWeight:800,fontSize:16,color:isHi?t.searchFocus:t.acc2,whiteSpace:"nowrap"}}>{fmtR(r.price)}</span>
                    </button>
                  );})}
                </>
              )}
            </div>
          )}
        </div>

        {/* Presets */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {PRESETS.map(p=>(<button key={p.label} onClick={()=>{setSel({...p.sel});setCollapsed({});}} style={{padding:"4px 12px",borderRadius:6,border:`1.5px dashed ${t.bdr}`,background:t.card,color:t.tx,fontFamily:"'Caveat', cursive",fontWeight:600,fontSize:15,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=t.acc;e.currentTarget.style.color=t.acc;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.bdr;e.currentTarget.style.color=t.tx;}}>{p.label} <span style={{color:t.acc2,marginLeft:3}}>{p.tag}</span></button>))}
          {filled>0&&<button onClick={()=>{setSel({});setCollapsed(Object.fromEntries(PARTS.map(c=>[c.id,true])));}} style={{padding:"4px 12px",borderRadius:6,border:`1.5px dashed ${t.warn}`,background:"transparent",color:t.warn,fontFamily:"'Caveat', cursive",fontWeight:600,fontSize:15,cursor:"pointer"}}>✕ clear</button>}
        </div>

        {/* Warnings */}
        {warnings.length>0&&(
          <div style={{margin:"0 0 14px",padding:"10px 14px",borderRadius:6,border:`2px dashed ${t.warn}`,background:`${t.warn}08`}}>
            <div style={{fontFamily:"'Caveat', cursive",fontWeight:700,fontSize:18,color:t.warn,marginBottom:3}}>⚠ heads up!</div>
            {warnings.map((w,i)=><div key={i} style={{fontSize:13,color:t.warn,fontFamily:"'Patrick Hand', cursive"}}>→ {w}</div>)}
          </div>
        )}

        {/* ══════ BUILD CARD ══════ */}
        {filled>0&&(
          <div style={{marginBottom:20,borderRadius:8,border:`2px solid ${t.bdr}`,background:t.card,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px dashed ${t.bdr}`}}>
              <span style={{fontFamily:"'Caveat', cursive",fontWeight:700,fontSize:20,color:t.acc}}>Your Build</span>
              <span style={{fontFamily:"'Patrick Hand', cursive",fontSize:13,color:t.dim}}>{filled}/8 parts</span>
            </div>
            {PARTS.map(cat=>{
              const pick=cat.picks.find(p=>p.id===sel[cat.id]);
              if(!pick)return null;
              const ak=animKeys[cat.id];
              return(
                <div key={cat.id+"-"+(ak||"")} className="build-row-enter" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderBottom:`1px dashed ${t.bdr}33`}}>
                  <span style={{fontSize:14,width:18,textAlign:"center",opacity:.5}}>{cat.icon}</span>
                  <span style={{fontSize:11,color:t.dim,fontFamily:"'Patrick Hand', cursive",width:65,flexShrink:0}}>{cat.label}</span>
                  <span style={{flex:1,fontFamily:"'Caveat', cursive",fontSize:15,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pick.name}</span>
                  <div style={{display:"flex",gap:3}}>
                    {Object.entries(RETAILERS).slice(0,2).map(([k,r])=>(
                      <a key={k} href={shopUrl(k,pick.name)} target="_blank" rel="noopener noreferrer" style={{fontSize:9,fontFamily:"'Patrick Hand', cursive",fontWeight:600,padding:"2px 6px",borderRadius:3,background:`${r.color}12`,color:r.color,textDecoration:"none",border:`1px solid ${r.color}20`}}>{r.name}</a>
                    ))}
                  </div>
                  <span style={{fontFamily:"'Caveat', cursive",fontWeight:800,fontSize:15,color:t.acc,whiteSpace:"nowrap"}}>{fmtR(pick.price)}</span>
                  <button onClick={()=>handlePick(cat.id,pick.id)} style={{background:"none",border:"none",color:t.dim,cursor:"pointer",fontSize:12,opacity:.5}}>✕</button>
                </div>
              );
            })}
            <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",background:`${t.acc}08`}}>
              <span style={{fontFamily:"'Caveat', cursive",fontWeight:700,fontSize:18}}>total</span>
              <span style={{fontFamily:"'Caveat', cursive",fontWeight:800,fontSize:26,color:t.acc}}>{fmtR(total)}</span>
            </div>
          </div>
        )}

        {/* ══════ CATEGORIES ══════ */}
        {PARTS.map(cat=>{
          const isCol=collapsed[cat.id];
          const selPick=cat.picks.find(p=>p.id===sel[cat.id]);
          const hasContext=sel.cpu||sel.mobo||sel.gpu;
          const visible=hasContext?cat.picks.filter(p=>getCompat(p,cat.id,sel).ok):cat.picks;
          const hiddenCount=cat.picks.length-visible.length;

          return(
            <section key={cat.id} style={{marginBottom:12}}>
              <button onClick={()=>setCollapsed(p=>({...p,[cat.id]:!p[cat.id]}))} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:18,opacity:.45}}>{cat.icon}</span>
                <h2 style={{fontFamily:"'Caveat', cursive",fontSize:21,fontWeight:700,margin:0,color:sel[cat.id]?t.acc:t.tx,flex:1}}>
                  {cat.label}
                  {selPick&&<span style={{fontSize:13,marginLeft:6,color:t.acc2,fontFamily:"'Patrick Hand', cursive",fontWeight:400}}>— {selPick.name} · {fmtR(selPick.price)}</span>}
                </h2>
                {hiddenCount>0&&!isCol&&<span style={{fontSize:10,fontFamily:"'Patrick Hand', cursive",color:t.ok,padding:"1px 8px",borderRadius:4,background:`${t.ok}12`}}>{hiddenCount} filtered out</span>}
                <span style={{fontSize:14,color:t.dim,transition:"transform .2s",transform:isCol?"rotate(-90deg)":"rotate(0)"}}>▾</span>
              </button>
              <ChalkLine/>

              {!isCol&&(
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {visible.map(pick=>{
                    const isSel=sel[cat.id]===pick.id;
                    return(
                      <div key={pick.id}>
                        <button onClick={()=>handlePick(cat.id,pick.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",border:isSel?`2.5px solid ${t.selBdr}`:`1.5px dashed ${t.bdr}`,borderRadius:isSel?"6px 6px 0 0":6,background:isSel?t.selBg:t.card,cursor:"pointer",textAlign:"left",outline:"none",transition:"all .2s"}}>
                          <span style={{width:18,height:18,borderRadius:4,flexShrink:0,border:`2px solid ${isSel?t.selBdr:t.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:t.selBdr,background:isSel?`${t.selBdr}15`:"transparent",fontFamily:"'Patrick Hand', cursive"}}>{isSel?"✓":""}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                              <span style={{fontWeight:700,fontSize:14,color:isSel?t.selBdr:t.tx,fontFamily:"'Caveat', cursive"}}>{pick.name}</span>
                              {pick.plat&&<span style={{fontSize:8,fontWeight:700,fontFamily:"'Patrick Hand', cursive",padding:"1px 5px",borderRadius:3,background:t.tag,color:t.acc2}}>{pick.plat}</span>}
                            </div>
                            <div style={{fontSize:12,color:t.dim,fontFamily:"'Patrick Hand', cursive"}}>{pick.note}</div>
                          </div>
                          <span style={{fontWeight:800,fontSize:14,fontFamily:"'Caveat', cursive",color:isSel?t.selBdr:t.acc2,whiteSpace:"nowrap"}}>{fmtR(pick.price)}</span>
                        </button>
                        {isSel&&(
                          <div style={{padding:"5px 12px 7px",borderLeft:`2.5px solid ${t.selBdr}`,borderRight:`2.5px solid ${t.selBdr}`,borderBottom:`2.5px solid ${t.selBdr}`,borderRadius:"0 0 6px 6px",background:`${t.selBdr}06`,display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                            <span style={{fontSize:10,color:t.dim,fontFamily:"'Patrick Hand', cursive"}}>buy at:</span>
                            {Object.entries(RETAILERS).map(([k,r])=>(<a key={k} href={shopUrl(k,pick.name)} target="_blank" rel="noopener noreferrer" style={{fontSize:10,fontFamily:"'Patrick Hand', cursive",fontWeight:600,padding:"2px 7px",borderRadius:3,background:`${r.color}15`,color:r.color,border:`1px solid ${r.color}25`,textDecoration:"none"}}>{r.name} →</a>))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {hiddenCount>0&&(
                    <div style={{padding:"6px 10px",fontSize:12,fontFamily:"'Patrick Hand', cursive",color:t.dim,fontStyle:"italic"}}>
                      {hiddenCount} incompatible part{hiddenCount!==1?"s":""} hidden based on your build
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {/* ══════ STICKY TOTAL ══════ */}
        {filled>0&&(
          <div style={{position:"sticky",bottom:12,zIndex:100,margin:"12px auto 0",maxWidth:420,padding:"12px 20px",borderRadius:10,border:`2px solid ${t.bdr}`,background:t.stk,backdropFilter:"blur(12px)",boxShadow:t.stkSh,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontFamily:"'Patrick Hand', cursive",fontSize:11,color:t.dim}}>estimated total</div>
              <div style={{fontFamily:"'Caveat', cursive",fontSize:30,fontWeight:700,color:t.acc,lineHeight:1.1,textShadow:mode==="chalk"?"1px 1px 0 rgba(0,0,0,.3)":"none"}}>{fmtR(total)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Indie Flower', cursive",fontSize:13,color:t.acc2,padding:"3px 10px",borderRadius:5,border:`1.5px dashed ${t.acc2}44`,background:t.tag}}>
                {total>=60000?"enthusiast 🔥":total>=25000?"performance ⚡":total>=12000?"solid value ✓":"budget 💰"}
              </div>
              <div style={{fontSize:10,color:t.dim,marginTop:2,fontFamily:"'Patrick Hand', cursive"}}>{filled}/8 parts</div>
            </div>
          </div>
        )}

        <footer style={{textAlign:"center",padding:"36px 0 12px",fontFamily:"'Indie Flower', cursive",color:`${t.dim}88`,fontSize:12}}>prices are estimates · confirm at retailer · 🇿🇦 made for mzansi</footer>
      </div>
    </div>
  );
}
