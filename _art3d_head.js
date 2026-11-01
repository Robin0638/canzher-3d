/* ===== ART3D: 统一 3D 美术规范（精致低多边形经营游戏） ===== */
var ART3D={
  bg:0x1c2433,
  fog:0x243044,
  fogNear:18,
  fogFar:48,
  palette:{
    cream:0xFFF6E8,
    wallHi:0xFFF8EF,
    wallLo:0xF0E0C8,
    wainscot:0xE8D4B8,
    woodA:0xE8C49A,
    woodB:0xD4A574,
    tileA:0xF2EDE4,
    tileB:0xE0D6C6,
    stone:0xC9BFB0,
    brand:0xFF6B35,
    brandLite:0xFF8C42,
    open:0x43B96A,
    renov:0x3D9BFF,
    view:0xFFB300,
    empty:0x3D4654,
    leaf:0x3FA35A,
    woodDark:0xA67C52,
    metal:0x8A939E,
    metalDark:0x5C6670,
    skin:0xF2C49A,
    skin2:0xE8B48A,
    hair:0x3A2C22,
    hair2:0x1A1410,
    pants:0x3D4A5C,
    glass:0xB8D9F0,
    night:0x1C2433
  },
  statusColor:function(st){
    if(st==='open')return ART3D.palette.open;
    if(st==='renovating')return ART3D.palette.renov;
    if(st==='viewing')return ART3D.palette.view;
    return ART3D.palette.empty;
  },
  applyRenderer:function(renderer){
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;
  },
  makeScene:function(){
    var scene=new THREE.Scene();
    scene.background=new THREE.Color(ART3D.bg);
    scene.fog=new THREE.Fog(ART3D.fog,ART3D.fogNear,ART3D.fogFar);
    return scene;
  },
  lightRig:function(scene,opts){
    opts=opts||{};
    var hemi=new THREE.HemisphereLight(0xFFE6C4,0x5A4A3C,0.62);
    scene.add(hemi);
    var key=new THREE.DirectionalLight(0xFFE2B0,0.92);
    key.position.set(opts.kx||-6,opts.ky||14,opts.kz||8);
    key.castShadow=true;
    var sc=opts.shadow||14;
    key.shadow.mapSize.set(1024,1024);
    key.shadow.camera.left=-sc;key.shadow.camera.right=sc;
    key.shadow.camera.top=sc;key.shadow.camera.bottom=-sc;
    key.shadow.camera.near=1;key.shadow.camera.far=48;
    key.shadow.bias=-0.0008;
    key.shadow.normalBias=0.02;
    scene.add(key);
    var fill=new THREE.DirectionalLight(0xA8C8EE,0.22);
    fill.position.set(8,6,-4);
    scene.add(fill);
    if(opts.warm!==false){
      var warm=new THREE.PointLight(0xFFB066,opts.warmI||0.85,opts.warmD||12,2);
      warm.position.set(opts.wx||0,opts.wy||2.2,opts.wz||0);
      scene.add(warm);
    }
    return {hemi:hemi,key:key,fill:fill};
  },
  makeMat:function(cache,c,r,mt,extra){
    var key=c+'_'+(r==null?.62:r)+'_'+(mt||0)+(extra?'_'+extra:'');
    if(!cache[key]){
      var p={color:c,roughness:r==null?.62:r,metalness:mt||0};
      if(extra==='emissive'){p.emissive=c;p.emissiveIntensity=.4}
      if(extra==='flat'){p.flatShading=true;p.roughness=r==null?.7:r}
      cache[key]=new THREE.MeshStandardMaterial(p);
    }
    return cache[key];
  },
  mesh:function(cache,geo,mat,x,y,z,shadow){
    var m=new THREE.Mesh(geo,mat);
    m.position.set(x||0,y||0,z||0);
    if(shadow!==false){m.castShadow=true;m.receiveShadow=true}
    return m;
  },
  box:function(cache,w,h,d,c,r,mt,x,y,z,s){
    return ART3D.mesh(cache,new THREE.BoxGeometry(w,h,d),ART3D.makeMat(cache,c,r,mt),x,y,z,s);
  },
  cyl:function(cache,rt,rb,h,c,r,mt,x,y,z,seg,s){
    return ART3D.mesh(cache,new THREE.CylinderGeometry(rt,rb,h,seg||20),ART3D.makeMat(cache,c,r,mt),x,y,z,s);
  },
  sphere:function(cache,r0,c,rr,mt,x,y,z,s){
    return ART3D.mesh(cache,new THREE.SphereGeometry(r0,16,12),ART3D.makeMat(cache,c,rr,mt),x,y,z,s);
  },
  cvTex:function(w,h,draw,rx,ry){
    var cv=document.createElement('canvas');cv.width=w;cv.height=h;
    draw(cv.getContext('2d'));
    var t=new THREE.CanvasTexture(cv);
    t.encoding=THREE.sRGBEncoding;
    t.wrapS=t.wrapT=THREE.RepeatWrapping;
    if(rx)t.repeat.set(rx,ry||rx);
    t.anisotropy=4;
    return t;
  },
  rr:function(x,X,Y,W2,H2,R){
    x.beginPath();x.moveTo(X+R,Y);
    x.arcTo(X+W2,Y,X+W2,Y+H2,R);x.arcTo(X+W2,Y+H2,X,Y+H2,R);
    x.arcTo(X,Y+H2,X,Y,R);x.arcTo(X,Y,X+W2,Y,R);x.closePath();
  },
  hx:function(n){return '#'+('00000'+n.toString(16)).slice(-6)},
  floorTex:function(cache,kind,c1,c2,rx,ry){
    var key='floor_'+kind+'_'+c1+'_'+c2+'_'+rx+'_'+ry;
    if(cache[key])return cache[key];
    var t=ART3D.cvTex(256,256,function(x){
      if(kind==='wood'){
        x.fillStyle=c1;x.fillRect(0,0,256,256);
        for(var i=0;i<4;i++){
          x.fillStyle=i%2?c2:c1;
          x.fillRect(0,i*64,256,62);
          x.fillStyle='rgba(90,50,20,.12)';
          x.fillRect(0,i*64+62,256,2);
          for(var k=0;k<3;k++){
            x.fillStyle='rgba(120,70,30,.06)';
            x.fillRect((i*47+k*83)%200,i*64+8,40,46);
          }
        }
        x.strokeStyle='rgba(70,40,15,.18)';x.lineWidth=2;
        x.strokeRect(1,1,254,254);
      }else if(kind==='tile'){
        x.fillStyle=c1;x.fillRect(0,0,256,256);
        x.fillStyle=c2;x.fillRect(0,0,126,126);x.fillRect(128,128,126,126);
        x.strokeStyle='rgba(80,70,55,.14)';x.lineWidth=3;
        x.strokeRect(2,2,122,122);x.strokeRect(130,130,122,122);
        x.fillStyle='rgba(255,255,255,.12)';x.fillRect(4,4,118,40);
      }else{
        x.fillStyle=c1||'#C9BFB0';x.fillRect(0,0,256,256);
        x.fillStyle=c2||'#B8AE9E';
        x.fillRect(0,0,128,128);x.fillRect(128,128,128,128);
        x.strokeStyle='rgba(70,60,45,.12)';x.lineWidth=2;
        x.strokeRect(1,1,126,126);x.strokeRect(129,129,126,126);
        x.fillStyle='rgba(255,255,255,.08)';
        x.fillRect(8,8,112,28);x.fillRect(136,136,112,28);
      }
    },rx||2,ry||2);
    cache[key]=t;return t;
  },
  person:function(cache,o){
    o=o||{};
    var P=ART3D.palette;
    var g=new THREE.Group();
    var bodyC=o.body||0x5B8DEF;
    function leg(side){
      var hip=new THREE.Group();hip.position.set(.1*side,.7,0);
      hip.add(ART3D.box(cache,.13,.34,.14,o.pants||P.pants,.72,0,0,-.17,0));
      var knee=new THREE.Group();knee.position.y=-.34;
      knee.add(ART3D.box(cache,.11,.3,.12,o.pants||P.pants,.72,0,0,-.15,0));
      knee.add(ART3D.box(cache,.12,.07,.2,0x2A2E35,.7,0,0,-.3,.04,false));
      hip.add(knee);g.add(hip);
      return {hip:hip,knee:knee};
    }
    var L=leg(-1),R=leg(1);
    g.add(ART3D.box(cache,.38,.52,.26,bodyC,.68,0,0,.94,0));
    if(o.apron){
      g.add(ART3D.box(cache,.32,.4,.03,0xFFF8F0,.7,0,0,.9,.145,false));
      g.add(ART3D.box(cache,.32,.06,.035,o.accent||P.brand,.55,0,0,1.1,.143,false));
    }
    if(o.vest){
      g.add(ART3D.box(cache,.4,.36,.28,o.accent||0xFF8C42,.62,0,0,1.0,0));
    }
    function arm(side){
      var sh=new THREE.Group();sh.position.set(.23*side,1.18,0);
      sh.add(ART3D.box(cache,.08,.46,.09,bodyC,.68,0,0,-.23,0));
      sh.add(ART3D.sphere(cache,.055,o.skin||P.skin,.7,0,0,-.47,0,false));
      g.add(sh);return sh;
    }
    var AL=arm(-1),AR=arm(1);
    var head=new THREE.Group();head.position.y=1.44;
    head.add(ART3D.sphere(cache,.16,o.skin||P.skin,.72,0,0,0));
    head.add(ART3D.sphere(cache,.168,o.hair||P.hair,.8,0,0,.03,-.01,false));
    head.add(ART3D.sphere(cache,.022,0x2A2E35,.4,-.055,.02,.14,false));
    head.add(ART3D.sphere(cache,.022,0x2A2E35,.4,.055,.02,.14,false));
    if(o.hat==='chef'){
      head.add(ART3D.cyl(cache,.17,.17,.03,0xFFFBF2,.75,0,0,.14,0,16,false));
      head.add(ART3D.cyl(cache,.1,.14,.18,0xFFFBF2,.75,0,0,.24,0,16,false));
      if(o.accent)head.add(ART3D.cyl(cache,.14,.14,.04,o.accent,.6,0,0,.18,0,16,false));
    }
    if(o.hat==='cap'){
      var capC=o.accent||P.brand;
      head.add(ART3D.cyl(cache,.165,.165,.06,capC,.65,0,0,.14,0,16,false));
      head.add(ART3D.box(cache,.14,.025,.12,capC,.65,0,0,.12,.17,false));
    }
    if(o.hat==='beanie'){
      head.add(ART3D.cyl(cache,.16,.17,.12,o.accent||0xE74C3C,.75,0,0,.12,0,16,false));
    }
    g.add(head);
    g.userData={hipL:L.hip,kneeL:L.knee,hipR:R.hip,kneeR:R.knee,armL:AL,armR:AR,head:head,phase:Math.random()*7};
    g.scale.setScalar(o.scale||1);
    return g;
  },
  plant:function(cache,x,z,scale){
    var P=ART3D.palette,g=new THREE.Group();
    g.add(ART3D.cyl(cache,.22,.17,.32,0xC07050,.7,0,0,.16,0,14));
    g.add(ART3D.sphere(cache,.34,P.leaf,.78,0,0,.55,0));
    g.add(ART3D.sphere(cache,.22,0x5BBF6E,.75,0,.12,.72,.05,false));
    g.add(ART3D.sphere(cache,.18,0x2F8F4A,.75,0,-.14,.68,-.04,false));
    g.position.set(x||0,0,z||0);
    g.scale.setScalar(scale||1);
    return g;
  },
  bench:function(cache,x,z){
    var g=new THREE.Group();
    g.add(ART3D.box(cache,1.05,.12,.42,ART3D.palette.woodDark,.72,0,0,.36,0));
    g.add(ART3D.box(cache,1.0,.1,.12,ART3D.palette.woodDark,.72,0,0,.52,-.14,false));
    [-1,1].forEach(function(sd){
      g.add(ART3D.box(cache,.08,.34,.36,0x5C6670,.45,.45,sd*.4,.18,0,false));
    });
    g.position.set(x||0,0,z||0);
    return g;
  }
};
