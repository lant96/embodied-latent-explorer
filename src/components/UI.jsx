import { useEffect, useRef } from "react";
import { getVideoElement, recalibrate } from "../core/poseController";

const zoneColors = {
  LEFT: "#b791e9",
  CENTER: "#f05b5b",
  RIGHT: "#f0ae78",
};

function deriveZone(x) {
  if (x < -0.18) return "LEFT";
  if (x > 0.18)  return "RIGHT";
  return "CENTER";
}

export default function UI({ pose }) {
  const containerRef = useRef(null);
  const attachedRef  = useRef(false);


  useEffect(() => {
      const tryAttach = () => {
        const video = getVideoElement();
        if (!video || !containerRef.current || attachedRef.current) return false;
  
        Object.assign(video.style, {
          width:        "200px",
          borderRadius: "10px",
          opacity:      "0.88",
          border:       "1px solid rgba(0,0,0,0.1)",
          boxShadow:    "0 4px 16px rgba(0,0,0,0.12)",
          transform:    "scaleX(-1)",
          objectFit:    "cover",
          display:      "block",
        });
  
        containerRef.current.appendChild(video);
        attachedRef.current = true;
        return true;
      };
  
      // Try immediately (fast on repeat visits with cached WASM)
      if (!tryAttach()) {
        const interval = setInterval(() => {
          if (tryAttach()) clearInterval(interval);
        }, 500);
        return () => clearInterval(interval);
      }
    }, []);

  const zone      = pose ? deriveZone(pose.x) : "–";
  const zoneColor = zoneColors[zone] ?? "#333";

  return (
    <>
      <div style={styles.panel}>
        <div style={styles.title}>Embodied Latent Explorer</div>

        <div style={styles.row}>
          <span style={styles.label}>Zone</span>
          <span style={{ ...styles.value, color: zoneColor, fontWeight: 600 }}>
            {zone}
          </span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Lean</span>
          <span style={styles.value}>{pose?.x?.toFixed(3) ?? "…"}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Lean Y</span>
          <span style={styles.value}>{pose?.y?.toFixed(3) ?? "…"}</span>
        </div>

        <ZoneBar zone={zone} zoneColor={zoneColor} />

        <button style={styles.button} onClick={recalibrate}>
          Recalibrate
        </button>
      </div>

      <div ref={containerRef} style={styles.cameraContainer} />
    </>
  );
}

// Zone Bar
function ZoneBar({ zone, zoneColor }) {
  return (
    <div style={styles.zoneBar}>
      {["LEFT", "CENTER", "RIGHT"].map((z) => (
        <div
          key={z}
          style={{
            ...styles.zoneSegment,
            background: zone === z ? zoneColors[z] : "rgba(0,0,0,0.06)",
            color:      zone === z ? "#fff" : "rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
            {z[0]}
          </span>
        </div>
      ))}
    </div>
  );
}


const styles = {
  panel: {
    position:        "absolute",
    top:             20,
    left:            20,
    color:           "#1e1e2e",
    fontFamily:      "'Inter', 'Segoe UI', sans-serif",
    fontSize:        13,
    zIndex:          10,
    background:      "rgba(255,255,255,0.78)",
    border:          "1px solid rgba(0,0,0,0.08)",
    borderRadius:    12,
    padding:         "14px 18px",
    minWidth:        190,
    backdropFilter:  "blur(10px)",
    boxShadow:       "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize:     13,
    fontWeight:   700,
    marginBottom: 12,
    color:        "#3b3270",
    letterSpacing: 0.3,
  },
  row: {
    display:        "flex",
    justifyContent: "space-between",
    marginBottom:   5,
    alignItems:     "center",
  },
  label: {
    color: "rgba(0,0,0,0.4)",
  },
  value: {
    fontVariantNumeric: "tabular-nums",
    color:              "rgba(0,0,0,0.75)",
  },
  zoneBar: {
    display:      "flex",
    gap:          4,
    marginTop:    10,
    marginBottom: 8,
  },
  zoneSegment: {
    flex:           1,
    height:         22,
    borderRadius:   6,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    transition:     "all 0.2s ease",
  },
  button: {
    width:        "100%",
    marginTop:    2,
    padding:      "5px 0",
    background:   "rgba(0,0,0,0.04)",
    border:       "1px solid rgba(0,0,0,0.1)",
    borderRadius: 6,
    color:        "rgba(0,0,0,0.45)",
    cursor:       "pointer",
    fontSize:     11,
    letterSpacing: 0.5,
  },
  cameraContainer: {
    position:     "absolute",
    bottom:       20,
    left:         20,
    zIndex:       20,
    borderRadius: 12,
    overflow:     "hidden",
    boxShadow:    "0 4px 20px rgba(0,0,0,0.15)",
  },
};
