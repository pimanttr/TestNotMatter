 var windowWidth = window.innerWidth, windowHeight = window.innerHeight;
 var startTime;
 var renderer,holoScreen,scene,ball, noiseBlend;
 window.onload = function (){
    console.log("onload");
    Init();
    animate();
 };

function Init() {
  scene = new THREE.Scene();
  startTime = Date.now();

  var leiaDisplayInfo = new LeiaDisplayInfo('https://www.leiainc.com/latest/LeiaCore/config/displayPrototypeSmall.json');
  holoScreen  = new LeiaHoloScreen(leiaDisplayInfo);
  renderer    = new LeiaRenderer(leiaDisplayInfo, holoScreen);
  document.body.appendChild( renderer.renderer.domElement );

  //add object to Scene
  addObjectsToScene();

  //add Light
  addLights();
}

function animate() {
  requestAnimationFrame( animate );
  var time = (Date.now() - startTime)/1000;
  var rotation = new THREE.Euler(0, time, 0, 'XYZ');
  ball.setRotationFromEuler(rotation);
  var x = time/5;
  noiseBlend.value = Math.abs((x % 2) - 1);
  renderer.render(scene, holoScreen);
}

function addObjectsToScene(){
  var path = "resource/";
  var format = '.jpg';
  var urls = [
      path + 'posx' + format,
      path + 'negx' + format,
      path + 'posy' + format,
      path + 'negy' + format,
      path + 'posz' + format,
      path + 'negz' + format
  ];

  var cubeTex = THREE.ImageUtils.loadTextureCube(urls);
  cubeTex.format = THREE.RGBFormat;

  var skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      cube: { type: "t", value: cubeTex }
    },
      vertexShader:
    "varying vec3 f_normal;\n" +
    "void main() {\n" +
    "  f_normal = normal;\n" +
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n" +
    "}\n",
      fragmentShader:
    "uniform samplerCube cube;\n" +
    "varying vec3 f_normal;\n" +
    "void main() {\n" +
    "  gl_FragColor = textureCube(cube, f_normal);\n" +
    "}\n"
  });
  skyMaterial.side = THREE.BackSide;
  var sky = new THREE.Mesh(new THREE.SphereGeometry(50, 30, 30), skyMaterial);
  scene.add(sky);

  var irisTex = THREE.ImageUtils.loadTexture("resource/iris.png");
  irisTex.format = THREE.RGBAFormat;
  irisTex.minFilter = THREE.LinearFilter;
  irisTex.generateMipmaps = false;
  var noiseTex = THREE.ImageUtils.loadTexture("resource/perlin_noise.png");
  noiseTex.format = THREE.RGBFormat;
  noiseTex.minFilter = THREE.LinearFilter;
  noiseTex.generateMipmaps = false;
  noiseTex.wrapS = THREE.RepeatWrapping;
  noiseTex.wrapT = THREE.RepeatWrapping;
  vs = "varying vec3 incident;\n" +
    "varying vec3 ref;\n" +
    "varying vec3 f_normal;\n" +
    "varying vec2 f_uv;\n" +
    "void main() {\n" +
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
    "  vec4 wpos = modelMatrix * vec4( position, 1.0 );\n" +
    "  incident = wpos.xyz-cameraPosition;\n" +
    "  vec3 n = (modelMatrix * vec4(normal, 0.0)).xyz;\n" +
    "  ref = reflect(incident, n);\n" +
    "  f_normal = n;\n" +
    "  f_uv = uv;\n" +
    "}\n";
  fs= "uniform samplerCube cube;\n" +
    "uniform sampler2D noise;\n" +
    "uniform sampler2D iris;\n" +
    "uniform float noiseBlend;\n" +
    "varying vec3 incident;\n" +
    "varying vec3 ref;\n" +
    "varying vec3 f_normal;\n" +
    "varying vec2 f_uv;\n" +
    "void main() {\n" +
    "  float icos = abs(dot(normalize(incident), normalize(f_normal)));\n" +
    "  vec2 depth2 = texture2D(noise, f_uv).rg;\n" +
    "  float depth = mix(depth2.x, depth2.y, noiseBlend);\n" +
    "  vec4 factor = texture2D(iris, vec2(icos, 0.95 - 0.5 * depth));\n" +
    "  gl_FragColor = textureCube(cube, normalize(ref))*factor;\n" +
    "  gl_FragColor.a += 0.1;\n" +
    "}\n";
  noiseBlend = { type: "f", value: 0.0 };
  material = new THREE.ShaderMaterial({
    uniforms: {
      noiseBlend: noiseBlend,
      cube: { type: "t", value: cubeTex },
      iris: { type: "t", value: irisTex },
      noise: { type: "t", value: noiseTex }
    },
      vertexShader: vs,
      fragmentShader: fs,
  });
  material.transparent = true;
  material.blending = THREE.CustomBlending;
  material.blendSrc = THREE.OneFactor;
  material.side = THREE.BackSide;
  ball = new THREE.Object3D();
  scene.add(ball);
  var graph1 = new THREE.Mesh(new THREE.SphereGeometry(8, 50, 25), material);
  ball.add(graph1);
  material2 = new THREE.ShaderMaterial({
    uniforms: {
      noiseBlend: noiseBlend,
      cube: { type: "t", value: cubeTex },
      iris: { type: "t", value: irisTex },
      noise: { type: "t", value: noiseTex }
    },
      vertexShader: vs,
      fragmentShader: fs,
  });
  material2.transparent = true;
  material2.blending = THREE.CustomBlending;
  material2.blendSrc = THREE.OneFactor;
  var graph2 = new THREE.Mesh(new THREE.SphereGeometry(8, 50, 25), material2);
  ball.add(graph2);
}

function addLights(){
  //Add Lights Here
  var xl = new THREE.DirectionalLight( 0x555555 );
  xl.position.set( 1, 0, 2 );
  scene.add( xl );
  var pl = new THREE.PointLight(0x111111);
  pl.position.set(-20, 10, 20);
  scene.add(pl);
  var ambientLight = new THREE.AmbientLight(0x111111);	
  scene.add(ambientLight);
}
