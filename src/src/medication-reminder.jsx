import { useState } from "react";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const TIMES = [
  { id: "morning", label: "בוקר",    icon: "🌅", time: "08:00" },
  { id: "noon",    label: "צהריים",  icon: "☀️", time: "13:00" },
  { id: "evening", label: "ערב",     icon: "🌆", time: "19:00" },
  { id: "night",   label: "לילה",    icon: "🌙", time: "22:00" },
];

const EMPTY_SCHEDULE = { morning: false, noon: false, evening: false, night: false };

const PARENTS = {
  mom: {
    key: "mom",
    label: "אמא",
    emoji: "👩",
    accent: "#FF8C42",
    accentDark: "#E85D04",
    gradient: "linear-gradient(135deg, #FF8C42 0%, #FF6B1A 60%, #E85D04 100%)",
    bg: "linear-gradient(135deg, #FFF8F0 0%, #FFF3E8 50%, #FDEBD0 100%)",
    initialMeds: [
      { id: 101, name: "אמלודיפין",   dosage: '5 מ"ג',    color: "#FF6B6B", notes: "לחץ דם"    },
      { id: 102, name: "מטפורמין",    dosage: '500 מ"ג',  color: "#4ECDC4", notes: "סוכרת"    },
      { id: 103, name: "אטורבסטטין", dosage: '20 מ"ג',   color: "#45B7D1", notes: "כולסטרול" },
      { id: 104, name: "אספירין",     dosage: '100 מ"ג',  color: "#96CEB4", notes: "דילול דם" },
    ],
    initialSchedule: {
      101: { morning: true,  noon: false, evening: true,  night: false },
      102: { morning: true,  noon: true,  evening: true,  night: false },
      103: { morning: false, noon: false, evening: false, night: true  },
      104: { morning: true,  noon: false, evening: false, night: false },
    },
  },
  dad: {
    key: "dad",
    label: "אבא",
    emoji: "👨",
    accent: "#3B82F6",
    accentDark: "#1D4ED8",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 60%, #1D4ED8 100%)",
    bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)",
    initialMeds: [
      { id: 201, name: "ליסינופריל", dosage: '10 מ"ג',   color: "#7C3AED", notes: "לחץ דם" },
      { id: 202, name: "אלופורינול", dosage: '300 מ"ג',  color: "#0EA5E9", notes: "גאוט"    },
      { id: 203, name: "אומגה 3",    dosage: '1000 מ"ג', color: "#F59E0B", notes: "לב"      },
    ],
    initialSchedule: {
      201: { morning: true,  noon: false, evening: true,  night: false },
      202: { morning: false, noon: true,  evening: false, night: false },
      203: { morning: true,  noon: false, evening: true,  night: false },
    },
  },
};

function TimeToggles({ sched, setSched, accent, accentDark }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {TIMES.map(t => {
        const active = !!sched[t.id];
        return (
          <button key={t.id} type="button"
            onClick={() => setSched(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
            style={{
              padding: "10px 12px", borderRadius: 12,
              border: `2px solid ${active ? accent : "#ddd"}`,
              background: active ? `${accent}18` : "#FAFAFA",
              color: active ? accentDark : "#999",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.18s",
            }}>
            <span>{t.icon}</span><span>{t.label}</span>
            {active && <span style={{ marginRight: "auto" }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

function ParentApp({ parent, caregiverView }) {
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 0 : today;

  const [activeTab, setActiveTab]         = useState("week");
  const [taken, setTaken]                 = useState({});
  const [meds, setMeds]                   = useState(parent.initialMeds);
  const [schedules, setSchedules]         = useState(parent.initialSchedule);
  const [editingMed, setEditingMed]       = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [editSchedule, setEditSchedule]   = useState({ ...EMPTY_SCHEDULE });
  const [addingNew, setAddingNew]         = useState(false);
  const [newMed, setNewMed]               = useState({ name: "", dosage: "", notes: "", color: parent.accent });
  const [newSchedule, setNewSchedule]     = useState({ ...EMPTY_SCHEDULE });
  const [selectedDay, setSelectedDay]     = useState(todayIdx);

  const toggleTaken = (day, tId, mId) => {
    const key = `${day}-${tId}-${mId}`;
    setTaken(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const isTaken = (day, tId, mId) => !!taken[`${day}-${tId}-${mId}`];

  const totalDoses = (day) => {
    let total = 0, done = 0;
    TIMES.forEach(t => meds.forEach(m => {
      if (schedules[m.id]?.[t.id]) { total++; if (isTaken(day, t.id, m.id)) done++; }
    }));
    return { total, done };
  };

  const overallPct = () => {
    let total = 0, done = 0;
    DAYS.forEach((_, i) => { const d = totalDoses(i); total += d.total; done += d.done; });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const startEdit = (med) => { setEditingMed(med.id); setEditForm({ ...med }); setEditSchedule({ ...EMPTY_SCHEDULE, ...(schedules[med.id] || {}) }); };
  const saveEdit  = () => { setMeds(prev => prev.map(m => m.id === editingMed ? { ...editForm } : m)); setSchedules(prev => ({ ...prev, [editingMed]: { ...editSchedule } })); setEditingMed(null); };
  const deleteMed = (id) => { setMeds(prev => prev.filter(m => m.id !== id)); setEditingMed(null); };
  const addMed    = () => {
    if (!newMed.name) return;
    const id = Date.now();
    setMeds(prev => [...prev, { ...newMed, id }]);
    setSchedules(prev => ({ ...prev, [id]: { ...newSchedule } }));
    setNewMed({ name: "", dosage: "", notes: "", color: parent.accent });
    setNewSchedule({ ...EMPTY_SCHEDULE });
    setAddingNew(false);
  };

  const pct = overallPct();
  const dayP = totalDoses(selectedDay);
  const { accent, accentDark, gradient, bg } = parent;

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 12,
    border: `2px solid ${accent}50`, fontSize: 15, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", background: "#FAFAFA",
  };

  return (
    <div style={{ background: bg, minHeight: "100%" }}>
      {/* Parent sub-nav */}
      <div style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)", borderBottom: `3px solid ${accent}25`, padding: "12px 18px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", marginBottom: 4 }}>
                <span>התקדמות שבועית</span>
                <span style={{ fontWeight: 800, color: accentDark }}>{pct}%</span>
              </div>
              <div style={{ background: `${accent}22`, borderRadius: 10, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: gradient, borderRadius: 10, transition: "width 0.5s ease" }} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: accent, minWidth: 48, textAlign: "center" }}>{pct}%</div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {[{ id: "week", label: "📅 שבועי" }, { id: "today", label: "⏰ היום" }, { id: "meds", label: "💊 תרופות" }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: "8px 6px", borderRadius: 12,
                background: activeTab === tab.id ? gradient : "transparent",
                color: activeTab === tab.id ? "#fff" : accentDark,
                border: `2px solid ${activeTab === tab.id ? accent : accent + "40"}`,
                fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 16px 28px" }}>

        {/* ═══ WEEK ═══ */}
        {activeTab === "week" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {DAYS.map((day, di) => {
                const dp = totalDoses(di);
                const dpct = dp.total > 0 ? (dp.done / dp.total) * 100 : 0;
                const isToday = di === todayIdx, isSel = di === selectedDay;
                return (
                  <button key={di} onClick={() => setSelectedDay(di)} style={{
                    flex: "0 0 auto", width: 68, padding: "8px 4px", borderRadius: 14,
                    border: `2px solid ${isSel ? accent : "transparent"}`,
                    background: isSel ? gradient : isToday ? `${accent}15` : "#fff",
                    color: isSel ? "#fff" : "#2d2d2d", cursor: "pointer", textAlign: "center",
                    boxShadow: isSel ? `0 4px 14px ${accent}44` : "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, opacity: 0.85 }}>{day}</div>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: isSel ? "rgba(255,255,255,0.25)" : `${accent}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 4px", fontSize: 12, fontWeight: 800,
                    }}>{dp.total > 0 ? `${dp.done}/${dp.total}` : "—"}</div>
                    {isToday && <div style={{ fontSize: 8, opacity: 0.8 }}>• היום</div>}
                    <div style={{ height: 4, background: isSel ? "rgba(255,255,255,0.3)" : "#e0e0e0", borderRadius: 4, marginTop: 4, overflow: "hidden" }}>
                      <div style={{ width: `${dpct}%`, height: "100%", background: isSel ? "#fff" : accent, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ background: "#fff", borderRadius: 22, padding: 18, boxShadow: "0 4px 18px rgba(0,0,0,0.07)", border: `2px solid ${accent}18` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                  יום {DAYS[selectedDay]}
                  {selectedDay === todayIdx && <span style={{ fontSize: 12, color: accent, marginRight: 8, fontWeight: 600 }}>• היום</span>}
                </h2>
                <div style={{
                  background: dayP.done === dayP.total && dayP.total > 0 ? "linear-gradient(135deg,#4CAF50,#45a049)" : gradient,
                  color: "#fff", borderRadius: 18, padding: "4px 12px", fontSize: 13, fontWeight: 700,
                }}>
                  {dayP.done === dayP.total && dayP.total > 0 ? "✅ הכל נלקח!" : `${dayP.done}/${dayP.total} נלקחו`}
                </div>
              </div>
              {TIMES.map(t => {
                const tMeds = meds.filter(m => schedules[m.id]?.[t.id]);
                if (!tMeds.length) return null;
                return (
                  <div key={t.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "5px 10px", background: `${accent}10`, borderRadius: 10 }}>
                      <span style={{ fontSize: 17 }}>{t.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</span>
                      <span style={{ fontSize: 12, color: "#888", marginRight: "auto" }}>{t.time}</span>
                    </div>
                    {tMeds.map(med => {
                      const done = isTaken(selectedDay, t.id, med.id);
                      return (
                        <div key={med.id} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 6,
                          background: done ? "rgba(76,175,80,0.07)" : "#FAFAFA", borderRadius: 14,
                          border: `2px solid ${done ? "#4CAF50" : med.color + "40"}`, transition: "all 0.2s",
                        }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: med.color, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{med.name}</div>
                            <div style={{ fontSize: 12, color: "#888" }}>{med.dosage} • {med.notes}</div>
                          </div>
                          <button onClick={() => toggleTaken(selectedDay, t.id, med.id)} style={{
                            width: 46, height: 46, borderRadius: "50%", border: "none", cursor: "pointer",
                            background: done ? "linear-gradient(135deg,#4CAF50,#45a049)" : "linear-gradient(135deg,#f0ece8,#e4ddd4)",
                            color: done ? "#fff" : "#bbb", fontSize: 20,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: done ? "0 4px 12px rgba(76,175,80,0.4)" : "0 2px 6px rgba(0,0,0,0.07)",
                            transform: done ? "scale(1.08)" : "scale(1)", transition: "all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
                          }}>{done ? "✓" : "○"}</button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ TODAY ═══ */}
        {activeTab === "today" && (
          <div>
            <div style={{ background: gradient, borderRadius: 22, padding: "18px 22px", color: "#fff", marginBottom: 16, textAlign: "center", boxShadow: `0 8px 24px ${accent}44` }}>
              <div style={{ fontSize: 42 }}>{dayP.done === dayP.total && dayP.total > 0 ? "🎉" : "💊"}</div>
              <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>{dayP.done}/{dayP.total}</div>
              <div style={{ fontSize: 15, opacity: 0.9, marginTop: 4 }}>
                {dayP.done === dayP.total && dayP.total > 0
                  ? "כל התרופות נלקחו! כל הכבוד!"
                  : `נשארו ${dayP.total - dayP.done} תרופות להיום`}
              </div>
              <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, height: 10, overflow: "hidden", marginTop: 12 }}>
                <div style={{ width: `${dayP.total > 0 ? (dayP.done / dayP.total) * 100 : 0}%`, height: "100%", background: "#fff", borderRadius: 10, transition: "width 0.5s" }} />
              </div>
            </div>
            {TIMES.map(t => {
              const tMeds = meds.filter(m => schedules[m.id]?.[t.id]);
              if (!tMeds.length) return null;
              const allDone = tMeds.every(m => isTaken(todayIdx, t.id, m.id));
              return (
                <div key={t.id} style={{ background: "#fff", borderRadius: 18, padding: 14, marginBottom: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.05)", border: allDone ? "2px solid #4CAF50" : `2px solid ${accent}22`, opacity: allDone ? 0.85 : 1, transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{t.time}</div>
                    </div>
                    {allDone && <span style={{ marginRight: "auto", fontSize: 12, color: "#4CAF50", fontWeight: 700 }}>✅ הושלם</span>}
                  </div>
                  {tMeds.map(med => {
                    const done = isTaken(todayIdx, t.id, med.id);
                    return (
                      <button key={med.id} onClick={() => toggleTaken(todayIdx, t.id, med.id)} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", marginBottom: 6, borderRadius: 14, border: "none",
                        background: done ? "rgba(76,175,80,0.1)" : `${med.color}10`, cursor: "pointer", textAlign: "right",
                        boxShadow: done ? "inset 0 0 0 2px #4CAF5055" : `inset 0 0 0 2px ${med.color}30`,
                        transition: "all 0.2s",
                      }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: done ? "#4CAF50" : med.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: done ? "#4CAF50" : "#1a1a2e" }}>{done && "✓ "}{med.name}</div>
                          <div style={{ fontSize: 12, color: "#999" }}>{med.dosage}</div>
                        </div>
                        <div style={{
                          width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                          background: done ? "linear-gradient(135deg,#4CAF50,#45a049)" : `linear-gradient(135deg,${med.color},${med.color}bb)`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff",
                          boxShadow: done ? "0 4px 14px rgba(76,175,80,0.4)" : `0 4px 14px ${med.color}55`,
                          transform: done ? "scale(1.1)" : "scale(1)", transition: "all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
                        }}>{done ? "✓" : "💊"}</div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ MEDS ═══ */}
        {activeTab === "meds" && (
          <div>
            {caregiverView && (
              <div style={{ background: `${accent}12`, border: `2px solid ${accent}35`, borderRadius: 14, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>👨‍⚕️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>מצב מטפל פעיל</div>
                  <div style={{ fontSize: 12, color: "#666" }}>ניתן לערוך, להוסיף ולמחוק תרופות</div>
                </div>
              </div>
            )}

            {meds.map(med => (
              <div key={med.id} style={{ background: "#fff", borderRadius: 18, padding: 14, marginBottom: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.05)", border: `2px solid ${med.color}28` }}>
                {editingMed === med.id ? (
                  <div>
                    <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                      {[{ key: "name", label: "שם התרופה", ph: "אמלודיפין" }, { key: "dosage", label: "מינון", ph: '5 מ"ג' }, { key: "notes", label: "הערות", ph: "לחץ דם" }].map(f => (
                        <div key={f.key}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{f.label}</label>
                          <input value={editForm[f.key] || ""} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={inputStyle} />
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>זמני נטילה</label>
                        <TimeToggles sched={editSchedule} setSched={setEditSchedule} accent={accent} accentDark={accentDark} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>צבע</label>
                        <input type="color" value={editForm.color || accent} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} style={{ width: 50, height: 34, borderRadius: 8, border: "none", cursor: "pointer" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4CAF50,#45a049)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>✓ שמור</button>
                      <button onClick={() => setEditingMed(null)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "2px solid #ddd", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>ביטול</button>
                      <button onClick={() => deleteMed(med.id)} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#FF5252,#D32F2F)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🗑️</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${med.color},${med.color}bb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💊</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{med.name}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>{med.dosage} • {med.notes}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                        {Object.entries(schedules[med.id] || {}).filter(([, v]) => v).map(([tid]) => {
                          const tf = TIMES.find(x => x.id === tid);
                          return tf ? <span key={tid} style={{ background: `${med.color}20`, color: med.color, borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{tf.icon} {tf.label}</span> : null;
                        })}
                      </div>
                    </div>
                    {caregiverView && (
                      <button onClick={() => startEdit(med)} style={{ padding: "8px 12px", borderRadius: 10, border: `2px solid ${med.color}40`, background: `${med.color}10`, color: med.color, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✏️ ערוך</button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {caregiverView && (
              addingNew ? (
                <div style={{ background: "#fff", borderRadius: 18, padding: 14, border: `2px dashed ${accent}`, boxShadow: `0 4px 14px ${accent}18` }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, color: accentDark }}>➕ תרופה חדשה</div>
                  <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                    {[{ key: "name", label: "שם התרופה", ph: "שם התרופה" }, { key: "dosage", label: "מינון", ph: "כמות ומינון" }, { key: "notes", label: "הערות", ph: "מטרת התרופה" }].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{f.label}</label>
                        <input value={newMed[f.key]} onChange={e => setNewMed(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={inputStyle} />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>זמני נטילה</label>
                      <TimeToggles sched={newSchedule} setSched={setNewSchedule} accent={accent} accentDark={accentDark} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={addMed} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: gradient, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>➕ הוסף</button>
                    <button onClick={() => setAddingNew(false)} style={{ padding: "11px 14px", borderRadius: 10, border: "2px solid #ddd", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>ביטול</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingNew(true)} style={{ width: "100%", padding: "14px", borderRadius: 18, border: `2px dashed ${accent}`, background: `${accent}07`, color: accentDark, fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
                  ➕ הוסף תרופה חדשה
                </button>
              )
            )}
          </div>
        )}

        {/* Caregiver weekly report */}
        {caregiverView && activeTab !== "meds" && (
          <div style={{ background: "#fff", borderRadius: 18, padding: 14, marginTop: 16, boxShadow: "0 4px 14px rgba(0,0,0,0.05)", border: `2px solid ${accent}22` }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>👨‍⚕️ דוח מטפל שבועי</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "ימים מלאים", val: DAYS.filter((_, i) => { const d = totalDoses(i); return d.total > 0 && d.done === d.total; }).length, color: "#4CAF50" },
                { label: "אחוז ציות",  val: `${pct}%`, color: accent },
                { label: "תרופות",      val: meds.length, color: "#45B7D1" },
              ].map((s, i) => (
                <div key={i} style={{ background: `${s.color}10`, borderRadius: 12, padding: "10px 8px", textAlign: "center", border: `1px solid ${s.color}30` }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MedicationApp() {
  const [activeParent, setActiveParent] = useState("mom");
  const [caregiverView, setCaregiverView] = useState(false);
  const p = PARENTS[activeParent];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", fontFamily: "'Segoe UI','Arial Hebrew',Tahoma,sans-serif" }}>

      {/* ═══ MAIN HEADER ═══ */}
      <div style={{ background: p.gradient, boxShadow: `0 4px 22px ${p.accent}55`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "14px 18px 0" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>💊</span>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>תרופות שבועיות</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>מעקב נטילה — שבוע נוכחי</div>
              </div>
            </div>
            <button onClick={() => setCaregiverView(!caregiverView)} style={{
              background: caregiverView ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
              color: caregiverView ? p.accentDark : "#fff",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 18, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
            }}>
              {caregiverView ? "👨‍⚕️ מטפל" : "👁️ מטפל"}
            </button>
          </div>

          {/* ═══ PARENT SWITCHER ═══ */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 0 }}>
            {Object.values(PARENTS).map(par => {
              const isActive = activeParent === par.key;
              return (
                <button key={par.key} onClick={() => setActiveParent(par.key)} style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "16px 16px 0 0",
                  border: "none",
                  background: isActive ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.12)",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderBottom: isActive ? "3px solid #fff" : "3px solid transparent",
                }}>
                  <span style={{ fontSize: 28 }}>{par.emoji}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{par.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{par.initialMeds.length} תרופות</div>
                  </div>
                  {isActive && <div style={{ marginRight: "auto", width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ParentApp key={activeParent} parent={p} caregiverView={caregiverView} />

      <div style={{ textAlign: "center", padding: "8px 20px 24px", color: "#999", fontSize: 12 }}>
        לחצ/י לסימון תרופות • מצב מטפל לעריכה
      </div>
    </div>
  );
}
