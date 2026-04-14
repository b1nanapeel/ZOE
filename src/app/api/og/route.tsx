import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f2035",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 280,
            fontStyle: "italic",
            color: "#c9a84c",
            letterSpacing: "0.05em",
            lineHeight: 1,
          }}
        >
          ZOE
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 42,
            fontStyle: "italic",
            color: "#f5f0e0",
            opacity: 0.92,
          }}
        >
          See what your child is telling you
        </div>
        <div
          style={{
            marginTop: 60,
            fontSize: 22,
            color: "#c9a84c",
            letterSpacing: "0.3em",
            opacity: 0.75,
          }}
        >
          BEHAVIORAL INTELLIGENCE FOR AUTISM FAMILIES
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
