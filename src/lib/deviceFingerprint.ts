/**
 * Browser-based device fingerprinting.
 * Generates a stable hash from browser/hardware properties.
 * This is a web-compatible alternative to native SIM/IMEI binding.
 */

async function getCanvasFingerprint(): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  canvas.width = 200;
  canvas.height = 50;
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("SmartPay🔐", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText("SmartPay🔐", 4, 17);
  return canvas.toDataURL();
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "";
    const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "";
    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return `${vendor}~${renderer}`;
  } catch {
    return "";
  }
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // Screen properties
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  components.push(String(window.devicePixelRatio));

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Platform & language
  components.push(navigator.platform);
  components.push(navigator.language);
  components.push(String(navigator.hardwareConcurrency || ""));
  components.push(String((navigator as any).deviceMemory || ""));

  // Canvas fingerprint
  const canvasFp = await getCanvasFingerprint();
  components.push(canvasFp);

  // WebGL
  components.push(getWebGLFingerprint());

  // Touch support
  components.push(String(navigator.maxTouchPoints || 0));

  const raw = components.join("|");
  return hashString(raw);
}
