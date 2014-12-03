 var windowWidth = window.innerWidth, windowHeight = window.innerHeight;
 var camera,renderer,scene;
 window.onload = function (){
    console.log("onload");
    Init();
    animate();
 };

function Init(){
        scene = new THREE.Scene();
  
       //setup camera
 		camera = new LeiaCamera();
        camera.position.copy(new THREE.Vector3(_camPosition.x, _camPosition.y, _camPosition.z));
        camera.lookAt(new THREE.Vector3(_tarPosition.x, _tarPosition.y, _tarPosition.z));
        scene.add(camera);
  
       //setup rendering parameter
 		renderer = new LeiaWebGLRenderer({
         antialias:true, 
 		renderMode: _renderMode, 
		shaderMode: _nShaderMode,
		colorMode : _colorMode,
		devicePixelRatio: 1 
        } );
 		renderer.Leia_setSize( windowWidth, windowHeight );
 		document.body.appendChild( renderer.domElement );
  
       //add object to Scene
        addObjectsToScene();
  
        //add Light
 		addLights();
  
        //add Gyro Monitor
        //addGyroMonitor();
 }

 function animate() 
 {
 	requestAnimationFrame( animate );
    renderer.setClearColor(new THREE.Color().setRGB(0.0, 0.0, 0.0)); 
	renderer.Leia_render(scene, camera,undefined,undefined,_holoScreenSize,_camFov,_messageFlag);
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
  var sky = new THREE.Mesh(new THREE.SphereGeometry(25, 30, 30), skyMaterial);
  sky.translateZ(10);
  scene.add(sky);

  var irisTex = THREE.ImageUtils.loadTexture("resource/iris.png");
  irisTex.format = THREE.RGBAFormat;
  vs = "varying vec3 incident;\n" +
    "varying vec3 ref;\n" +
    "varying vec3 f_normal;\n" +
    "void main() {\n" +
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
    "  vec4 wpos = modelMatrix * vec4( position, 1.0 );\n" +
    "  incident = wpos.xyz-cameraPosition;\n" +
    "  ref = reflect(incident, normal);\n" +
    "  f_normal = normal;\n" +
    "}\n";
  fs= "uniform samplerCube cube;\n" +
    "uniform sampler2D iris;\n" +
    "varying vec3 incident;\n" +
    "varying vec3 ref;\n" +
    "varying vec3 f_normal;\n" +
    "void main() {\n" +
    "  float icos = abs(dot(normalize(incident), normalize(f_normal)));\n" +
    "  vec4 factor = texture2D(iris, vec2(1.0-icos, 0.0));\n" +
    "  gl_FragColor = textureCube(cube, normalize(ref))*factor;\n" +
    "  gl_FragColor.a += 0.2;\n" +
    "}\n";
  var material = new THREE.ShaderMaterial({
    uniforms: {
      cube: { type: "t", value: cubeTex },
      iris: { type: "t", value: irisTex }
    },
      vertexShader: vs,
      fragmentShader: fs,
  });
  material.transparent = true;
  material.blending = THREE.CustomBlending;
  material.blendSrc = THREE.OneFactor;
  material.side = THREE.BackSide;
  var graph1 = new THREE.Mesh(new THREE.SphereGeometry(8, 30, 30), material);
  scene.add(graph1);
  var material2 = new THREE.ShaderMaterial({
    uniforms: {
      cube: { type: "t", value: cubeTex },
      iris: { type: "t", value: irisTex }
    },
      vertexShader: vs,
      fragmentShader: fs,
  });
  material2.transparent = true;
  material2.blending = THREE.CustomBlending;
  material2.blendSrc = THREE.OneFactor;
  var graph2 = new THREE.Mesh(new THREE.SphereGeometry(8, 30, 30), material2);
  scene.add(graph2);
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
