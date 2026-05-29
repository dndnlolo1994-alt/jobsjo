"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const PAGES = [
  { id: "home",      label: "الرئيسية",     url: "https://www.jordan-job.shop/",         icon: "🏠" },
  { id: "jobs",      label: "الوظائف",      url: "https://www.jordan-job.shop/jobs",      icon: "💼" },
  { id: "companies", label: "الشركات",      url: "https://www.jordan-job.shop/companies", icon: "🏢" },
  { id: "cv",        label: "باني السيرة",  url: "https://www.jordan-job.shop/cv-builder",icon: "📄" },
  { id: "pricing",   label: "الأسعار",      url: "https://www.jordan-job.shop/pricing",   icon: "💰" },
  { id: "about",     label: "عن المنصة",    url: "https://www.jordan-job.shop/about",     icon: "ℹ️" },
  { id: "contact",   label: "اتصل بنا",     url: "https://www.jordan-job.shop/contact",   icon: "📞" },
];

async function checkPageOnServer(pageUrl: string, pageLabel: string, apiKey: string) {
  const response = await fetch("/api/admin/agent-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageUrl, pageLabel, apiKey }),
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `خطأ ${response.status}`);
  }
  
  return await response.json();
}

const statusColor = (s = "") => {
  if (s.includes("✅")) return "#22c55e";
  if (s.includes("⚠️")) return "#f59e0b";
  if (s.includes("🔴")) return "#ef4444";
  return "#94a3b8";
};

export default function App() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load API Key from localStorage on client mount
  useEffect(() => {
    const savedKey = localStorage.getItem("anthropic_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Save API Key to localStorage when updated
  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem("anthropic_key", val);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results]);

  const runAgent = async () => {
    if (!apiKey) {
      setErrorMsg("الرجاء إدخال مفتاح الـ API للبدء في الفحص.");
      return;
    }
    setErrorMsg("");
    setRunning(true);
    setDone(false);
    setResults({});
    
    for (const page of PAGES) {
      setCurrent(page.id);
      try {
        const result = await checkPageOnServer(page.url, page.label, apiKey);
        setResults(prev => ({ ...prev, [page.id]: result }));
      } catch (e: any) {
        setResults(prev => ({
          ...prev,
          [page.id]: { 
            status: "🔴 مشكلة", 
            notes: e.message || "فشل الاتصال", 
            promo: "—" 
          }
        }));
      }
      await new Promise(r => setTimeout(r, 500));
    }
    setCurrent(null);
    setRunning(false);
    setDone(true);
  };

  const copyPromo = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const doneCount = Object.keys(results).length;
  const progress = Math.round((doneCount / PAGES.length) * 100);

  return (
    <div dir="rtl" className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">🤖 وكيل الترويج وفحص المنصة</h1>
          <p className="text-sm text-navy-400 mt-1 font-medium">يقوم بفحص صفحات الموقع للتأكد من أنها تعمل، وكتابة إعلانات ترويجية احترافية بالذكاء الاصطناعي.</p>
        </div>
        <div className="flex gap-2">
          <a href="https://www.jordan-job.shop" target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-2 px-4 rounded-xl">
            🔗 jordan-job.shop
          </a>
        </div>
      </div>

      {/* API Key Setup Panel */}
      <div className="card bg-white p-6 shadow-sm border border-slate-150 rounded-2xl space-y-4">
        <div>
          <h2 className="font-extrabold text-navy-950 text-base mb-1">🔑 إعدادات مفتاح الذكاء الاصطناعي (Anthropic API Key)</h2>
          <p className="text-xs text-navy-500 font-medium">يتم حفظ المفتاح محلياً في متصفحك بشكل آمن ولا يرسل إلا لخادم الفحص بشكل مؤقت.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="input flex-1 font-mono text-sm tracking-widest"
          />
          {running ? (
            <button disabled className="btn-primary py-2 px-6 rounded-xl text-sm opacity-60 cursor-not-allowed">
              ⏳ جاري الفحص...
            </button>
          ) : (
            <button onClick={runAgent} className="btn-primary py-2 px-6 rounded-xl text-sm">
              ⚡ ابدأ الفحص والكتابة
            </button>
          )}
        </div>
        
        {errorMsg && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
            ⚠️ {errorMsg}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {(running || done) && (
        <div className="card bg-white p-5 border border-slate-150 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-navy-900">
            <span>تم فحص {doneCount} من {PAGES.length} صفحات</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{progress}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              style={{ width: `${progress}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                done ? "bg-emerald-600 shadow-[0_0_12px_#059669]" : "bg-emerald-500"
              }`} 
            />
          </div>
        </div>
      )}

      {/* Grid container of checker pages */}
      <div ref={scrollRef} className="space-y-4">
        {PAGES.map((page) => {
          const res = results[page.id];
          const isActive = current === page.id;
          const isPending = !res && !isActive && running;

          return (
            <div key={page.id} className={`card p-5 border rounded-2xl transition-all duration-300 ${
              isActive 
                ? "bg-slate-50 border-emerald-500/40 shadow-sm" 
                : "bg-white border-slate-150"
            }`}>
              
              {/* Card Title Header */}
              <div className="flex items-center gap-3 justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{page.icon}</span>
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm leading-snug">{page.label}</h3>
                    <p className="text-[10px] text-navy-400 font-semibold mt-0.5 select-all">{page.url}</p>
                  </div>
                </div>

                <div>
                  {isActive && (
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                      <span className="animate-spin inline-block">⏳</span>
                      جاري الفحص...
                    </span>
                  )}
                  {!isActive && !res && !isPending && !running && (
                    <span className="text-slate-400 text-xs font-bold bg-slate-50 border border-slate-250/30 px-3 py-1 rounded-full">في الانتظار</span>
                  )}
                  {isPending && (
                    <span className="text-slate-400 text-xs font-bold bg-slate-50 border border-slate-250/30 px-3 py-1 rounded-full">⏳ قريباً</span>
                  )}
                  {res && (
                    <span 
                      style={{ 
                        backgroundColor: `${statusColor(res.status)}10`, 
                        borderColor: `${statusColor(res.status)}30`,
                        color: statusColor(res.status)
                      }}
                      className="text-xs font-extrabold px-3 py-1 rounded-full border"
                    >
                      {res.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Details Content */}
              {res && (
                <div className="pt-4 space-y-3">
                  {/* Notes bar */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-navy-600 font-semibold flex items-center gap-2">
                    <span>🔍</span>
                    <span><strong>ملاحظة تقنية:</strong> {res.notes}</span>
                  </div>

                  {/* Promo content block */}
                  <div className="relative bg-gradient-to-l from-emerald-500/5 to-emerald-600/5 border border-emerald-500/10 p-5 rounded-2xl">
                    <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider mb-2">📣 البروموشن الإعلاني للمشاركة</div>
                    <p className="text-navy-900 text-sm leading-relaxed font-semibold pl-12">{res.promo}</p>
                    <button
                      onClick={() => copyPromo(page.id, res.promo)}
                      className={`absolute left-4 top-4 text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all border ${
                        copied === page.id
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-navy-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {copied === page.id ? "✓ نُسخ" : "📋 نسخ الإعلان"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Done summary check card */}
      {done && (
        <div className="card bg-emerald-50/40 border border-emerald-200/80 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <div className="text-5xl">🎉</div>
          <h2 className="font-extrabold text-emerald-900 text-lg">اكتمل فحص الموقع بنجاح!</h2>
          <p className="text-xs text-navy-600 font-medium">تم فحص {PAGES.length} صفحات وتوليد {PAGES.length} إعلانات ترويجية مخصصة ومطابقة لأفضل استراتيجيات التسويق.</p>
          <button 
            onClick={() => { setDone(false); setResults({}); }} 
            className="btn bg-white hover:bg-slate-50 text-navy-800 text-xs font-bold border border-slate-250 shadow-sm py-2 px-6 rounded-xl"
          >
            🔄 إعادة تشغيل الوكيل
          </button>
        </div>
      )}
    </div>
  );
}
