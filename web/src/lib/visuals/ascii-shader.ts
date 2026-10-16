// Hidden artwork palette renderer. The visible canvas and text layout live separately.
export type ShaderColors = number[][];

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[webgl] shader compile failed", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("[webgl] program link failed", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function createAsciiShader(
  canvas: HTMLCanvasElement,
  getColors: () => ShaderColors,
) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    // Safari needs the back buffer preserved until the cell sampler reads it.
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;
  const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

  const fragmentSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_colorA;
      uniform vec3 u_colorB;
      uniform vec3 u_colorC;
      uniform vec3 u_colorD;
      uniform vec3 u_colorE;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 2; i++) {
          value += amplitude * noise(p);
          p = p * 1.7 + vec2(1.7, 9.2);
          amplitude *= 0.58;
        }
        return value;
      }

      vec3 palette(float t) {
        if (t < 0.25) {
          return mix(u_colorA, u_colorB, smoothstep(0.0, 0.25, t));
        }
        if (t < 0.5) {
          return mix(u_colorB, u_colorC, smoothstep(0.25, 0.5, t));
        }
        if (t < 0.75) {
          return mix(u_colorC, u_colorD, smoothstep(0.5, 0.75, t));
        }
        return mix(u_colorD, u_colorE, smoothstep(0.75, 1.0, t));
      }

      void main() {
        vec2 uv = v_uv;
        vec2 p = uv * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
        float t = u_time * 0.09;

        vec2 flow = vec2(
          fbm(p * 0.9 + vec2(t * 0.45, -t * 0.22)),
          fbm(p * 0.95 + vec2(-t * 0.18, t * 0.34))
        );

        vec2 warped = p + (flow - 0.5) * 0.55;
        float fluid = fbm(warped * 1.45 + vec2(t * 0.26, -t * 0.12));
        fluid = clamp(fluid, 0.0, 1.0);

        vec3 color = palette(fluid);
        float alpha = clamp(0.52 + fluid * 0.9, 0.0, 1.0);
        gl_FragColor = vec4(color * alpha, 1.0);
      }
    `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  if (!program) return null;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const colorALocation = gl.getUniformLocation(program, "u_colorA");
  const colorBLocation = gl.getUniformLocation(program, "u_colorB");
  const colorCLocation = gl.getUniformLocation(program, "u_colorC");
  const colorDLocation = gl.getUniformLocation(program, "u_colorD");
  const colorELocation = gl.getUniformLocation(program, "u_colorE");

  // Keep the hidden shader canvas cheap; the visible ASCII layer samples it down.
  let viewWidth = 1;
  let viewHeight = 1;

  const resize = (
    width: number,
    height: number,
    columns: number,
    rows: number,
  ) => {
    viewWidth = width;
    viewHeight = height;
    // The shader is never displayed: each output pixel supplies one ASCII cell.
    canvas.width = columns;
    canvas.height = rows;
    gl.viewport(0, 0, columns, rows);
  };
  const render = (now: number) => {
    if (document.hidden) return false;
    const cu = getColors();
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, viewWidth, viewHeight);
    gl.uniform1f(timeLocation, now * 0.001);
    gl.uniform3fv(colorALocation, cu[0]!);
    gl.uniform3fv(colorBLocation, cu[1]!);
    gl.uniform3fv(colorCLocation, cu[2]!);
    gl.uniform3fv(colorDLocation, cu[3]!);
    gl.uniform3fv(colorELocation, cu[4]!);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return true;
  };

  gl.useProgram(program);
  gl.uniform3fv(colorALocation, getColors()[0]!);
  gl.uniform3fv(colorBLocation, getColors()[1]!);
  gl.uniform3fv(colorCLocation, getColors()[2]!);
  gl.uniform3fv(colorDLocation, getColors()[3]!);
  gl.uniform3fv(colorELocation, getColors()[4]!);

  return {
    resize,
    render,
    dispose() {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    },
  };
}
