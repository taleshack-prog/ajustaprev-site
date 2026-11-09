/**
 * Sequência do hero em WebGL 1 — um único quad em tela cheia, duas fases:
 *
 * 1. CONSTRUÇÃO — primeiro aparece a "planta" (contornos das torres em azul,
 *    detectados com Sobel na própria foto); depois as torres sobem andar por
 *    andar, de baixo para cima, cada coluna no seu ritmo. O andar recém-posto
 *    surge frio e claro e assenta na cor real; uma linha de obra luminosa
 *    marca o topo de cada coluna.
 * 2. REVELAÇÃO — as torres ficam transparentes devagar (transparência
 *    levemente irregular, guiada por ruído), enquanto o escritório se forma:
 *    começa escuro, dessaturado e desfocado e termina nítido. O último quadro
 *    é idêntico ao <img> do escritório (mesmo object-fit/object-position),
 *    então a troca canvas → <img> não tem salto.
 *
 * O relógio é acumulado por quadro (com teto por quadro): se a GPU engasgar, a
 * animação desacelera em vez de pular etapas. Retorna false sem WebGL — quem
 * chama usa o fallback CSS.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D uTowers;
uniform sampler2D uOffice;
uniform vec2 uRes;
uniform vec2 uTowersSize;
uniform vec2 uOfficeSize;
uniform vec2 uTowersPos;
uniform vec2 uOfficePos;
uniform float uTowersScale;
uniform float uOfficeScale;
uniform float uBuild;   // 0..1, linear no tempo
uniform float uReveal;  // 0..1 (0 durante a construção)
uniform float uTime;

const vec3 NIGHT = vec3(0.039, 0.078, 0.141);
const vec3 BLUE  = vec3(0.416, 0.635, 0.953);
const float FLOOR_H = 0.025; // 40 andares na altura da área

// object-fit: cover + object-position (origem no canto superior esquerdo)
vec2 cover(vec2 uv, vec2 img, vec2 pos, float scale) {
  float boxA = uRes.x / uRes.y;
  float imgA = img.x / img.y;
  vec2 s = boxA > imgA ? vec2(1.0, imgA / boxA) : vec2(boxA / imgA, 1.0);
  s /= scale;
  return pos * (1.0 - s) + uv * s;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; }
  return v;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

float tl(vec2 uv) { return luma(texture2D(uTowers, uv).rgb); }
float sobel(vec2 uv) {
  vec2 p = 1.25 / uTowersSize;
  float a = tl(uv + p * vec2(-1.0, -1.0)), b = tl(uv + p * vec2(0.0, -1.0)), c = tl(uv + p * vec2(1.0, -1.0));
  float d = tl(uv + p * vec2(-1.0,  0.0)),                                     f = tl(uv + p * vec2(1.0,  0.0));
  float g = tl(uv + p * vec2(-1.0,  1.0)), h = tl(uv + p * vec2(0.0,  1.0)), i = tl(uv + p * vec2(1.0,  1.0));
  float gx = (c + 2.0 * f + i) - (a + 2.0 * d + g);
  float gy = (g + 2.0 * h + i) - (a + 2.0 * b + c);
  return length(vec2(gx, gy));
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
  float aspect = uRes.x / uRes.y;
  vec2 tuv = cover(uv, uTowersSize, uTowersPos, uTowersScale);
  vec3 towers = texture2D(uTowers, tuv).rgb;
  vec3 col;

  if (uReveal <= 0.0) {
    // ---------- 1. construção ----------
    float hb = 1.0 - uv.y;                       // altura a partir da base (0 = base)
    float fl = floor(hb / FLOOR_H) * FLOOR_H;    // base do andar deste pixel
    // a planta aparece antes da obra; a obra avança em ritmo quase constante
    float lin = clamp((uBuild - 0.14) / 0.86, 0.0, 1.0);
    float b = mix(lin, smoothstep(0.0, 1.0, lin), 0.35);
    // cada coluna sobe no seu ritmo (ruído de baixa e média frequência em x)
    float jag = (noise(vec2(uv.x * 6.0, 3.1)) - 0.5) * 0.18
              + (noise(vec2(uv.x * 21.0, 8.7)) - 0.5) * 0.05;
    float H = b * 1.2 - 0.1 + jag * (1.0 - b);  // altura construída nesta coluna
    float built = step(fl, H);                    // o andar entra inteiro
    float age = clamp((H - fl) / 0.14, 0.0, 1.0); // 0 = recém-posto, 1 = assentado

    // planta: contornos das torres em azul sobre a noite
    float e = smoothstep(0.06, 0.32, sobel(tuv));
    float bp = smoothstep(0.0, 0.14, uBuild) * (1.0 - smoothstep(0.8, 1.0, uBuild));
    vec3 blueprint = NIGHT + BLUE * e * 0.5 * bp;

    // andar recém-posto: frio e claro; assenta na cor real
    vec3 cool = vec3(luma(towers)) * vec3(0.78, 0.9, 1.15) + 0.07;
    vec3 fresh = mix(cool, towers, smoothstep(0.0, 1.0, age));
    col = mix(blueprint, fresh, built);

    // linha de obra no topo da coluna
    float top = (floor(H / FLOOR_H) + 1.0) * FLOOR_H;
    float dpx = abs(hb - top) * uRes.y;           // distância em pixels
    float active = step(0.001, b) * (1.0 - smoothstep(0.9, 1.0, b)) * step(top, 1.0);
    float spark = 0.65 + 0.35 * noise(vec2(uv.x * 80.0, uTime * 9.0));
    float core = exp(-dpx * 0.9) * spark;
    float halo = exp(-dpx / 14.0) * 0.28;
    col += (BLUE * (core + halo) + vec3(1.0, 0.96, 0.88) * core * 0.45) * active;
  } else {
    // ---------- 2. revelação ----------
    float r = uReveal;
    vec2 q = vec2(uv.x * aspect, uv.y);
    float n = fbm(q * 1.7 + vec2(0.0, uTime * 0.04));
    // transparência das torres, irregular no meio e exata nas pontas
    float a = 1.0 - smoothstep(0.0, 1.0, r + (n - 0.5) * 0.55 * sin(3.14159 * r));
    vec3 tw = mix(towers, vec3(luma(towers)) * vec3(0.86, 0.93, 1.08), (1.0 - a) * 0.6);

    // escritório: desfoque que diminui até zero (disco com 24 amostras)
    float rad = pow(1.0 - r, 2.2) * 0.04;          // em alturas da área
    vec3 off;
    if (rad > 0.0004) {
      off = vec3(0.0);
      for (int i = 0; i < 24; i++) {
        float fi = float(i);
        float rr = sqrt((fi + 0.5) / 24.0) * rad;
        float th = fi * 2.39996;
        vec2 o = vec2(cos(th) * rr / aspect, sin(th) * rr);
        off += texture2D(uOffice, cover(uv + o, uOfficeSize, uOfficePos, uOfficeScale)).rgb;
      }
      off /= 24.0;
    } else {
      off = texture2D(uOffice, cover(uv, uOfficeSize, uOfficePos, uOfficeScale)).rgb;
    }
    float lit = mix(0.28, 1.0, smoothstep(0.0, 0.92, r));
    float sat = mix(0.35, 1.0, smoothstep(0.1, 0.95, r));
    off = mix(vec3(luma(off)), off, sat) * lit;

    col = mix(off, tw, a);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SequenceOptions {
  canvas: HTMLCanvasElement;
  towers: HTMLImageElement;
  office: HTMLImageElement;
  towersPos: [number, number];
  officePos: [number, number];
  /** ms */
  build: number;
  hold: number;
  reveal: number;
  onFirstFrame: () => void;
  onDone: () => void;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

function texture(gl: WebGLRenderingContext, unit: number, img: HTMLImageElement) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  return t;
}

const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function runHeroSequence(o: SequenceOptions): boolean {
  const gl = o.canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false });
  if (!gl) return false;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return false;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  try {
    texture(gl, 0, o.towers);
    texture(gl, 1, o.office);
  } catch {
    return false;
  }

  const u = (name: string) => gl.getUniformLocation(prog, name);
  gl.uniform1i(u('uTowers'), 0);
  gl.uniform1i(u('uOffice'), 1);
  gl.uniform2f(u('uTowersSize'), o.towers.naturalWidth, o.towers.naturalHeight);
  gl.uniform2f(u('uOfficeSize'), o.office.naturalWidth, o.office.naturalHeight);
  gl.uniform2f(u('uTowersPos'), o.towersPos[0], o.towersPos[1]);
  gl.uniform2f(u('uOfficePos'), o.officePos[0], o.officePos[1]);
  const uRes = u('uRes');
  const uBuild = u('uBuild');
  const uReveal = u('uReveal');
  const uTime = u('uTime');
  const uTowersScale = u('uTowersScale');
  const uOfficeScale = u('uOfficeScale');

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(o.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(o.canvas.clientHeight * dpr));
    if (o.canvas.width !== w || o.canvas.height !== h) {
      o.canvas.width = w;
      o.canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    o.onDone();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  // Contexto perdido no meio (aba em segundo plano, driver): vai ao estado final.
  o.canvas.addEventListener('webglcontextlost', finish, { once: true });

  const total = o.build + o.hold + o.reveal;
  let t = 0;
  let last = -1;
  let first = true;

  const frame = (now: number) => {
    if (finished) return;
    // relógio acumulado; no máximo 100 ms por quadro
    t += last < 0 ? 0 : Math.min(100, now - last);
    last = now;

    const build = clamp01(t / o.build);
    const reveal = easeInOutSine(clamp01((t - o.build - o.hold) / o.reveal));
    const settle = clamp01(t / (o.build + o.hold));

    resize();
    gl.uniform1f(uBuild, build);
    gl.uniform1f(uReveal, reveal);
    gl.uniform1f(uTime, t / 1000);
    gl.uniform1f(uTowersScale, 1.05 - 0.05 * (1 - Math.pow(1 - settle, 3)));
    gl.uniform1f(uOfficeScale, 1.06 - 0.06 * reveal);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (first) { first = false; o.onFirstFrame(); }
    if (t < total) requestAnimationFrame(frame);
    else finish();
  };
  requestAnimationFrame(frame);
  return true;
}
