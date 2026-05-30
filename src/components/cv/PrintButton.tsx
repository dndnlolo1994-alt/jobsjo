"use client";

import React, { useState } from "react";

interface PrintButtonProps {
  fileName?: string;
}

export function PrintButton({ fileName = "cv.pdf" }: PrintButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDownloadPdf() {
    const cv = document.querySelector<HTMLElement>(".cv-print");
    if (!cv) {
      setMessage("لم يتم العثور على السيرة. افتح صفحة التنزيل بعد حفظ السيرة.");
      return;
    }

    setIsGenerating(true);
    setMessage("");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(cv, {
        backgroundColor: "#ffffff",
        scale: Math.min(2, window.devicePixelRatio || 1.5),
        useCORS: true,
        logging: false,
        windowWidth: cv.scrollWidth,
        windowHeight: cv.scrollHeight,
      });
      const image = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageRatio = canvas.width / canvas.height;
      let renderWidth = pageWidth;
      let renderHeight = renderWidth / imageRatio;
      if (renderHeight > pageHeight) {
        renderHeight = pageHeight;
        renderWidth = renderHeight * imageRatio;
      }
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;
      pdf.addImage(image, "JPEG", x, y, renderWidth, renderHeight);
      pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
      setMessage("تم إنشاء ملف PDF صفحة واحدة.");
    } catch (error) {
      console.error("CV PDF generation failed", error);
      setMessage("تعذر إنشاء PDF من المتصفح. جرّب من Chrome أو تواصل معنا.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isGenerating}
        className="btn-primary flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer disabled:opacity-70"
        title="تنزيل السيرة الذاتية PDF صفحة واحدة"
      >
        <span>{isGenerating ? "⏳" : "📥"}</span>
        <span>{isGenerating ? "جاري تجهيز PDF..." : "تنزيل PDF صفحة واحدة"}</span>
      </button>
      {message && <p className="text-xs font-bold text-emerald-700">{message}</p>}
    </div>
  );
}
