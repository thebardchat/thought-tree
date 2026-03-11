import { useState, useRef, useCallback } from "react";

const NW = 170, NH = 52;
let _id = 2;
const gid = () => `n${_id++}`;

export default function ThoughtTree() {
  const [nodes, setNodes] = useState([
    { id: "root", x: 420, y: 280, text: "BRAIN DUMP", parentId: null }
  ]);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [drag, setDrag] = useState(null);
  const containerRef = useRef(null);

  const addChild = (parentId, px, py, e) => {
    e?.stopPropagation();
    const angle = (Math.random() * Math.PI * 1.5) - Math.PI * 0.75;
    const dist = 190 + Math.random() * 60;
    const nx = { id: gid(), x: px + Math.cos(angle) * dist, y: py + Math.sin(angle) * dist, text: "", parentId };
    setNodes(p => [...p, nx]);
    setTimeout(() => { setEditing(nx.id); setEditText(""); }, 30);
  };

  const deleteNode = (id, e) => {
    e?.stopPropagation();
    setNodes(p => {
      const kill = new Set();
      const walk = (nid) => { kill.add(nid); p.filter(n => n.parentId === nid).forEach(n => walk(n.id)); };
      walk(id);
      return p.filter(n => !kill.has(n.id));
    });
  };

  const commitEdit = () => {
    if (!editing) return;
    setNodes(p => p.map(n => n.id === editing ? { ...n, text: editText.trim() || "..." } : n));
    setEditing(null);
  };

  const onMouseDown = (e, id) => {
    if (["BUTTON","TEXTAREA","INPUT"].includes(e.target.tagName)) return;
    e.preventDefault(); e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    setDrag({ id, ox: e.clientX - node.x, oy: e.clientY - node.y });
  };

  const onMouseMove = useCallback((e) => {
    if (!drag) return;
    setNodes(p => p.map(n => n.id === drag.id ? { ...n, x: e.clientX - drag.ox, y: e.clientY - drag.oy } : n));
  }, [drag]);

  const onDblClickCanvas = (e) => {
    if (e.target !== containerRef.current && !e.target.tagName?.match(/^(svg|SVG)$/)) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = { id: gid(), x: e.clientX - rect.left - NW/2, y: e.clientY - rect.top - NH/2, text: "", parentId: null };
    setNodes(p => [...p, nx]);
    setTimeout(() => { setEditing(nx.id); setEditText(""); }, 30);
  };

  const clearAll = () => setNodes([{ id: "root", x: 420, y: 280, text: "BRAIN DUMP", parentId: null }]);

  return (
    <div ref={containerRef}
      style={{ width:"100vw", height:"100vh", background:"#080808", position:"relative", overflow:"hidden",
        fontFamily:"'Courier New',monospace", cursor:"crosshair",
        backgroundImage:"radial-gradient(circle at 50% 50%, #111 0%, #080808 100%)" }}
      onMouseMove={onMouseMove} onMouseUp={() => setDrag(null)} onDoubleClick={onDblClickCanvas}>

      {/* Grid texture */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.04,pointerEvents:"none"}}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f59e0b" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      {/* HUD */}
      <div style={{position:"absolute",top:16,left:16,color:"#2a2a2a",fontSize:10,lineHeight:2,zIndex:100,pointerEvents:"none",letterSpacing:1}}>
        DBL-CLICK CANVAS → NEW NODE &nbsp;·&nbsp; + → BRANCH &nbsp;·&nbsp; DRAG → MOVE &nbsp;·&nbsp; DBL-CLICK NODE → EDIT &nbsp;·&nbsp; × → DELETE
      </div>
      <button onClick={clearAll} style={{position:"absolute",top:14,right:16,background:"transparent",border:"1px solid #2a2a2a",color:"#444",
        fontSize:10,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit",letterSpacing:1,zIndex:100}}>
        CLEAR
      </button>

      {/* Connectors */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:2}}>
        {nodes.filter(n=>n.parentId).map(n => {
          const p = nodes.find(x=>x.id===n.parentId);
          if (!p) return null;
          const x1=p.x+NW/2, y1=p.y+NH/2, x2=n.x+NW/2, y2=n.y+NH/2;
          const mx=(x1+x2)/2;
          return (
            <g key={n.id}>
              <path d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                fill="none" stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.25} strokeDasharray="5 3"/>
              <circle cx={x2} cy={y2} r={2} fill="#f59e0b" opacity={0.4}/>
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const isRoot = node.id === "root";
        const isDragging = drag?.id === node.id;
        return (
          <div key={node.id}
            onMouseDown={e => onMouseDown(e, node.id)}
            onDoubleClick={e => { e.stopPropagation(); setEditing(node.id); setEditText(node.text === "..." ? "" : node.text); }}
            style={{
              position:"absolute", left:node.x, top:node.y, width:NW, zIndex: isDragging ? 999 : 10,
              background: isRoot ? "#120e00" : "#0e0e0e",
              border: `1px solid ${isRoot ? "#f59e0b" : "#222"}`,
              borderRadius:3, padding:"10px 12px 8px",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect:"none",
              boxShadow: isRoot ? "0 0 30px #f59e0b22, inset 0 0 20px #f59e0b08" : isDragging ? "0 8px 30px #000" : "none",
              transition: isDragging ? "none" : "box-shadow 0.2s"
            }}>
            {editing === node.id ? (
              <textarea autoFocus value={editText}
                onChange={e=>setEditText(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();commitEdit();} if(e.key==="Escape")setEditing(null); }}
                style={{ background:"transparent",border:"none",outline:"none",color:"#f59e0b",
                  fontFamily:"inherit",fontSize:12,width:"100%",resize:"none",minHeight:30,lineHeight:1.5 }}
                rows={2}/>
            ) : (
              <div style={{ color: isRoot ? "#f59e0b" : "#aaa", fontSize: isRoot ? 12 : 12,
                fontWeight: isRoot ? "bold" : "normal", letterSpacing: isRoot ? 3 : 0.5,
                lineHeight:1.5, minHeight:20, wordBreak:"break-word" }}>
                {node.text || <span style={{opacity:0.2}}>...</span>}
              </div>
            )}
            <div style={{display:"flex",gap:4,marginTop:8,justifyContent:"flex-end"}}>
              <button onClick={e=>addChild(node.id,node.x,node.y,e)}
                style={{background:"#1a1200",border:"1px solid #f59e0b44",color:"#f59e0b",
                  fontSize:12,padding:"1px 7px",cursor:"pointer",borderRadius:2,fontFamily:"inherit",lineHeight:1.6}}>
                +</button>
              {!isRoot && (
                <button onClick={e=>deleteNode(node.id,e)}
                  style={{background:"#111",border:"1px solid #222",color:"#333",
                    fontSize:12,padding:"1px 6px",cursor:"pointer",borderRadius:2,fontFamily:"inherit",lineHeight:1.6}}>
                  ×</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
