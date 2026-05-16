import { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, Plus, Trash2, Pencil, Loader2, RefreshCw, UserPlus, Save } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { adminApi, requestsApi, equipmentApi } from "@/lib/api";
import { formatDate, countWords, cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "stats"|"requests"|"students"|"faculty"|"inventory"|"feedback"|"add_user";

// ─── Respond Modal ────────────────────────────────────────────
function RespondModal({ reqId, onClose }: { reqId:string; onClose:()=>void }) {
  const { requests, fetchRequests } = useApp();
  const req = requests.find(r=>r.id===reqId);
  const [action,setAction]=useState<"approve"|"reject"|null>(null);
  const [msg,setMsg]=useState("");
  const [busy,setBusy]=useState(false);
  const wc=countWords(msg);
  const submit=async()=>{
    if(!action){toast.error("Choose approve or reject.");return;}
    if(!msg.trim()){toast.error("Write a message for the student.");return;}
    if(wc>50){toast.error("Message exceeds 50 words.");return;}
    setBusy(true);
    try{
      await requestsApi.labDecision(reqId,action==="approve",msg.trim());
      await fetchRequests();
      toast.success(action==="approve"?"✅ Approved! Student notified.":"❌ Rejected. Student notified.");
      onClose();
    }catch(e:any){toast.error(e.message??"Failed.");}finally{setBusy(false);}
  };
  if(!req)return null;
  return(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div><h2 className="font-display text-lg font-bold">Respond to Request</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{req.studentName} → {req.itemName}</p></div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground"/></button>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 mb-4 text-sm space-y-1">
          <p><span className="text-muted-foreground">Project:</span> <strong>{req.project}</strong></p>
          <p><span className="text-muted-foreground">Purpose:</span> {req.purpose}</p>
          <p><span className="text-muted-foreground">Dates:</span> {formatDate(req.dateFrom)} → {formatDate(req.dateTo)}</p>
          <p><span className="text-muted-foreground">Type:</span> {req.type==="team"?`Team (${req.teamId})`:"Individual"}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["approve","reject"] as const).map(a=>(
            <button key={a} onClick={()=>setAction(a)}
              className={cn("flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all",
                action===a?a==="approve"?"border-status-available bg-status-available/10 text-status-available":"border-status-fault bg-status-fault/10 text-status-fault"
                :"border-border bg-card text-muted-foreground hover:border-border/60")}>
              {a==="approve"?<CheckCircle2 className="h-5 w-5"/>:<XCircle className="h-5 w-5"/>}
              <span className="text-xs font-semibold capitalize">{a}</span>
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Message to Student (max 50 words)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3}
            placeholder="e.g. Approved. Please collect from Lab D301 on Monday at 10am."
            className={cn("w-full rounded-xl border px-3.5 py-2.5 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/40",
              wc>50?"border-status-fault/60":"border-border")}/>
          <p className={cn("text-right text-xs font-mono mt-1",wc>50?"text-status-fault":"text-muted-foreground")}>{wc}/50</p>
        </div>
        <button onClick={submit} disabled={busy}
          className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
          {busy?<><Loader2 className="h-4 w-4 animate-spin"/>Sending…</>:"Send Response"}
        </button>
      </div>
    </div>
  );
}

// ─── Equipment Modal (Add / Edit) ─────────────────────────────
function EquipmentModal({ onClose, onSaved, existing }: { onClose:()=>void; onSaved:()=>void; existing?:any }) {
  const isEdit=!!existing;
  const [f,setF]=useState({
    slug:existing?.slug??"", name:existing?.name??"", category:existing?.category??"",
    description:existing?.description??"", labLocation:existing?.labLocation??"",
    supervisorName:existing?.supervisorName??"", emoji:existing?.emoji??"📦",
    conditionLog:existing?.conditionLog??"",
    typicalUses:(existing?.typicalUses??[]).join(", "),
    availabilityStatus:existing?.availabilityStatus??"available",
  });
  const [busy,setBusy]=useState(false);
  const set=(k:string,v:string)=>setF(p=>({...p,[k]:v}));
  const save=async()=>{
    const req=["slug","name","category","description","labLocation","supervisorName"];
    for(const k of req){if(!(f as any)[k]){toast.error(`${k} is required.`);return;}}
    setBusy(true);
    try{
      const payload={...f,typicalUses:f.typicalUses.split(",").map(s=>s.trim()).filter(Boolean)};
      if(isEdit){await equipmentApi.update(f.slug,payload);toast.success("Equipment updated!");}
      else{await equipmentApi.create(payload);toast.success("Equipment added!");}
      onSaved();onClose();
    }catch(e:any){toast.error(e.message??"Save failed.");}finally{setBusy(false);}
  };
  const statuses=["available","issued","reserved","maintenance"];
  return(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-xl p-6 animate-fade-in my-4">
        <div className="flex items-start justify-between mb-5">
          <div><h2 className="font-display text-lg font-bold">{isEdit?"Edit Equipment":"Add New Equipment"}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{isEdit?"Update equipment details in the database.":"Register new equipment to the inventory."}</p></div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground"/></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[{k:"slug",l:"Equipment ID (slug)"},{k:"emoji",l:"Emoji"}].map(({k,l})=>(
              <div key={k}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{l}{k==="slug"?" *":""}</label>
                <input value={(f as any)[k]} onChange={e=>set(k,e.target.value)} disabled={isEdit&&k==="slug"}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"/>
              </div>
            ))}
          </div>
          {[{k:"name",l:"Equipment Name *"},{k:"category",l:"Category *"},{k:"labLocation",l:"Lab Location *"},{k:"supervisorName",l:"Supervisor Name *"}].map(({k,l})=>(
            <div key={k}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{l}</label>
              <input value={(f as any)[k]} onChange={e=>set(k,e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Availability Status</label>
            <select value={f.availabilityStatus} onChange={e=>set("availabilityStatus",e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize">
              {statuses.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description *</label>
            <textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"/>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Typical Uses <span className="normal-case font-normal">(comma separated)</span></label>
            <input value={f.typicalUses} onChange={e=>set("typicalUses",e.target.value)} placeholder="e.g. IoT Prototyping, Sensor Integration"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Condition Notes</label>
            <input value={f.conditionLog} onChange={e=>set("conditionLog",e.target.value)} placeholder="e.g. Excellent condition, all connectors intact"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/>
          </div>
        </div>
        <button onClick={save} disabled={busy}
          className="w-full mt-5 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
          {busy?<><Loader2 className="h-4 w-4 animate-spin"/>Saving…</>:<><Save className="h-4 w-4"/>{isEdit?"Save Changes":"Add Equipment"}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Add User Modal ───────────────────────────────────────────
function AddUserModal({ onClose, onSaved, defaultRole }: { onClose:()=>void; onSaved:()=>void; defaultRole?:string }) {
  const [f,setF]=useState({ enrollmentId:"", name:"", email:"", password:"", confirmPassword:"",
    role:defaultRole??"STUDENT", department:"", year:"1st", collegeName:"Parul University" });
  const [busy,setBusy]=useState(false);
  const set=(k:string,v:string)=>setF(p=>({...p,[k]:v}));
  const colleges=["Parul University","MS University","SVNIT","PDPU","GEC Vadodara"];
  const depts=["Electronics & Communication","Computer Science","Mechanical","Civil","Instrumentation","Laboratory","Information Technology"];
  const save=async()=>{
    if(!f.enrollmentId||!f.name||!f.password||!f.department){toast.error("Please fill all required fields.");return;}
    if(f.password!==f.confirmPassword){toast.error("Passwords do not match.");return;}
    if(f.password.length<6){toast.error("Password must be at least 6 characters.");return;}
    setBusy(true);
    try{
      await adminApi.createUser({...f,confirmPassword:undefined});
      toast.success(`${f.name} added successfully!`);
      onSaved();onClose();
    }catch(e:any){toast.error(e.message??"Failed.");}finally{setBusy(false);}
  };
  return(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-xl p-6 animate-fade-in my-4">
        <div className="flex items-start justify-between mb-5">
          <div><h2 className="font-display text-lg font-bold">Add New User</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Register with enrollment ID and initial password.</p></div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground"/></button>
        </div>
        {/* Role */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{v:"STUDENT",e:"🎓",l:"Student"},{v:"FACULTY",e:"👨‍🏫",l:"Faculty"},{v:"ADMIN",e:"🛡️",l:"Admin/Lab"}].map(r=>(
            <button key={r.v} onClick={()=>set("role",r.v)}
              className={cn("flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all",
                f.role===r.v?"border-primary bg-primary/8 text-primary":"border-border text-muted-foreground hover:border-primary/40")}>
              <span className="text-xl">{r.e}</span>{r.l}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Enrollment / Employee ID *</label>
              <input value={f.enrollmentId} onChange={e=>set("enrollmentId",e.target.value)} placeholder="e.g. PU-STU-025"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/></div>
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name *</label>
              <input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Riya Shah"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/></div>
          </div>
          <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Email (Optional)</label>
            <input type="email" value={f.email} onChange={e=>set("email",e.target.value)} placeholder="e.g. riya@parul.edu"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">College *</label>
              <select value={f.collegeName} onChange={e=>set("collegeName",e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                {colleges.map(c=><option key={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Department *</label>
              <select value={f.department} onChange={e=>set("department",e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">— Select —</option>
                {depts.map(d=><option key={d}>{d}</option>)}
              </select></div>
          </div>
          {f.role==="STUDENT"&&(
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Year</label>
              <select value={f.year} onChange={e=>set("year",e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                {["1st","2nd","3rd","4th"].map(y=><option key={y}>{y}</option>)}
              </select></div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Password *</label>
              <input type="password" value={f.password} onChange={e=>set("password",e.target.value)} placeholder="Min 6 chars"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/></div>
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Confirm Password *</label>
              <input type="password" value={f.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} placeholder="Repeat"
                className={cn("w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40",
                  f.confirmPassword&&f.password!==f.confirmPassword?"border-status-fault/60":"border-border")}/></div>
          </div>
        </div>
        <button onClick={save} disabled={busy}
          className="w-full mt-5 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
          {busy?<><Loader2 className="h-4 w-4 animate-spin"/>Creating…</>:<><UserPlus className="h-4 w-4"/>Add User</>}
        </button>
      </div>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────
function ResetPwModal({ user, onClose }: { user:{id:string;name:string}; onClose:()=>void }) {
  const [pw,setPw]=useState("");
  const [busy,setBusy]=useState(false);
  const save=async()=>{
    if(pw.length<6){toast.error("Password must be at least 6 characters.");return;}
    setBusy(true);
    try{
      await adminApi.resetUserPassword(user.id,pw);
      toast.success(`Password reset for ${user.name}!`);
      onClose();
    }catch(e:any){toast.error(e.message??"Failed.");}finally{setBusy(false);}
  };
  return(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div><h2 className="font-display text-lg font-bold">Reset Password</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Set new password for <strong>{user.name}</strong></p></div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground"/></button>
        </div>
        <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">New Password *</label>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Min 6 characters"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"/></div>
        <button onClick={save} disabled={busy}
          className="w-full mt-4 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
          {busy?<><Loader2 className="h-4 w-4 animate-spin"/>Saving…</>:"Reset Password"}
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { requests, feedbacks, markFeedbackRead, teams, fetchRequests } = useApp();
  const [tab,        setTab]       = useState<Tab>("stats");
  const [respondId,  setRespondId] = useState<string|null>(null);
  const [showAddEq,  setShowAddEq] = useState(false);
  const [editEq,     setEditEq]    = useState<any>(null);
  const [showAddUser,setShowAddUser]=useState(false);
  const [addRole,    setAddRole]   = useState("STUDENT");
  const [resetPwUser,setResetPwUser]=useState<{id:string;name:string}|null>(null);
  const [equipment,  setEquipment] = useState<any[]>([]);
  const [users,      setUsers]     = useState<any[]>([]);
  const [stats,      setStats]     = useState<any>(null);
  const [loadEq,     setLoadEq]    = useState(false);
  const [loadU,      setLoadU]     = useState(false);
  const unread=feedbacks.filter(f=>!f.read).length;

  const TABS:{id:Tab;label:string}[]=[
    {id:"stats",label:"📊 Statistics"},
    {id:"requests",label:"📋 Requests"},
    {id:"students",label:"🎓 Students"},
    {id:"faculty",label:"👨‍🏫 Faculty"},
    {id:"inventory",label:"🔧 Inventory"},
    {id:"feedback",label:`💬 Feedback${unread?` (${unread})`:""}`},
    {id:"add_user",label:"➕ Add User"},
  ];

  const loadEquip=async()=>{setLoadEq(true);try{setEquipment(await equipmentApi.list());}catch{}finally{setLoadEq(false);}};
  const loadUsers=async(role?:string)=>{setLoadU(true);try{setUsers(await adminApi.users(role?{role}:{}));}catch{}finally{setLoadU(false);}};
  const loadStats=async()=>{try{setStats(await adminApi.stats());}catch{}};

  useEffect(()=>{
    if(tab==="inventory")loadEquip();
    else if(tab==="students")loadUsers("STUDENT");
    else if(tab==="faculty")loadUsers("FACULTY");
    else if(tab==="stats")loadStats();
  },[tab]);

  const deleteEquip=async(slug:string,name:string)=>{
    if(!confirm(`Remove "${name}" from inventory?`))return;
    try{await equipmentApi.remove(slug);toast.success(`${name} removed.`);loadEquip();}
    catch(e:any){toast.error(e.message);}
  };
  const deactivateUser=async(id:string,name:string)=>{
    if(!confirm(`Deactivate "${name}"? They will no longer be able to log in.`))return;
    try{await adminApi.deactivateUser(id);toast.success(`${name} deactivated.`);loadUsers();}
    catch(e:any){toast.error(e.message);}
  };

  return(
    <>
      {respondId    && <RespondModal reqId={respondId} onClose={()=>setRespondId(null)}/>}
      {showAddEq    && <EquipmentModal onClose={()=>setShowAddEq(false)} onSaved={loadEquip}/>}
      {editEq       && <EquipmentModal onClose={()=>setEditEq(null)} onSaved={loadEquip} existing={editEq}/>}
      {showAddUser  && <AddUserModal onClose={()=>setShowAddUser(false)} onSaved={()=>loadUsers()} defaultRole={addRole}/>}
      {resetPwUser  && <ResetPwModal user={resetPwUser} onClose={()=>setResetPwUser(null)}/>}

      <section className="bg-muted/30 border-b border-border py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-bold mb-2">Control Center</h1>
          <p className="text-muted-foreground">Manage equipment, users, requests, and all platform data.</p>
        </div>
      </section>

      <div className="container py-6">
        <div className="flex gap-1 bg-muted/50 border border-border rounded-xl p-1 mb-6 flex-wrap">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={cn("flex-1 min-w-max px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                tab===t.id?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab==="stats" && <StatsTab stats={stats} requests={requests} teams={teams}/>}

        {/* Requests */}
        {tab==="requests" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">{requests.length} total</p>
              <button onClick={fetchRequests} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><RefreshCw className="h-3 w-3"/>Refresh</button>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Request ID</th><th>Student</th><th>Equipment</th><th>Project</th><th>Type</th><th>Dates</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {requests.map((r:any)=>(
                      <tr key={r.id}>
                        <td className="font-mono text-xs">{String(r.id).slice(0,8)}…</td>
                        <td><div className="font-medium">{r.studentName}</div><div className="text-xs text-muted-foreground font-mono">{r.studentId}</div></td>
                        <td>{r.itemName}</td>
                        <td className="max-w-[150px] truncate">{r.project}</td>
                        <td>{r.type==="team"?<span className="team-id-badge text-[10px] py-0.5 px-2">{r.teamId}</span>:<span className="text-xs text-muted-foreground">Individual</span>}</td>
                        <td className="text-xs whitespace-nowrap">{formatDate(r.dateFrom)}<br/>to {formatDate(r.dateTo)}</td>
                        <td><StatusBadge type="request" status={r.status}/></td>
                        <td>
                          {r.status==="pending_lab"&&<button onClick={()=>setRespondId(r.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">Respond</button>}
                          {r.status==="pending_faculty"&&<span className="text-xs text-muted-foreground">Faculty pending</span>}
                          {r.status==="approved"&&<span className="text-xs text-status-available font-medium">✅ Ready</span>}
                          {r.status==="rejected"&&<span className="text-xs text-status-fault font-medium">❌ Rejected</span>}
                        </td>
                      </tr>
                    ))}
                    {requests.length===0&&<tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No requests yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        {tab==="students" && (
          <UsersTab users={users} loading={loadU} roleLabel="Student"
            onAdd={()=>{setAddRole("STUDENT");setShowAddUser(true);}}
            onRefresh={()=>loadUsers("STUDENT")} teams={teams}
            onDeactivate={deactivateUser}
            onResetPw={(id,name)=>setResetPwUser({id,name})}/>
        )}

        {/* Faculty */}
        {tab==="faculty" && (
          <UsersTab users={users} loading={loadU} roleLabel="Faculty"
            onAdd={()=>{setAddRole("FACULTY");setShowAddUser(true);}}
            onRefresh={()=>loadUsers("FACULTY")} teams={teams}
            onDeactivate={deactivateUser}
            onResetPw={(id,name)=>setResetPwUser({id,name})}/>
        )}

        {/* Inventory */}
        {tab==="inventory" && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <p className="text-sm text-muted-foreground">{equipment.length} items</p>
              <div className="flex gap-2">
                <button onClick={loadEquip} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><RefreshCw className="h-3 w-3"/>Refresh</button>
                <button onClick={()=>setShowAddEq(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                  <Plus className="h-3.5 w-3.5"/>Add Equipment
                </button>
              </div>
            </div>
            {loadEq?(
              <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2"/>Loading…</div>
            ):(
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Location</th><th>Status</th><th>Condition</th><th>Supervisor</th><th>Actions</th></tr></thead>
                    <tbody>
                      {equipment.map((h:any)=>(
                        <tr key={h.id}>
                          <td className="font-mono text-xs">{h.slug}</td>
                          <td><span className="mr-1">{h.emoji}</span><span className="font-medium">{h.name}</span></td>
                          <td className="text-muted-foreground">{h.category}</td>
                          <td className="text-muted-foreground text-xs">{h.labLocation}</td>
                          <td><StatusBadge type="availability" status={h.availabilityStatus}/></td>
                          <td className="text-xs text-muted-foreground max-w-[130px] truncate">{h.conditionLog}</td>
                          <td className="text-muted-foreground">{h.supervisorName}</td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <button onClick={()=>setEditEq(h)} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium flex items-center gap-1">
                                <Pencil className="h-3 w-3"/>Edit
                              </button>
                              <button onClick={()=>deleteEquip(h.slug,h.name)} className="text-xs px-2 py-1 rounded bg-status-fault/10 text-status-fault hover:bg-status-fault hover:text-white transition-colors font-medium flex items-center gap-1">
                                <Trash2 className="h-3 w-3"/>Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {equipment.length===0&&<tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No equipment found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {tab==="feedback" && (
          feedbacks.length===0?(
            <div className="text-center py-20 text-muted-foreground"><div className="text-4xl mb-3">💬</div><p>No feedback received yet.</p></div>
          ):(
            <div className="space-y-4">
              {feedbacks.map((f:any)=>(
                <div key={f.id} className={cn("bg-card border rounded-xl p-5",!f.read?"border-primary/40 bg-primary/5":"border-border")}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{f.submittedByName}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground capitalize">{f.role}</span>
                        {!f.read&&<span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded font-semibold">New</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.department} · {f.type} · {new Date(f.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                    {f.rating>0&&<div className="flex gap-0.5">{[1,2,3,4,5].map(n=><span key={n} className={n<=f.rating?"text-yellow-400":"text-muted-foreground/30"}>★</span>)}</div>}
                  </div>
                  <p className="text-sm text-foreground">{f.message}</p>
                  {!f.read&&<button onClick={()=>markFeedbackRead(f.id)} className="mt-3 text-xs text-primary font-medium hover:underline">Mark as read</button>}
                </div>
              ))}
            </div>
          )
        )}

        {/* Add User shortcut */}
        {tab==="add_user" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-4"/>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Add New User</h2>
              <p className="text-muted-foreground text-sm mb-6">Register a new student, faculty member, or lab assistant with their enrollment ID and password.</p>
              <div className="grid grid-cols-3 gap-3">
                {[{r:"STUDENT",e:"🎓",l:"Add Student"},{r:"FACULTY",e:"👨‍🏫",l:"Add Faculty"},{r:"ADMIN",e:"🛡️",l:"Add Lab Asst."}].map(x=>(
                  <button key={x.r} onClick={()=>{setAddRole(x.r);setShowAddUser(true);}}
                    className="flex flex-col items-center gap-2 p-4 bg-primary/8 border border-primary/20 rounded-xl text-primary hover:bg-primary/15 transition-colors">
                    <span className="text-2xl">{x.e}</span>
                    <span className="text-xs font-semibold">{x.l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────
function StatsTab({ stats, requests, teams }: any) {
  const cards=[
    {l:"Total Requests",v:requests.length,c:"bg-primary/10 text-primary",e:"📋"},
    {l:"Pending Faculty",v:requests.filter((r:any)=>r.status==="pending_faculty").length,c:"bg-status-pending/10 text-status-pending",e:"⏳"},
    {l:"Pending Lab",v:requests.filter((r:any)=>r.status==="pending_lab").length,c:"bg-status-issued/10 text-status-issued",e:"🔬"},
    {l:"Approved",v:requests.filter((r:any)=>r.status==="approved").length,c:"bg-status-available/10 text-status-available",e:"✅"},
    {l:"Rejected",v:requests.filter((r:any)=>r.status==="rejected").length,c:"bg-status-fault/10 text-status-fault",e:"❌"},
    {l:"Active Teams",v:teams.filter((t:any)=>t.active).length,c:"bg-status-maintenance/10 text-status-maintenance",e:"👥"},
    ...(stats?[
      {l:"Total Equipment",v:stats.equipment?.total??"—",c:"bg-primary/10 text-primary",e:"📦"},
      {l:"Available Equip.",v:stats.equipment?.available??"—",c:"bg-status-available/10 text-status-available",e:"✅"},
      {l:"Students",v:stats.users?.students??"—",c:"bg-accent/10 text-accent",e:"🎓"},
      {l:"Faculty",v:stats.users?.faculty??"—",c:"bg-status-pending/10 text-status-pending",e:"👨‍🏫"},
      {l:"Unread Feedback",v:stats.feedback?.unread??"—",c:"bg-status-fault/10 text-status-fault",e:"💬"},
    ]:[]),
  ];
  const top=[["ESP32 Wi-Fi Module",85],["STM32 Dev Board",72],["TI IWR6843ISK Radar",65],["Arduino Mega",58],["FPGA Dev Board",45]];
  return(
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(s=>(
          <div key={s.l} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg mx-auto mb-2",s.c)}>{s.e}</div>
            <div className="font-display text-2xl font-bold text-foreground">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Top Requested Equipment</h3>
        <div className="space-y-3">
          {top.map(([name,pct])=>(
            <div key={String(name)}>
              <div className="flex justify-between text-sm mb-1"><span className="text-foreground">{name}</span><span className="text-muted-foreground">{pct}%</span></div>
              <div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────
function UsersTab({ users, loading, roleLabel, onAdd, onRefresh, teams, onDeactivate, onResetPw }: any) {
  const isStudent=roleLabel==="Student";
  return(
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">{users.length} {roleLabel.toLowerCase()}s registered</p>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><RefreshCw className="h-3 w-3"/>Refresh</button>
          <button onClick={onAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
            <UserPlus className="h-3.5 w-3.5"/>Add {roleLabel}
          </button>
        </div>
      </div>
      {loading?(
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2"/>Loading…</div>
      ):(
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Department</th>{isStudent&&<th>Year</th>}<th>College</th>{isStudent&&<th>Active Team</th>}<th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u:any)=>{
                  const team=teams.find((t:any)=>t.active&&t.members?.some((m:any)=>m.id===u.enrollmentId));
                  return(
                    <tr key={u.id}>
                      <td className="font-mono text-xs">{u.enrollmentId}</td>
                      <td><div className="font-medium">{u.name}</div>{u.email&&<div className="text-xs text-muted-foreground">{u.email}</div>}</td>
                      <td className="text-muted-foreground">{u.department}</td>
                      {isStudent&&<td>{u.year??"—"}</td>}
                      <td className="text-xs text-muted-foreground">{u.college}</td>
                      {isStudent&&<td>{team?<span className="team-id-badge text-[10px] py-0.5 px-2">{team.id}</span>:<span className="text-xs text-muted-foreground">None</span>}</td>}
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={()=>onResetPw(u.id,u.name)} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium">Reset PWD</button>
                          <button onClick={()=>onDeactivate(u.id,u.name)} className="text-xs px-2 py-1 rounded bg-status-fault/10 text-status-fault hover:bg-status-fault hover:text-white transition-colors font-medium">Deactivate</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length===0&&<tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No {roleLabel.toLowerCase()}s found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
