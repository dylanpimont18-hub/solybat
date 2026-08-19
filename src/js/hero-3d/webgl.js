/**
 * Enrobage WebGL minimal : contexte, compilation des programmes, tampons.
 *
 * Volontairement réduit à ce dont la scène du hero a besoin. Aucune
 * bibliothèque tierce : à ~60 triangles, un moteur 3D complet coûterait
 * plus cher en téléchargement que la scène elle-même.
 */

/** Ouvre un contexte WebGL, ou retourne null si la machine ne peut pas. */
export function creerContexte(canvas) {
  const options = {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
  };
  try {
    return canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
  } catch (erreur) {
    return null;
  }
}

function compilerShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const journal = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Compilation du shader impossible : ${journal}`);
  }
  return shader;
}

/**
 * Compile un programme et relève ses attributs/uniformes actifs, pour éviter
 * d'entretenir à la main une liste de `getUniformLocation`.
 */
export function creerProgramme(gl, sourceSommet, sourceFragment) {
  const sommet = compilerShader(gl, gl.VERTEX_SHADER, sourceSommet);
  const fragment = compilerShader(gl, gl.FRAGMENT_SHADER, sourceFragment);
  const programme = gl.createProgram();
  gl.attachShader(programme, sommet);
  gl.attachShader(programme, fragment);
  gl.linkProgram(programme);
  gl.deleteShader(sommet);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) {
    const journal = gl.getProgramInfoLog(programme);
    gl.deleteProgram(programme);
    throw new Error(`Édition de liens impossible : ${journal}`);
  }

  const attributs = {};
  const nombreAttributs = gl.getProgramParameter(programme, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < nombreAttributs; i += 1) {
    const info = gl.getActiveAttrib(programme, i);
    attributs[info.name] = gl.getAttribLocation(programme, info.name);
  }

  const uniformes = {};
  const nombreUniformes = gl.getProgramParameter(programme, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nombreUniformes; i += 1) {
    const info = gl.getActiveUniform(programme, i);
    uniformes[info.name] = gl.getUniformLocation(programme, info.name);
  }

  return { programme, attributs, uniformes };
}

export function creerTampon(gl, donnees) {
  const tampon = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
  gl.bufferData(gl.ARRAY_BUFFER, donnees, gl.STATIC_DRAW);
  return tampon;
}

export function lierAttribut(gl, tampon, emplacement, taille) {
  if (emplacement === undefined || emplacement < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
  gl.enableVertexAttribArray(emplacement);
  gl.vertexAttribPointer(emplacement, taille, gl.FLOAT, false, 0, 0);
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

/**
 * Faces pleines. L'émergence décale la pièce vers le bas puis la ramène en
 * place, ce qui donne l'impression qu'elle sort du sol.
 */
export const SHADER_SOLIDE_SOMMET = `
attribute vec3 aPosition;
attribute vec3 aNormale;

uniform mat4 uProjectionVue;
uniform mat4 uModele;
uniform float uEmergence;
uniform float uHauteurEmergence;

varying vec3 vNormale;

void main() {
  vec3 position = aPosition;
  position.y -= (1.0 - uEmergence) * uHauteurEmergence;
  vNormale = mat3(uModele) * aNormale;
  gl_Position = uProjectionVue * uModele * vec4(position, 1.0);
}
`;

/**
 * Éclairage à deux sources (une principale chaude, une rasante d'appoint) et
 * facettes assumées : les normales sont constantes par face, donc le rendu
 * est plat, cohérent avec la maquette basse densité.
 */
export const SHADER_SOLIDE_FRAGMENT = `
precision mediump float;

varying vec3 vNormale;

uniform vec3 uCouleur;
uniform vec3 uCouleurChaude;
uniform float uMelangeChaud;
uniform float uEmissivite;
uniform float uOpacite;
uniform vec3 uDirectionLumiere;

void main() {
  vec3 normale = normalize(vNormale);
  if (!gl_FrontFacing) {
    normale = -normale;
  }

  // Ambiante hemispherique : le ciel eclaire par le dessus, le sol renvoie une
  // lumiere chaude par en dessous. Une ambiante plate et neutre ferait lire les
  // faces a l'ombre comme du gris, alors que la palette est entierement chaude.
  const vec3 CIEL = vec3(0.66, 0.63, 0.60);
  const vec3 SOL = vec3(0.44, 0.34, 0.26);
  const vec3 PRINCIPALE = vec3(1.15, 1.04, 0.88);

  float hemisphere = normale.y * 0.5 + 0.5;
  vec3 ambiante = mix(SOL, CIEL, hemisphere);
  float diffus = max(dot(normale, uDirectionLumiere), 0.0);
  vec3 eclairage = ambiante + PRINCIPALE * diffus * 0.62;

  vec3 base = mix(uCouleur, uCouleurChaude, uMelangeChaud);
  vec3 couleur = mix(base * eclairage, base, uEmissivite);

  gl_FragColor = vec4(couleur, uOpacite);
}
`;

/** Arêtes de la maquette et grille de sol. */
export const SHADER_LIGNE_SOMMET = `
attribute vec3 aPosition;

uniform mat4 uProjectionVue;
uniform mat4 uModele;

void main() {
  gl_Position = uProjectionVue * uModele * vec4(aPosition, 1.0);
}
`;

export const SHADER_LIGNE_FRAGMENT = `
precision mediump float;

uniform vec3 uCouleur;
uniform float uOpacite;

void main() {
  gl_FragColor = vec4(uCouleur, uOpacite);
}
`;

/** Essaim de particules qui converge vers les sommets de la maquette. */
export const SHADER_POINT_SOMMET = `
attribute vec3 aDepart;
attribute vec3 aCible;

uniform mat4 uProjectionVue;
uniform mat4 uModele;
uniform float uConvergence;
uniform float uTaillePoint;

void main() {
  vec3 position = mix(aDepart, aCible, uConvergence);
  gl_Position = uProjectionVue * uModele * vec4(position, 1.0);
  gl_PointSize = uTaillePoint;
}
`;

export const SHADER_POINT_FRAGMENT = `
precision mediump float;

uniform vec3 uCouleur;
uniform float uOpacite;

void main() {
  // Points ronds plutot que carres : distance au centre du sprite.
  vec2 ecart = gl_PointCoord - vec2(0.5);
  float distance = dot(ecart, ecart);
  if (distance > 0.25) {
    discard;
  }
  float bord = 1.0 - smoothstep(0.16, 0.25, distance);
  gl_FragColor = vec4(uCouleur, uOpacite * bord);
}
`;
