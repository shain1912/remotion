import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TEMPLATES, exportScene, Field } from './schema';

// ---------- types ----------
type Section = { id: string; title: string };
type Project = {
  id: string; title: string; template: 'montage' | 'slides' | 'theory';
  lang: string; format: { width: number; height: number; fps: number };
  voice: { voiceId: string; model: string; speed: number; pitch: number; vol: number; emotion?: string };
  style: any; sections: Section[]; scenes: any[]; _seq: number;
};

const API = '';
const uid = (p: Project) => { p._seq = (p._seq || 0) + 1; return 's' + String(p._seq).padStart(2, '0'); };

function blankProject(template: 'montage' | 'slides' | 'theory'): Project {
  const t = TEMPLATES[template];
  return {
    id: '', title: '', template, lang: 'ko',
    format: { width: 1920, height: 1080, fps: 30 },
    voice: { voiceId: 'shainvoice01', model: 'speech-2.6-hd', speed: 1.12, pitch: 1, vol: 1.1 },
    style: { accent: t.accent, ...(t.bg ? { bg: t.bg } : {}), ...(t.imageSuffix ? { imageSuffix: t.imageSuffix } : {}) },
    sections: [{ id: 'main', title: '본문' }], scenes: [], _seq: 0,
  };
}

// map an engine project.json -> editor project (reverse of export)
function importProject(p: any): Project {
  const ep = blankProject(p.template || 'montage');
  ep.id = p.id || ''; ep.title = p.title || '';
  ep.format = p.format || ep.format;
  ep.voice = { ...ep.voice, ...(p.voice || {}) };
  ep.style = { ...ep.style, ...(p.style || {}) };
  const secIds = Array.from(new Set((p.scenes || []).map((s: any) => s.section).filter(Boolean)));
  ep.sections = p.sections || (secIds.length ? secIds.map((id: any) => ({ id, title: id })) : [{ id: 'main', title: '본문' }]);
  ep.scenes = (p.scenes || []).map((s: any, i: number) => {
    const e: any = { ...s, section: s.section || ep.sections[0].id };
    if (s.video) { e._useVideo = true; e._videoPrompt = s.video.prompt; delete e.video; }
    if (s.stat) { e._statValue = s.stat.value; e._statLabel = s.stat.label; delete e.stat; }
    return e;
  });
  ep._seq = ep.scenes.length;
  return ep;
}

function exportProject(p: Project): any {
  const ordered: any[] = [];
  for (const sec of p.sections) for (const s of p.scenes.filter((x) => x.section === sec.id)) {
    ordered.push({ section: sec.id, ...exportScene(p.template, s) });
  }
  return {
    id: p.id, title: p.title, template: p.template, lang: p.lang,
    format: p.format, voice: p.voice, style: p.style,
    sections: p.sections, scenes: ordered,
  };
}

// ---------- small UI atoms ----------
const Help: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="help">{children}</div>;

const FieldInput: React.FC<{ f: Field; value: any; onChange: (v: any) => void }> = ({ f, value, onChange }) => {
  if (f.type === 'textarea') return <textarea className="in" placeholder={f.example} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === 'select') return <select className="in" value={value || f.options?.[0]} onChange={(e) => onChange(e.target.value)}>{f.options!.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  if (f.type === 'toggle') return <label className="tgl"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> <span>{f.label}</span></label>;
  if (f.type === 'bullets') {
    const arr: string[] = value || [];
    return (
      <div className="bullets">
        {arr.map((b, i) => (
          <div key={i} className="brow">
            <input className="in" value={b} placeholder={f.example} onChange={(e) => { const n = [...arr]; n[i] = e.target.value; onChange(n); }} />
            <button className="x" onClick={() => onChange(arr.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button className="ghost sm" onClick={() => onChange([...arr, ''])}>+ 불릿 추가</button>
      </div>
    );
  }
  return <input className="in" placeholder={f.example} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
};

// ---------- main ----------
export const Studio: React.FC = () => {
  const [project, setProject] = useState<Project>(blankProject('montage'));
  const [step, setStep] = useState(0);
  const [advScene, setAdvScene] = useState<Record<string, boolean>>({});
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [previewBust, setPreviewBust] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const tpl = TEMPLATES[project.template];
  const set = (patch: Partial<Project>) => setProject((p) => ({ ...p, ...patch }));
  const setScene = (id: string, patch: any) => setProject((p) => ({ ...p, scenes: p.scenes.map((s) => s.id === id ? { ...s, ...patch } : s) }));

  useEffect(() => { fetch(API + '/api/projects').then((r) => r.json()).then(setProjects).catch(() => {}); }, [busy]);
  useEffect(() => { logRef.current?.scrollTo(0, 1e6); }, [log]);

  // ----- scene ops -----
  const addScene = (sectionId: string) => setProject((p) => {
    const s = { ...tpl.newScene(p._seq + 1), id: uid(p), section: sectionId };
    return { ...p, scenes: [...p.scenes, s] };
  });
  const delScene = (id: string) => setProject((p) => ({ ...p, scenes: p.scenes.filter((s) => s.id !== id) }));
  const moveScene = (id: string, dir: -1 | 1) => setProject((p) => {
    const arr = [...p.scenes]; const i = arr.findIndex((s) => s.id === id); const j = i + dir;
    if (j < 0 || j >= arr.length) return p;[arr[i], arr[j]] = [arr[j], arr[i]]; return { ...p, scenes: arr };
  });
  const addSection = () => setProject((p) => ({ ...p, sections: [...p.sections, { id: 'sec' + (p.sections.length + 1), title: '새 섹션 ' + (p.sections.length + 1) }] }));
  const delSection = (sid: string) => setProject((p) => p.sections.length <= 1 ? p : ({ ...p, sections: p.sections.filter((s) => s.id !== sid), scenes: p.scenes.filter((s) => s.section !== sid) }));

  // ----- examples -----
  const loadExample = async (id: string) => {
    const p = await fetch(API + '/api/projects/' + id).then((r) => r.json());
    setProject(importProject(p)); setStep(1);
  };

  // ----- save / run -----
  const exported = useMemo(() => exportProject(project), [project]);
  const valid = project.id && project.title && project.scenes.length > 0;

  const save = async () => {
    await fetch(API + '/api/projects/' + project.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(exported) });
    setLog((l) => [...l, '✓ 저장됨: factory/projects/' + project.id + '/project.json']);
  };
  const run = async (kind: 'build' | 'render', qs = '') => {
    if (!project.id) return;
    await save();
    setBusy(true); setLog((l) => [...l, `▶ ${kind} 시작…`]);
    esRef.current?.close();
    const es = new EventSource(`${API}/api/${kind}/${project.id}${qs}`);
    esRef.current = es;
    es.addEventListener('log', (e: any) => setLog((l) => [...l, JSON.parse(e.data)]));
    es.addEventListener('done', (e: any) => { const { code } = JSON.parse(e.data); setLog((l) => [...l, code === 0 ? `✅ ${kind} 완료` : `❌ ${kind} 실패 (code ${code})`]); es.close(); setBusy(false); if (kind === 'render') setPreviewBust(Date.now()); });
    es.onerror = () => { setLog((l) => [...l, '⚠ 연결 끊김 (백엔드 server.mjs 실행 중인지 확인)']); es.close(); setBusy(false); };
  };

  const steps = ['시작', '섹션 · 장면', '고급 옵션', '생성'];

  return (
    <div className="studio">
      <header className="top">
        <div className="brand">🏭 Factory <b>Studio</b></div>
        <nav className="steps">{steps.map((s, i) => (
          <button key={s} className={'stp' + (i === step ? ' on' : '')} onClick={() => setStep(i)}><span>{i + 1}</span>{s}</button>
        ))}</nav>
        <div className="right">{project.id ? <span className="pill">{project.template} · {project.scenes.length}컷</span> : null}</div>
      </header>

      <main className="body">
        {/* STEP 0 — 시작 */}
        {step === 0 && (
          <div className="pane center">
            <h1>어떤 영상을 만들까요?</h1>
            <div className="cards">
              {Object.values(TEMPLATES).map((t) => (
                <button key={t.key} className={'card' + (project.template === t.key ? ' sel' : '')} style={{ ['--ac' as any]: t.accent }} onClick={() => set({ template: t.key, style: blankProject(t.key).style })}>
                  <div className="ctag">{t.tagline}</div>
                  <div className="cname">{t.name}</div>
                  <div className="cdesc">{t.desc}</div>
                  <div className="cmeta"><span>🎯 {t.niche}</span><span>💸 {t.cost}</span></div>
                </button>
              ))}
            </div>
            <div className="row2">
              <label className="lbl">제목<input className="in" placeholder="예: 깃 명령어 외우던 시대는 끝났다" value={project.title} onChange={(e) => set({ title: e.target.value })} /></label>
              <label className="lbl">프로젝트 ID<input className="in" placeholder="예: git-vibe (영문·숫자·-)" value={project.id} onChange={(e) => set({ id: e.target.value.replace(/[^a-z0-9-_]/gi, '') })} /></label>
            </div>
            <Help>입력 항목엔 예시가 회색으로 적혀 있습니다. 생략 가능한 항목은 각 장면의 <b>고급 옵션</b>에 숨겨져 있어요.</Help>
            <div className="acts">
              <button className="primary" disabled={!project.id || !project.title} onClick={() => setStep(1)}>다음 →</button>
            </div>
            {projects.length > 0 && (
              <div className="examples">
                <div className="exh">예시로 시작 (기존 프로젝트 불러오기)</div>
                <div className="exrow">{projects.map((p) => <button key={p.id} className="ex" onClick={() => loadExample(p.id)}>{p.template} · {p.title || p.id}</button>)}</div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1 — 섹션 · 장면 */}
        {step === 1 && (
          <div className="pane">
            <div className="secbar">
              <div className="sbh">섹션 <span className="muted">(30분 영상은 섹션별로 나눠 뽑고 합칩니다 — 한 섹션만 수정·재렌더 가능)</span></div>
              <div className="secs">
                {project.sections.map((sec) => (
                  <div key={sec.id} className="sec">
                    <input className="in sectitle" value={sec.title} onChange={(e) => set({ sections: project.sections.map((x) => x.id === sec.id ? { ...x, title: e.target.value } : x) })} />
                    <span className="muted sm">{project.scenes.filter((s) => s.section === sec.id).length}컷</span>
                    {project.sections.length > 1 && <button className="x" onClick={() => delSection(sec.id)}>✕</button>}
                  </div>
                ))}
                <button className="ghost sm" onClick={addSection}>+ 섹션</button>
              </div>
            </div>

            {project.sections.map((sec) => (
              <section key={sec.id} className="scenesec">
                <h3>{sec.title}</h3>
                {project.scenes.filter((s) => s.section === sec.id).map((s) => {
                  const showAdv = advScene[s.id];
                  return (
                    <div key={s.id} className="scene">
                      <div className="shd">
                        <b>{s.id}</b>
                        <div className="smove">
                          <button className="ghost xs" onClick={() => moveScene(s.id, -1)}>↑</button>
                          <button className="ghost xs" onClick={() => moveScene(s.id, 1)}>↓</button>
                          {project.sections.length > 1 && (
                            <select className="in xs" value={s.section} onChange={(e) => setScene(s.id, { section: e.target.value })}>
                              {project.sections.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
                            </select>
                          )}
                          <button className="x" onClick={() => delScene(s.id)}>삭제</button>
                        </div>
                      </div>
                      <div className="fields">
                        {tpl.sceneFields.filter((f) => !f.advanced && (!f.showIf || f.showIf(s))).map((f) => (
                          <label key={f.key} className="fld"><span>{f.label}</span><FieldInput f={f} value={s[f.key]} onChange={(v) => setScene(s.id, { [f.key]: v })} /></label>
                        ))}
                      </div>
                      {tpl.sceneFields.some((f) => f.advanced && (!f.showIf || f.showIf(s))) && (
                        <button className="advtgl" onClick={() => setAdvScene((a) => ({ ...a, [s.id]: !a[s.id] }))}>{showAdv ? '▾' : '▸'} 고급 옵션</button>
                      )}
                      {showAdv && (
                        <div className="fields adv">
                          {tpl.sceneFields.filter((f) => f.advanced && (!f.showIf || f.showIf(s))).map((f) => (
                            <label key={f.key} className="fld"><span>{f.label}</span><FieldInput f={f} value={s[f.key]} onChange={(v) => setScene(s.id, { [f.key]: v })} /></label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="ghost" onClick={() => addScene(sec.id)}>+ 장면 추가</button>
              </section>
            ))}
            <div className="acts"><button className="ghost" onClick={() => setStep(0)}>← 이전</button><button className="primary" onClick={() => setStep(2)}>다음 →</button></div>
          </div>
        )}

        {/* STEP 2 — 고급 */}
        {step === 2 && (
          <div className="pane narrow">
            <h2>고급 옵션 <span className="muted">(기본값으로 둬도 됩니다)</span></h2>
            <div className="grp"><h4>🎙 보이스</h4>
              <label className="fld"><span>보이스 ID</span><input className="in" value={project.voice.voiceId} onChange={(e) => set({ voice: { ...project.voice, voiceId: e.target.value } })} /></label>
              <div className="sliders">
                {([['speed', '속도', 0.7, 1.5, 0.01], ['pitch', '톤(피치)', -6, 6, 1], ['vol', '볼륨', 0.5, 2, 0.1]] as const).map(([k, lab, mn, mx, st]) => (
                  <label key={k} className="sld"><span>{lab}: {(project.voice as any)[k]}</span><input type="range" min={mn} max={mx} step={st} value={(project.voice as any)[k]} onChange={(e) => set({ voice: { ...project.voice, [k]: parseFloat(e.target.value) } })} /></label>
                ))}
              </div>
              <Help>지금 데모 기본값: 속도 1.12 · 피치 +1 · 볼륨 1.1 (살짝 빠르고 밝게).</Help>
            </div>
            <div className="grp"><h4>🎨 스타일</h4>
              <label className="fld"><span>강조색 (accent)</span><input type="color" value={project.style.accent || '#22d3a6'} onChange={(e) => set({ style: { ...project.style, accent: e.target.value } })} /></label>
              {project.template === 'montage' && <label className="fld"><span>이미지 공통 스타일 (suffix)</span><textarea className="in" value={project.style.imageSuffix || ''} onChange={(e) => set({ style: { ...project.style, imageSuffix: e.target.value } })} /></label>}
            </div>
            <div className="grp"><h4>📐 포맷</h4>
              <label className="fld"><span>해상도</span>
                <select className="in" value={`${project.format.width}x${project.format.height}`} onChange={(e) => { const [w, h] = e.target.value.split('x').map(Number); set({ format: { ...project.format, width: w, height: h } }); }}>
                  <option value="1920x1080">1920×1080 (가로 16:9)</option>
                  <option value="1080x1920">1080×1920 (세로 쇼츠)</option>
                  <option value="1080x1080">1080×1080 (정사각)</option>
                </select>
              </label>
            </div>
            <div className="acts"><button className="ghost" onClick={() => setStep(1)}>← 이전</button><button className="primary" onClick={() => setStep(3)}>다음 →</button></div>
          </div>
        )}

        {/* STEP 3 — 생성 */}
        {step === 3 && (
          <div className="pane gen">
            <div className="genleft">
              <h2>생성</h2>
              {!valid && <Help>⚠ 제목·ID·장면이 모두 있어야 합니다.</Help>}
              <div className="runbtns">
                <button className="ghost" disabled={busy || !valid} onClick={save}>💾 저장</button>
                <button className="primary" disabled={busy || !valid} onClick={() => run('build')}>① 빌드 (음성·이미지 생성)</button>
                <button className="primary" disabled={busy || !valid} onClick={() => run('render')}>② 렌더 (전체)</button>
              </div>
              {project.sections.length > 1 && (
                <div className="secrender">
                  <div className="muted sm">섹션별 재렌더 (수정한 섹션만):</div>
                  <div className="exrow">{project.sections.map((s) => <button key={s.id} className="ex" disabled={busy} onClick={() => run('render', `?only=${s.id}`)}>↻ {s.title}</button>)}</div>
                </div>
              )}
              <div className="loghd">진행 로그</div>
              <div className="logbox" ref={logRef}>{log.map((l, i) => <div key={i} className="logl">{l}</div>)}{log.length === 0 && <div className="muted">아직 실행 안 함</div>}</div>
            </div>
            <div className="genright">
              <div className="prevhd">미리보기</div>
              <video key={previewBust} className="prev" controls src={`${API}/out/${project.id}.mp4?t=${previewBust}`} />
              <details className="jsonbox"><summary>project.json 보기</summary><pre>{JSON.stringify(exported, null, 2)}</pre></details>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
