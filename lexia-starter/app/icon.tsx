import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #071a2e 0%, #102c4a 100%)",
          borderRadius: 112,
          boxShadow: "inset 0 0 0 18px rgba(212,182,110,.62)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 13 }}>
          <span
            style={{
              color: "white",
              fontSize: 282,
              lineHeight: 0.84,
              fontFamily: "Georgia",
              fontWeight: 700,
              letterSpacing: -20,
            }}
          >
            L
          </span>
          <span
            style={{
              width: 48,
              height: 48,
              marginBottom: 35,
              borderRadius: 999,
              background: "#d4b66e",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
