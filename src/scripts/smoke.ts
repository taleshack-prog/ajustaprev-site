/**
 * Dissolução "em fumaça" das torres para o escritório, em WebGL 1.
 *
 * Um único quad em tela cheia. O fragment shader:
 *  - amostra as duas imagens como `object-fit: cover` + `object-position`
 *    (mesmo enquadramento do <img> por baixo, para não haver salto na troca);
 *  - calcula um campo de ruído fbm que sobe com o tempo; a frente de
 *    dissolução avança de baixo para cima e "come" as torres;
 *  - perto da frente, as torres se deslocam para cima e uma faixa de fumaça
 *    cinza-azulada aparece e se dissipa.
 *
 * Retorna false quando WebGL não está disponível — quem chama usa o fallback CSS.
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
uniform float uOfficeScale;
uniform float uProgress;
uniform float uTime;

// object-fit: cover + object-position, origem no canto superior esquerdo
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
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
  float aspect = uRes.x / uRes.y;
  vec2 q = vec2(uv.x * aspect, uv.y);

  // campo de dissolução: ruído que sobe + viés vertical (base some primeiro)
  float drift = uTime * 0.35;
  float n = fbm(q * 2.6 + vec2(0.0, drift));
  float field = n * 0.58 + uv.y * 0.42;            // uv.y = 1 na base
  float front = 1.12 - uProgress * 1.24;           // limiar desce de 1,12 a -0,12
  float keep = 1.0 - smoothstep(front - 0.05, front + 0.05, field); // 1 = torre ainda de pé

  // perto da frente, a matéria das torres sobe e se desfaz
  float nearFront = 1.0 - smoothstep(0.0, 0.22, abs(field - front));
  float swirl = fbm(q * 5.0 + vec2(drift * 1.6, -drift));
  float onset = smoothstep(0.0, 0.1, uProgress);   // 1º quadro idêntico ao <img>
  vec2 lift = vec2((swirl - 0.5) * 0.035, -0.05 * nearFront * uProgress) * onset;

  vec3 towers = texture2D(uTowers, cover(uv + lift * nearFront, uTowersSize, uTowersPos, 1.0)).rgb;
  vec3 office = texture2D(uOffice, cover(uv, uOfficeSize, uOfficePos, uOfficeScale)).rgb;

  vec3 col = mix(office, towers, keep);

  // fumaça: faixa na frente + véu residual que sobe e se dissipa
  float wisps = fbm(q * 3.4 + vec2(swirl * 1.5, drift * 2.2));
  float band = nearFront * smoothstep(0.25, 0.75, wisps);
  float veil = (1.0 - keep) * smoothstep(0.35, 0.85, wisps) * (1.0 - uProgress) * 0.55;
  float smoke = clamp(band * 0.85 + veil, 0.0, 1.0) * (1.0 - smoothstep(0.85, 1.0, uProgress)) * onset;
  vec3 smokeCol = vec3(0.60, 0.66, 0.76) * (0.55 + 0.45 * wisps);
  col = mix(col, max(col, smokeCol), smoke * 0.75);

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SmokeOptions {
  canvas: HTMLCanvasElement;
  towers: HTMLImageElement;
  office: HTMLImageElement;
  towersPos: [number, number];
  officePos: [number, number];
  duration: number;
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
  // Imagens não potência de 2: sem mipmap, clamp nas bordas.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  return t;
}

export function runSmoke(o: SmokeOptions): boolean {
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
    return false; // imagem sem CORS ou não decodificada
  }

  const u = (name: string) => gl.getUniformLocation(prog, name);
  gl.uniform1i(u('uTowers'), 0);
  gl.uniform1i(u('uOffice'), 1);
  gl.uniform2f(u('uTowersSize'), o.towers.naturalWidth, o.towers.naturalHeight);
  gl.uniform2f(u('uOfficeSize'), o.office.naturalWidth, o.office.naturalHeight);
  gl.uniform2f(u('uTowersPos'), o.towersPos[0], o.towersPos[1]);
  gl.uniform2f(u('uOfficePos'), o.officePos[0], o.officePos[1]);
  const uRes = u('uRes');
  const uProgress = u('uProgress');
  const uTime = u('uTime');
  const uOfficeScale = u('uOfficeScale');

  const resize = () => {
    // DPR limitado a 1,5: a fumaça é macia, resolução extra só custa GPU.
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

  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const t0 = performance.now();
  let first = true;

  const frame = (now: number) => {
    const t = Math.min(1, (now - t0) / o.duration);
    resize();
    gl.uniform1f(uProgress, ease(t));
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform1f(uOfficeScale, 1.04 - 0.04 * ease(t)); // escritório "assenta" enquanto a fumaça sobe
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (first) { first = false; o.onFirstFrame(); }
    if (t < 1) requestAnimationFrame(frame);
    else {
      o.onDone();
      // Libera a GPU: a animação roda uma vez só.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
  requestAnimationFrame(frame);
  return true;
}
