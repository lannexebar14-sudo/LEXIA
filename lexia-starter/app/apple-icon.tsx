import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 38,
          boxShadow: "inset 0 0 0 7px rgba(212,182,110,.62)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
          <span
            style={{
              color: "white",
              fontSize: 102,
              lineHeight: 0.84,
              fontFamily: "Georgia",
              fontWeight: 700,
              letterSpacing: -7,
            }}
          >
            L
          </span>
          <span
            style={{
              width: 17,
              height: 17,
              marginBottom: 13,
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
