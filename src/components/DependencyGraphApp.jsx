
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  forceX,
  forceY
} from 'd3-force';


const CATEGORY_COLORS = {
  estrutura: '#3b82f6',
  arquitetura: '#10b981',
  instalacoes: '#8b5cf6',
  documentacao: '#f59e0b',
  coordenacao: '#ef4444',
}

const IMPACT_WIDTH = { baixo: 1.25, medio: 1.75, alto: 2.25, critico: 3 }

// Parâmetros visuais e modos de layout
const PADDING = 60;
const NODE_RADIUS = 18;

const LAYOUT_MODES = {
  FORCE: "force",
  RADIAL: "radial"
};


const initialData = {
  nodes: [
    { id: 'vigas', label: 'Projeção de viga', category: 'estrutura', impact: 'alto' },
    { id: 'lajes', label: 'Lajes', category: 'estrutura', impact: 'alto' },
    { id: 'pilares', label: 'Pilares', category: 'estrutura', impact: 'alto' },
    { id: 'fundacoes', label: 'Fundações', category: 'estrutura', impact: 'alto' },
    { id: 'detEstr', label: 'Detalhamentos Estr.', category: 'estrutura', impact: 'alto' },
    { id: 'juntas', label: 'Juntas de dilatação', category: 'estrutura', impact: 'medio' },
    { id: 'paredes', label: 'Paredes', category: 'arquitetura', impact: 'alto' },
    { id: 'forro', label: 'Forro', category: 'arquitetura', impact: 'alto' },
    { id: 'portas', label: 'Famílias de porta', category: 'arquitetura', impact: 'medio' },
    { id: 'janelas', label: 'Esquadrias (janelas)', category: 'arquitetura', impact: 'alto' },
    { id: 'fachada', label: 'Fachada/Envelope', category: 'arquitetura', impact: 'alto' },
    { id: 'brises', label: 'Brises/Proteções', category: 'arquitetura', impact: 'medio' },
    { id: 'revest', label: 'Revestimentos', category: 'arquitetura', impact: 'baixo' },
    { id: 'imper', label: 'Impermeabilização', category: 'arquitetura', impact: 'alto' },
    { id: 'escadas', label: 'Escadas', category: 'arquitetura', impact: 'alto' },
    { id: 'guardaCorpo', label: 'Guarda-corpo', category: 'arquitetura', impact: 'medio' },
    { id: 'aberturaPorta', label: 'Abertura de porta', category: 'arquitetura', impact: 'alto' },
    { id: 'espaleta', label: 'Espaleta', category: 'arquitetura', impact: 'medio' },
    { id: 'dutos', label: 'Dutos (HVAC)', category: 'instalacoes', impact: 'alto' },
    { id: 'grelhas', label: 'Difusores/Grelhas', category: 'instalacoes', impact: 'medio' },
    { id: 'tubulacao', label: 'Tubulação hidráulica', category: 'instalacoes', impact: 'alto' },
    { id: 'eletrocalha', label: 'Eletrocalhas', category: 'instalacoes', impact: 'alto' },
    { id: 'iluminacao', label: 'Luminárias', category: 'instalacoes', impact: 'medio' },
    { id: 'sprinkler', label: 'Sprinklers', category: 'instalacoes', impact: 'medio' },
    { id: 'sensores', label: 'Sensores', category: 'instalacoes', impact: 'baixo' },
    { id: 'psi', label: 'Detecção/Alarme (PCI)', category: 'instalacoes', impact: 'alto' },
    { id: 'nivel', label: 'Nível', category: 'coordenacao', impact: 'alto' },
    { id: 'eixos', label: 'Eixos/Grids', category: 'coordenacao', impact: 'critico' },
    { id: 'coords', label: 'Coordenadas compartilhadas', category: 'coordenacao', impact: 'critico' },
    { id: 'fases', label: 'Fases/Demolição', category: 'coordenacao', impact: 'alto' },
    { id: 'worksets', label: 'Worksets', category: 'coordenacao', impact: 'medio' },
    { id: 'links', label: 'Vínculos (RVT/IFC/DWG)', category: 'coordenacao', impact: 'alto' },
    { id: 'shaft', label: 'Shaft vertical', category: 'coordenacao', impact: 'critico' },
    { id: 'fire', label: 'Fire rating / Corta-fogo', category: 'coordenacao', impact: 'alto' },
    { id: 'acessibilidade', label: 'Acessibilidade/Rotas', category: 'coordenacao', impact: 'alto' },
    { id: 'cortes', label: 'Cortes', category: 'documentacao', impact: 'medio' },
    { id: 'plantas', label: 'Plantas/Layouts', category: 'documentacao', impact: 'medio' },
    { id: 'detalhes', label: 'Detalhes executivos', category: 'documentacao', impact: 'alto' },
    { id: 'folhas', label: 'Pranchas/Carimbos', category: 'documentacao', impact: 'medio' },
    { id: 'viewTemplates', label: 'Templates de vista', category: 'documentacao', impact: 'medio' },
    { id: 'filtros', label: 'Filtros de vista', category: 'documentacao', impact: 'medio' },
    { id: 'tagsAmb', label: 'Tags de ambiente', category: 'documentacao', impact: 'baixo' },
    { id: 'areas', label: 'Áreas e Cômputos', category: 'documentacao', impact: 'medio' },
    { id: 'tabelas', label: 'Tabelas/Quantitativos', category: 'documentacao', impact: 'alto' },
    { id: 'acabamentos', label: 'Acabamentos (memorial)', category: 'documentacao', impact: 'medio' },
    { id: 'tagPorta', label: 'Tag de porta', category: 'documentacao', impact: 'baixo' },
    { id: 'cotas', label: 'Cotas/Anotações', category: 'documentacao', impact: 'medio' },
    { id: 'legendas', label: 'Legendas/Keynotes', category: 'documentacao', impact: 'medio' },
    { id: 'materiais', label: 'Materiais', category: 'documentacao', impact: 'medio' },
    { id: 'paramCompart', label: 'Parâmetros compartilhados', category: 'documentacao', impact: 'alto' },
    { id: 'familias', label: 'Biblioteca de famílias', category: 'documentacao', impact: 'medio' }
  ],
  edges: [
    { source: 'nivel', target: 'vigas' },
    { source: 'nivel', target: 'lajes' },
    { source: 'nivel', target: 'escadas' },
    { source: 'eixos', target: 'vigas' },
    { source: 'eixos', target: 'paredes' },
    { source: 'coords', target: 'links' },
    { source: 'vigas', target: 'forro' },
    { source: 'vigas', target: 'shaft' },
    { source: 'vigas', target: 'dutos' },
    { source: 'vigas', target: 'cortes' },
    { source: 'vigas', target: 'detEstr' },
    { source: 'lajes', target: 'imper' },
    { source: 'lajes', target: 'forro' },
    { source: 'lajes', target: 'detalhes' },
    { source: 'pilares', target: 'cortes' },
    { source: 'fundacoes', target: 'detEstr' },
    { source: 'juntas', target: 'fachada' },
    { source: 'forro', target: 'iluminacao' },
    { source: 'forro', target: 'sprinkler' },
    { source: 'forro', target: 'sensores' },
    { source: 'paredes', target: 'portas' },
    { source: 'paredes', target: 'revest' },
    { source: 'escadas', target: 'acessibilidade' },
    { source: 'guardaCorpo', target: 'acessibilidade' },
    { source: 'janelas', target: 'fachada' },
    { source: 'janelas', target: 'detalhes' },
    { source: 'fachada', target: 'brises' },
    { source: 'fachada', target: 'imper' },
    { source: 'portas', target: 'tagPorta' },
    { source: 'portas', target: 'espaleta' },
    { source: 'portas', target: 'aberturaPorta' },
    { source: 'portas', target: 'fire' },
    { source: 'shaft', target: 'tubulacao' },
    { source: 'shaft', target: 'dutos' },
    { source: 'dutos', target: 'grelhas' },
    { source: 'eletrocalha', target: 'iluminacao' },
    { source: 'psi', target: 'sprinkler' },
    { source: 'plantas', target: 'cotas' },
    { source: 'plantas', target: 'legendas' },
    { source: 'plantas', target: 'tabelas' },
    { source: 'cortes', target: 'detalhes' },
    { source: 'viewTemplates', target: 'plantas' },
    { source: 'viewTemplates', target: 'cortes' },
    { source: 'filtros', target: 'plantas' },
    { source: 'filtros', target: 'cortes' },
    { source: 'folhas', target: 'plantas' },
    { source: 'folhas', target: 'cortes' },
    { source: 'paramCompart', target: 'familias' },
    { source: 'paramCompart', target: 'tabelas' },
    { source: 'materiais', target: 'revest' },
    { source: 'materiais', target: 'detalhes' },
    { source: 'links', target: 'plantas' },
    { source: 'links', target: 'cortes' },
    { source: 'fases', target: 'plantas' },
    { source: 'fases', target: 'cortes' },
    { source: 'fire', target: 'detalhes' },
    { source: 'areas', target: 'tabelas' }
  ]
}

function clampToBounds(nd, w, h, pad = PADDING) {
  nd.x = Math.max(pad, Math.min(w - pad, nd.x));
  nd.y = Math.max(pad, Math.min(h - pad, nd.y));
}

function linkDistance(e, base = 140) {
  const srcImpact = e.source.impact || "medio";
  const scale = { baixo: 0.9, medio: 1.0, alto: 1.15, critico: 1.35 }[srcImpact] || 1.0;
  return base * scale;
}

// Utilitário: cria um Map por id (id -> nó)
function indexById(arr) {
  const m = new Map();
  arr.forEach((d) => m.set(d.id, d));
  return m;
}


function layoutForceD3(nodes, edges, w = 1200, h = 700) {
  const sim = forceSimulation(nodes)
    .force("charge", forceManyBody().strength(-1400))
    .force("link", forceLink(edges).id(d => d.id).distance(e => linkDistance(e)))
    .force("center", forceCenter(w / 2, h / 2))
    .force("collide", forceCollide(NODE_RADIUS * 1.6));

  sim.tick(300).stop();
  nodes.forEach(nd => clampToBounds(nd, w, h));
}

function layoutRadialByCategory(nodes, edges, w = 1200, h = 700) {
  const cats = ["estrutura", "arquitetura", "instalacoes", "documentacao", "coordenacao"];
  const R = Math.min(w, h) * 0.32;
  const cx = w / 2, cy = h / 2;

  const target = new Map(
    cats.map((c, i) => {
      const a = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
      return [c, { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R }];
    })
  );

  const fx = forceX(d => (target.get(d.category)?.x ?? cx)).strength(0.2);
  const fy = forceY(d => (target.get(d.category)?.y ?? cy)).strength(0.2);

  const sim = forceSimulation(nodes)
    .force("charge", forceManyBody().strength(-1200))
    .force("link", forceLink(edges).id(d => d.id).distance(e => linkDistance(e, 120)))
    .force("clusterX", fx)
    .force("clusterY", fy)
    .force("collide", forceCollide(NODE_RADIUS * 1.55));

  sim.tick(300).stop();
  nodes.forEach(nd => clampToBounds(nd, w, h));
}


function Legend(){
  const items=[
    {label:'Estrutura', color:CATEGORY_COLORS.estrutura},
    {label:'Arquitetura', color:CATEGORY_COLORS.arquitetura},
    {label:'Instalações', color:CATEGORY_COLORS.instalacoes},
    {label:'Documentação', color:CATEGORY_COLORS.documentacao},
    {label:'Coordenação', color:CATEGORY_COLORS.coordenacao},
  ]
  return (<div className="flex flex-wrap gap-2 text-sm">{items.map(it=>(<span key={it.label} className="inline-flex items-center gap-2 px-2 py-1 rounded-full shadow-sm border"><span className="w-3 h-3 inline-block rounded-full" style={{backgroundColor:it.color}} />{it.label}</span>))}</div>)
}

function useZoomPan(svgRef){
  const [viewBox, setViewBox] = useState({x:0,y:0,w:1200,h:700})
  const state = useRef({dragging:false,mx:0,my:0,start:{x:0,y:0}})
  const onWheel = (e)=>{ e.preventDefault(); const {x,y,w,h}=viewBox; const scale=e.deltaY<0?0.9:1.1; const nx=x+(w-w*scale)/2; const ny=y+(h-h*scale)/2; setViewBox({x:nx,y:ny,w:w*scale,h:h*scale}) }
  const onMouseDown=(e)=>{ state.current.dragging=true; state.current.mx=e.clientX; state.current.my=e.clientY; state.current.start={...viewBox} }
  const onMouseMove=(e)=>{ if(!state.current.dragging) return; const dx=(e.clientX-state.current.mx)*(viewBox.w/1200); const dy=(e.clientY-state.current.my)*(viewBox.h/700); setViewBox({...viewBox, x:state.current.start.x-dx, y:state.current.start.y-dy}) }
  const onMouseUp=()=>{ state.current.dragging=false }
  useEffect(()=>{ const svg=svgRef.current; if(!svg) return; svg.addEventListener('wheel',onWheel,{passive:false}); svg.addEventListener('mousedown',onMouseDown); window.addEventListener('mousemove',onMouseMove); window.addEventListener('mouseup',onMouseUp); return ()=>{ svg.removeEventListener('wheel',onWheel); svg.removeEventListener('mousedown',onMouseDown); window.removeEventListener('mousemove',onMouseMove); window.removeEventListener('mouseup',onMouseUp); } })
  return viewBox
}

function getQueryParam(name){ if(typeof window==='undefined') return null; const url=new URL(window.location.href); return url.searchParams.get(name) }

export default function DependencyGraphApp(){
  const [data, setData] = useState(initialData)
  const [layoutMode, setLayoutMode] = useState(LAYOUT_MODES.RADIAL);
  const [loading, setLoading] = useState(false)
  const [lastLoaded, setLastLoaded] = useState(null)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(false)
  const [jsonDraft, setJsonDraft] = useState(JSON.stringify(initialData, null, 2))

  const dataURL = useMemo(()=>getQueryParam('data'), [])
  const canEdit = useMemo(()=>getQueryParam('edit')==='1', [])

  const nodes = useMemo(()=>data.nodes.map(d=>({...d})), [data])
  const edges = useMemo(()=>data.edges.map(d=>({...d})), [data])
useMemo(() => {
  const idIndex = new Map(nodes.map((d) => [d.id, d]));
  const links = edges.map(e => ({ source: idIndex.get(e.source), target: idIndex.get(e.target) }));

  if (layoutMode === LAYOUT_MODES.RADIAL) {
    layoutRadialByCategory(nodes, links, 1200, 700);
  } else {
    layoutForceD3(nodes, links, 1200, 700);
  }
}, [data, layoutMode]);


  const svgRef = useRef(null)
  const viewBox = useZoomPan(svgRef)
  const idIndex = useMemo(()=>indexById(nodes), [nodes])
  const neighbors = useMemo(()=>{ const out=new Map(), incoming=new Map(); nodes.forEach(n=>{out.set(n.id,[]);incoming.set(n.id,[])}); edges.forEach(e=>{ out.get(e.source).push(e.target); incoming.get(e.target).push(e.source) }); return {out, incoming}}, [nodes, edges])

  const filtered = useMemo(()=>{ if(!search.trim()) return nodes; const s=search.toLowerCase(); return nodes.filter(n=>n.label.toLowerCase().includes(s)||n.id.toLowerCase().includes(s)) }, [nodes, search])

  const selectedNode = selected ? idIndex.get(selected) : null
  const outList = selected ? neighbors.out.get(selected) : []
  const inList = selected ? neighbors.incoming.get(selected) : []

  const applyJSON = ()=>{ try{ const obj=JSON.parse(jsonDraft); if(!obj.nodes||!obj.edges) throw new Error("JSON deve conter 'nodes' e 'edges'"); setData(obj); setSelected(null); setEditing(false) } catch(e){ alert('JSON inválido: '+e.message) } }

  useEffect(()=>{ async function load(){ if(!dataURL) return; try{ setLoading(true); const res=await fetch(dataURL,{cache:'no-store'}); if(!res.ok) throw new Error('Falha ao carregar dados externos'); const obj=await res.json(); if(!obj.nodes||!obj.edges) throw new Error('JSON externo sem nodes/edges'); setData(obj); setJsonDraft(JSON.stringify(obj,null,2)); setLastLoaded(new Date().toLocaleString()) } catch(err){ console.error(err); alert('Erro ao carregar dados externos. Usando dataset interno.') } finally { setLoading(False) } } load() }, [dataURL])

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4">
        <header className="col-span-12 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mapa Cíclico de Influências – Compat / Revit</h1>
            <p className="text-sm text-neutral-600">Clique em um nó para ver o que ele influencia e por quem é influenciado. Use a busca para localizar um conceito.</p>
            {dataURL && <p className="text-xs text-neutral-500">Dados externos: <span className="underline break-all">{dataURL}</span>{lastLoaded ? ` • carregado em ${lastLoaded}` : ''}</p>}
          </div>
          <Legend /> <div className="flex items-center gap-2">
  <label className="text-xs text-neutral-600">Layout</label>
  <select
    className="rounded-lg border px-2 py-1 text-sm"
    value={layoutMode}
    onChange={(e) => setLayoutMode(e.target.value)}
  >
    <option value={LAYOUT_MODES.RADIAL}>Radial por categoria</option>
    <option value={LAYOUT_MODES.FORCE}>Força (orgânico)</option>
  </select>
</div>

        </header>

        <aside className="col-span-3 bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold">Buscar conceito</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Projeção de viga, Forro, Portas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex-1 overflow-auto">
            <h3 className="text-sm font-semibold mb-2">Resultados</h3>
            <ul className="space-y-1 pr-1">
              {filtered.map(n => (
                <li key={n.id}>
                  <button onClick={() => setSelected(n.id)} className={`w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 transition flex items-center gap-2 ${selected===n.id ? 'bg-neutral-100' : ''}`}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[n.category] }} />
                    <span className="font-medium">{n.label}</span>
                    <span className="ml-auto text-xs uppercase tracking-wide px-2 py-0.5 rounded-full border">{n.impact}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-3 flex items-center gap-2">
            {dataURL && (<button onClick={() => window.location.reload()} className="rounded-xl border px-3 py-2 hover:bg-neutral-50">Recarregar dados externos</button>)}
            {canEdit && (<button onClick={() => setEditing(v=>!v)} className="rounded-xl border px-3 py-2 hover:bg-neutral-50">{editing ? 'Fechar editor de dados' : 'Editar JSON (dados)'}</button>)}
          </div>
        </aside>

        <main className="col-span-6 bg-white rounded-2xl shadow p-2">
          <svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} className="w-full h-[700px] rounded-2xl cursor-grab">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#9CA3AF" />
              </marker>
            </defs>
            {edges.map((e, i) => {
              const a = idIndex.get(e.source)
              const b = idIndex.get(e.target)
              const w = IMPACT_WIDTH[a.impact] || 1.5
              const active = selected && (e.source === selected || e.target === selected)
              return (<line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? '#111827' : '#9CA3AF'} strokeWidth={w} markerEnd="url(#arrow)" opacity={active ? 0.95 : 0.5} />)
            })}
            {nodes.map((n) => {
              const r = 18
              const isSel = selected === n.id
              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                  <circle r={r} fill={CATEGORY_COLORS[n.category]} stroke={isSel ? '#111827' : 'white'} strokeWidth={isSel ? 3 : 2} onClick={() => setSelected(n.id)} className="cursor-pointer" />
                  <text x={0} y={r + 16} textAnchor="middle" className="select-none" style={{ fontSize: 12, fill: '#111827' }}>{n.label}</text>
                </g>
              )
            })}
          </svg>
        </main>

        <section className="col-span-3 bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Detalhes {loading && <span className='text-xs text-neutral-500'>(carregando...)</span>}</h3>
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] }} />
                <div>
                  <div className="font-bold">{selectedNode.label}</div>
                  <div className="text-xs text-neutral-600 uppercase">{selectedNode.category} • impacto: {selectedNode.impact}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Influencia</div>
                {outList.length ? (
                  <ul className="list-disc ml-5 space-y-1">
                    {outList.map(id => (<li key={id}><button className="hover:underline" onClick={() => setSelected(id)}>{idIndex.get(id)?.label || id}</button></li>))}
                  </ul>
                ) : <div className="text-sm text-neutral-500">—</div>}
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">É influenciado por</div>
                {inList.length ? (
                  <ul className="list-disc ml-5 space-y-1">
                    {inList.map(id => (<li key={id}><button className="hover:underline" onClick={() => setSelected(id)}>{idIndex.get(id)?.label || id}</button></li>))}
                  </ul>
                ) : <div className="text-sm text-neutral-500">—</div>}
              </div>
              <div className="text-xs text-neutral-500">Dica: continue clicando para navegar ciclicamente entre conceitos relacionados.</div>
            </div>
          ) : <div className="text-sm text-neutral-500">Selecione um nó no grafo ou pesquise um conceito à esquerda.</div>}
        </section>

        {editing && (
          <div className="col-span-12 bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Dados (JSON)</h3>
              <div className="flex gap-2">
                <button onClick={() => setJsonDraft(JSON.stringify(data, null, 2))} className="rounded-xl border px-3 py-2 hover:bg-neutral-50">Recarregar atuais</button>
                <button onClick={applyJSON} className="rounded-xl border px-3 py-2 bg-neutral-900 text-white">Aplicar</button>
              </div>
            </div>
            <textarea className="w-full h-64 font-mono text-sm p-3 border rounded-xl" value={jsonDraft} onChange={(e) => setJsonDraft(e.target.value)} spellCheck={false} />
            <p className="text-xs text-neutral-500 mt-2">Cole sua base aqui e clique em "Aplicar". Use ids únicos; cada aresta (edge) representa: <code>source influencia target</code>.</p>
          </div>
        )}

        <footer className="col-span-12 text-xs text-neutral-500 flex items-center justify-between pt-2">
          <span>A/G – Grafo de Dependências para Compatibilização (v1)</span>
          <span>Atalhos: clique para navegar • scroll para zoom • arraste para pan</span>
        </footer>
      </div>
    </div>
  )
}
