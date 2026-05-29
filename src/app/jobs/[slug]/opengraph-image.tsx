import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "وظيفة شاغرة — جوبز الأردن";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getCairoFont() {
  const fontUrl = "https://fonts.gstatic.com/s/cairo/v28/SL3c1WGqgqWRsaO1knd01Q.ttf";
  const res = await fetch(fontUrl);
  if (!res.ok) {
    throw new Error("Failed to load font");
  }
  return res.arrayBuffer();
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const job = await prisma.job.findUnique({
    where: { slug: decodedSlug },
    select: {
      title: true,
      city: true,
      jobType: true,
      companyNameText: true,
      company: { select: { name: true } },
    },
  });

  if (!job) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b132b" }} />
      ),
      { ...size }
    );
  }

  const companyName = job.company?.name ?? job.companyNameText ?? "صاحب عمل خاص";
  const fontData = await getCairoFont().catch(() => null);

  const jobTypeLabels: Record<string, string> = {
    FULL_TIME: "دوام كامل",
    PART_TIME: "دوام جزئي",
    CONTRACT: "عقد",
    INTERNSHIP: "تدريب",
    TEMPORARY: "مؤقت",
    REMOTE: "عن بعد",
    HYBRID: "هجين",
  };
  const jobTypeLabel = jobTypeLabels[job.jobType] ?? "دوام كامل";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
          padding: "80px",
          position: "relative",
          fontFamily: "Cairo, sans-serif",
          direction: "rtl",
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Top Header Row */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50px",
              padding: "10px 24px",
            }}
          >
            <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, letterSpacing: "1px" }}>
              جوبز الأردن
            </span>
            <span style={{ color: "#10b981", fontSize: "22px", fontWeight: 700, marginRight: "8px" }}>
              •
            </span>
            <span style={{ color: "#94a3b8", fontSize: "18px", fontWeight: 500, marginRight: "8px" }}>
              jordan-job.shop
            </span>
          </div>

          <div
            style={{
              background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
              borderRadius: "8px",
              padding: "8px 20px",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {jobTypeLabel}
          </div>
        </div>

        {/* Middle Main Info */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "40px" }}>
          <div style={{ color: "#94a3b8", fontSize: "24px", fontWeight: 600, marginBottom: "12px" }}>
            فرصة عمل شاغرة في الأردن:
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: "20px",
              display: "block",
            }}
          >
            {job.title}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#fbbf24", fontSize: "28px", fontWeight: 700 }}>
              {companyName}
            </span>
            <span style={{ color: "#475569", fontSize: "28px", margin: "0 15px" }}>
              |
            </span>
            <span style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: 500 }}>
              📌 {job.city}
            </span>
          </div>
        </div>

        {/* Bottom Footer Call to Action */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "30px",
            marginTop: "40px",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: "18px", fontWeight: 500 }}>
            سجّل الآن، ابنِ سيرتك الذاتية، وقدّم بضغطة زر واحدة
          </span>
          <span style={{ color: "#10b981", fontSize: "20px", fontWeight: 700 }}>
            وظائف يومية متجددة ⚡
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Cairo",
              data: fontData,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    }
  );
}
