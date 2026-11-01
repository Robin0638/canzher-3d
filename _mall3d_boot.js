mall3dBoot:function(mall){
  var stage=document.getElementById('mp-stage');
  if(!stage)return;
  var P=ART3D.palette;
  var W=stage.clientWidth||600,H=stage.clientHeight||380;
  var renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  ART3D.applyRenderer(renderer);
  renderer.setSize(W,H);
  renderer.domElement.style.touchAction='none';
  renderer.domElement.style.cursor='grab';
  stage.appendChild(renderer.domElement);
  var scene=ART3D.makeScene();
  scene.fog=new THREE.Fog(ART3D.fog,22,52);
  var n=Math.max(4,mall.slots||4);
  var unitW=1.42,unitD=1.72,unitH=1.78,corrW=2.7;
  var totalW=n*unitW;
  var cam=new THREE.PerspectiveCamera(40,W/H,.1,120);
  var orbit={theta:.38,phi:.9,r:10.2+n*.36,tx:0,ty:.95,tz:-.25};
  orbit.r=Math.min(16.5,orbit.r);
  function applyCam(){
    orbit.phi=Math.max(.48,Math.min(1.12,orbit.phi));
    orbit.theta=Math.max(-1.15,Math.min(1.15,orbit.theta));
    orbit.r=Math.max(8,Math.min(20,orbit.r));
    cam.position.set(
      orbit.tx+orbit.r*Math.sin(orbit.phi)*Math.sin(orbit.theta),
      orbit.ty+orbit.r*Math.cos(orbit.phi),
      orbit.tz+orbit.r*Math.sin(orbit.phi)*Math.cos(orbit.theta));
    cam.lookAt(orbit.tx,orbit.ty,orbit.tz);
  }
  applyCam();
  ART3D.lightRig(scene,{kx:-5,ky:13,kz:8,shadow:Math.max(12,totalW),warmI:.95,warmD:13,wx:0,wy:2.3,wz:-.4});
  var brandPt=new THREE.PointLight(P.brand,.4,8,2);
  brandPt.position.set(0,2.2,corrW*.2);scene.add(brandPt);
  var E={
    renderer:renderer,scene:scene,cam:cam,orbit:orbit,mallId:mall.id,
    slots:n,half:n,unitW:unitW,unitD:unitD,unitH:unitH,corrW:corrW,totalW:totalW,
    stores:[],people:[],picks:[],lights:[],escSteps:[],dyn:null,
    matCache:{},t0:Math.random()*9,pop:50,drag:null
  };
  G.mall3d.engine=E;
  var cache=E.matCache;
  function M(c,r,mt){return ART3D.makeMat(cache,c,r,mt)}
  function box(w,h,d,c,r,mt,x,y,z,s){return ART3D.box(cache,w,h,d,c,r,mt,x,y,z,s)}
  function cyl(rt,rb,h,c,r,mt,x,y,z,seg,s){return ART3D.cyl(cache,rt,rb,h,c,r,mt,x,y,z,seg,s)}
  function sphere(r0,c,rr,mt,x,y,z,s){return ART3D.sphere(cache,r0,c,rr,mt,x,y,z,s)}
  function mesh(geo,mat,x,y,z,s){return ART3D.mesh(cache,geo,mat,x,y,z,s)}
  function cvTex(w,h,draw,rx,ry){return ART3D.cvTex(w,h,draw,rx,ry)}
  function rr(x,X,Y,W2,H2,R){ART3D.rr(x,X,Y,W2,H2,R)}
  function hx(num){return ART3D.hx(num)}
  function signTexture(title,sub,bg,fg,accent){
    return cvTex(256,88,function(x){
      var g=x.createLinearGradient(0,0,0,88);
      g.addColorStop(0,bg||'#243044');g.addColorStop(1,'#1a2230');
      x.fillStyle=g;x.fillRect(0,0,256,88);
      if(accent){x.fillStyle=accent;x.fillRect(0,0,256,8)}
      x.fillStyle='rgba(255,255,255,.08)';rr(x,8,14,240,36,10);x.fill();
      x.fillStyle=fg||'#fff';x.font='900 26px "Microsoft YaHei",sans-serif';
      x.textAlign='center';x.textBaseline='middle';
      x.fillText((title||'').slice(0,8),128,34);
      if(sub){x.font='700 14px "Microsoft YaHei",sans-serif';x.globalAlpha=.9;x.fillText(sub,128,66);x.globalAlpha=1}
    });
  }
  /* ---------- 建筑骨架 ---------- */
  var floorY=0.05;
  var ground=mesh(new THREE.PlaneGeometry(160,120),new THREE.MeshStandardMaterial({color:0x2A3344,roughness:1}),0,-0.04,2,false);
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  var floorD=unitD+corrW+2.6;
  var mallFloorTex=ART3D.floorTex(cache,'stone','#D2C8B8','#C0B6A4',Math.max(3,n),3);
  var mallFloor=mesh(new THREE.PlaneGeometry(totalW+1.8,floorD),new THREE.MeshStandardMaterial({map:mallFloorTex,roughness:.78}),0,floorY,-(unitD*.35+0.15));
  mallFloor.rotation.x=-Math.PI/2;mallFloor.receiveShadow=true;scene.add(mallFloor);
  var corrZ0=-(corrW/2),corrZ1=corrW/2+0.95;
  var corrDepth=corrZ1-corrZ0;
  var corridor=mesh(new THREE.PlaneGeometry(totalW+0.7,corrDepth),new THREE.MeshStandardMaterial({color:0xF3EBDC,roughness:.72}),0,floorY+0.006,(corrZ0+corrZ1)/2,false);
  corridor.rotation.x=-Math.PI/2;scene.add(corridor);
  /* 中庭品牌色导视线 + 盲道感 */
  scene.add(box(totalW+0.4,0.025,0.1,P.brand,.5,0,0,floorY+0.02,corrZ0+corrDepth*.28,false));
  scene.add(box(totalW+0.2,0.02,0.05,P.brandLite,.55,0,0,floorY+0.02,corrZ0+corrDepth*.72,false));
  /* 后墙 / 侧墙 / 南侧玻璃栏河 */
  var wallHi=P.wallHi,wallLo=P.wainscot;
  var backZ=-(corrW/2+unitD+0.14);
  var wallY=unitH+0.4;
  box(totalW+1.8,wallY*.42,.24,wallLo,.85,0,0,wallY*.21,backZ);
  box(totalW+1.8,wallY*.58,.24,wallHi,.9,0,0,wallY*.42+wallY*.29,backZ);
  /* 后墙顶部檐口 + 暖色洗墙 */
  box(totalW+2.0,.16,.34,P.brand,.55,0,0,wallY+0.02,backZ+0.02,false);
  for(var wi=0;wi<Math.min(n,12);wi++){
    var wx0=-totalW/2+unitW/2+wi*unitW;
    var lamp=mesh(new THREE.SphereGeometry(.06,10,8),new THREE.MeshStandardMaterial({color:0xFFE0B0,emissive:0xFFB066,emissiveIntensity:1.4}),wx0,unitH+0.55,backZ+0.2,false);
    scene.add(lamp);
  }
  var sideH=1.25;
  box(.24,sideH,floorD,wallLo,.82,0,0,sideH/2,-(unitD*.2),-(totalW/2+0.85));
  box(.24,sideH,floorD,wallLo,.82,0,0,sideH/2,-(unitD*.2),(totalW/2+0.85));
  /* 侧墙上部立柱感 */
  [-1,1].forEach(function(sd){
    box(.28,unitH+0.2,.28,wallHi,.88,0,0,(unitH+0.2)/2,sd*(totalW/2+0.78),backZ+unitD*0.2);
  });
  var entW=2.2,entZ=corrZ1+0.18;
  var railGlass=new THREE.MeshStandardMaterial({color:P.glass,roughness:.08,metalness:.15,transparent:true,opacity:.28});
  var railH=.78;
  var sideSpan=(totalW+1.8)/2-entW/2;
  mesh(new THREE.BoxGeometry(sideSpan,railH,.07),railGlass,-(entW/2+sideSpan/2),railH/2,entZ,false);
  mesh(new THREE.BoxGeometry(sideSpan,railH,.07),railGlass,(entW/2+sideSpan/2),railH/2,entZ,false);
  box(totalW+1.8,.07,.14,P.metal,.4,.45,0,railH,entZ,false);
  [-1,1].forEach(function(sd){
    box(.18,2.25,.18,P.brand,.5,0,0,1.12,sd*(entW/2),entZ);
  });
  var entTex=cvTex(280,72,function(x){
    var g=x.createLinearGradient(0,0,280,0);g.addColorStop(0,hx(P.brand));g.addColorStop(1,hx(P.brandLite));
    x.fillStyle=g;rr(x,4,6,272,60,16);x.fill();
    x.fillStyle='rgba(255,255,255,.22)';rr(x,4,6,272,22,16);x.fill();
    x.fillStyle='#fff';x.font='900 30px "Microsoft YaHei",sans-serif';
    x.textAlign='center';x.textBaseline='middle';
    x.fillText('MALL 入口',140,40);
  });
  mesh(new THREE.PlaneGeometry(2.0,.46),new THREE.MeshBasicMaterial({map:entTex}),0,2.08,entZ+0.05,false);
  box(2.3,.1,.12,P.brand,.4,.35,0,1.82,entZ,false);
  /* 装饰上层 */
  var tier=G.mallPlanTier(mall);
  for(var f=1;f<tier;f++){
    var uy=f*(unitH+0.5)+0.04;
    box(totalW+0.7,.12,.5,P.wainscot,.85,0,0,uy,-(corrW/2+unitD*0.4));
    box(totalW+0.7,.07,.05,railGlass,.2,.2,0,uy+0.34,-(corrW/2+unitD*0.4),false);
    for(var uj=0;uj<Math.min(n,10);uj++){
      var ux=-totalW/2+unitW/2+uj*unitW;
      var lit=(uj+f)%3!==1;
      mesh(new THREE.BoxGeometry(unitW*.5,.3,.04),new THREE.MeshStandardMaterial({
        color:lit?0xFFE4B8:0x4A5562,emissive:lit?0xFFB066:0x000000,emissiveIntensity:lit?.7:0,roughness:.4
      }),ux,uy+0.52,-(corrW/2+unitD*0.4)-0.26,false);
    }
  }
  /* 楼顶招牌 */
  var mallName=(mall.name||'商场');
  var mallTex=cvTex(512,128,function(x){
    var g=x.createLinearGradient(0,0,512,0);g.addColorStop(0,hx(P.brand));g.addColorStop(1,'#FF9A55');
    x.fillStyle=g;rr(x,6,12,500,100,22);x.fill();
    x.fillStyle='rgba(255,255,255,.24)';rr(x,6,12,500,34,22);x.fill();
    x.fillStyle='#fff';x.font='900 46px "Microsoft YaHei",sans-serif';
    x.textAlign='center';x.textBaseline='middle';
    x.fillText(mallName,256,68);
  });
  var topY=wallY+0.28+(tier>1?(tier-1)*(unitH+0.5)*0.28:0);
  mesh(new THREE.PlaneGeometry(Math.min(totalW*.68,5.6),1.1),new THREE.MeshBasicMaterial({map:mallTex}),0,topY,backZ-0.02,false);
  /* 扶梯装饰（踏步沿坡道循环：一侧上行、一侧下行） */
  function escalator(side){
    var g=new THREE.Group();
    g.add(box(.78,.1,corrDepth*.82,P.metalDark,.4,.55,0,.05,0));
    for(var i=0;i<7;i++){
      var st=box(.58,.045,.2,P.metal,.35,.65,0,.12,-corrDepth*.32+i*.28,false);
      st.userData.esc={idx:i,span:corrDepth*.64,up:side<0};
      E.escSteps.push(st);g.add(st);
    }
    g.add(box(.05,.48,corrDepth*.7,P.glass,.15,.2,0,.3,-.34,false));
    g.add(box(.05,.48,corrDepth*.7,P.glass,.15,.2,0,.3,.34,false));
    g.add(box(.08,.06,corrDepth*.72,P.brand,.5,.3,0,.56,0,false));
    g.position.set(side*(totalW/2+0.42),0,(corrZ0+corrZ1)/2);
    return g;
  }
  scene.add(escalator(-1));scene.add(escalator(1));
  /* 中庭绿植 / 长椅 */
  scene.add(ART3D.plant(cache,-totalW*0.3,corrZ0+corrDepth*.55,1));
  scene.add(ART3D.plant(cache,totalW*0.28,corrZ0+corrDepth*.62,.95));
  scene.add(ART3D.bench(cache,0,corrZ0+corrDepth*.58));
  /* 选中光环 */
  var ring=mesh(new THREE.TorusGeometry(.78,.05,10,32),new THREE.MeshBasicMaterial({color:P.brand,transparent:true,opacity:.9}),0,-99,0,false);
  ring.rotation.x=-Math.PI/2;scene.add(ring);E.ring=ring;
  /* 单排铺位 */
  var sideDepth=unitD;
  function slotWorld(i){
    return {x:-totalW/2+unitW/2+i*unitW,z:-(corrW/2+sideDepth/2),faceZ:1,top:true};
  }
  E.slotWorld=slotWorld;
  function clearStores(){
    E.stores.forEach(function(st){
      scene.remove(st.root);
      st.root.traverse(function(o){if(o.geometry)o.geometry.dispose()});
    });
    E.stores=[];E.picks=[];
    E.lights.forEach(function(l){scene.remove(l)});E.lights=[];
    if(E.dyn){scene.remove(E.dyn);E.dyn=null}
  }
  E.rebuild=function(mall2){
    clearStores();
    var tenants=mall2.tenants||[];
    var dyn=new THREE.Group();scene.add(dyn);E.dyn=dyn;
    var awnPalette=[0x43B96A,0x3D9BFF,0xFFB300,0x9C6BFF,0x2EC4B6,0xFF6B6B,0x7BC67E,0xFF8C42];
    for(var i=0;i<E.slots;i++){
      var t=tenants[i]||null;
      var pos=E.slotWorld(i);
      var status=!t?'empty':(t.status||'open');
      var g=new THREE.Group();
      g.position.set(pos.x,floorY,pos.z);
      g.userData.slot=i;
      var awnC=status==='open'?awnPalette[i%awnPalette.length]:
                status==='renovating'?P.renov:status==='viewing'?P.view:P.empty;
      var bodyC=status==='open'?0xFFF6E8:status==='renovating'?0xEAF2FB:status==='viewing'?0xFFF3DD:0x353E4C;
      /* 店壳 + 店内地板 */
      box(unitW,unitH,sideDepth,bodyC,.82,0,0,unitH/2,0);
      mesh(new THREE.PlaneGeometry(unitW*.88,sideDepth*.72),
        new THREE.MeshStandardMaterial({color:status==='open'?0xF0E2C8:status==='empty'?0x2A303C:0xE4DCCC,roughness:.8}),
        0,.07,sideDepth*.04,false);
      /* 彩色雨棚 + 底部门框 */
      box(unitW+0.12,.16,sideDepth*.28,awnC,.55,.2,0,unitH-0.02,sideDepth*.4);
      box(unitW*.86,.08,.08,P.woodDark,.65,0,0,.04,sideDepth*.5*pos.faceZ-0.01,false);
      /* 玻璃立面 */
      var glassEmi=status==='open'?0xFFB066:status==='viewing'?0xE65100:0x000000;
      var glass=new THREE.MeshStandardMaterial({
        color:status==='open'?0xFFE8C4:status==='empty'?0x222A34:0xA8C0D8,
        roughness:.08,metalness:.12,transparent:true,
        opacity:status==='open'?.3:status==='empty'?.75:.42,
        emissive:glassEmi,emissiveIntensity:status==='open'?1.0:status==='viewing'?.28:0
      });
      mesh(new THREE.BoxGeometry(unitW*.82,unitH*.68,.04),glass,0,unitH*.38,sideDepth*.5*pos.faceZ,false);
      /* 招牌 */
      var title=!t?'空铺':(t.name||'店铺');
      var sub=status==='open'?('¥'+(t.rent||mall2.rent||0)+'/天'):
              status==='renovating'?('装修中 '+t.phaseDays+'天'):
              status==='viewing'?('看铺 '+t.phaseDays+'天'):'点击招商';
      var bg=status==='open'?'#163528':status==='renovating'?'#142848':status==='viewing'?'#3D2C0C':'#242C38';
      var fg=status==='open'?'#B8F5CC':status==='renovating'?'#A8D4FF':status==='viewing'?'#FFE0A0':'#9AA8B8';
      mesh(new THREE.PlaneGeometry(unitW*.92,.36),new THREE.MeshBasicMaterial({map:signTexture(title,sub,bg,fg,hx(awnC))}),
        0,unitH+0.04,sideDepth*.5*pos.faceZ+0.04,false);
      /* 状态内容 */
      if(status==='open'){
        box(unitW*.55,.42,.34,P.woodDark,.7,0,0,.21,-sideDepth*.1);
        box(unitW*.5,.05,.22,0xE8C49A,.65,0,0,.64,-sideDepth*.16,false);
        box(unitW*.36,.05,.2,0xE8C49A,.65,0,0,.98,-sideDepth*.16,false);
        /* 桌上小碗 */
        cyl(.08,.1,.06,0xFFFBF2,.55,0,0,.7,-sideDepth*.1,12,false);
        var glow=new THREE.PointLight(0xFFB066,1.0,3.2,2);
        glow.position.set(0,1.05,sideDepth*.12);g.add(glow);E.lights.push(glow);
        if(t.fromOwned){
          mesh(new THREE.PlaneGeometry(.3,.13),new THREE.MeshBasicMaterial({map:signTexture('自营','品牌',hx(P.brand),'#fff')}),
            unitW*.32,unitH+0.24,sideDepth*.35,false);
        }
        if(i%2===0){
          var cust=ART3D.person(cache,{body:[0xE57373,0x5B8DEF,0x7BC67E,0xFFB300,0x9C6BFF][i%5],pants:0x3D4A5C,scale:.95});
          cust.position.set((i%3-1)*unitW*.2,0,sideDepth*.08);
          cust.rotation.y=Math.PI;
          g.add(cust);
        }
        if(i%3===1){
          var staff=ART3D.person(cache,{body:awnC,apron:true,accent:P.brand,hair:0x2A2018,scale:.98});
          staff.position.set(-unitW*.2,0,-sideDepth*.05);
          staff.rotation.y=0.4;
          g.add(staff);
        }
      }else if(status==='renovating'){
        [-1,1].forEach(function(sd){
          cyl(.03,.03,unitH*.95,P.metal,.4,.55,sd*unitW*.36,unitH*.45,sideDepth*.42,8);
        });
        for(var bi=0;bi<3;bi++){
          box(unitW*.76,.045,.045,P.metalDark,.45,.6,0,.32+bi*.4,sideDepth*.42,false);
        }
        mesh(new THREE.PlaneGeometry(unitW*.72,.42),new THREE.MeshBasicMaterial({map:signTexture('装修中','Reno','#1565C0','#BBDEFB')}),
          0,unitH*.4,sideDepth*.53,false);
        var dust=new THREE.PointLight(0x64B5F6,.45,2.4,2);
        dust.position.set(0,1.0,sideDepth*.2);g.add(dust);E.lights.push(dust);
        var worker=ART3D.person(cache,{body:0x3D9BFF,pants:0x2C3540,hat:'cap',accent:0x3D9BFF,scale:.95});
        worker.position.set(unitW*.15,0,sideDepth*.08);worker.rotation.y=Math.PI*.85;
        g.add(worker);
        /* 材料堆 */
        box(.28,.22,.22,0xC4A574,.75,0,0,.11,-sideDepth*.28,false);
      }else if(status==='viewing'){
        mesh(new THREE.PlaneGeometry(unitW*.74,.44),new THREE.MeshBasicMaterial({map:signTexture('看铺期','招商中','#E65100','#FFE0B2')}),
          0,unitH*.42,sideDepth*.53,false);
        var looker=ART3D.person(cache,{body:P.view,pants:0x4E342E,hat:'beanie',accent:P.view,scale:.96});
        looker.position.set(unitW*.22,0,sideDepth*.48);looker.rotation.y=Math.PI;
        g.add(looker);
        var looker2=ART3D.person(cache,{body:0x5B8DEF,pants:0x3D4A5C,scale:.94});
        looker2.position.set(-unitW*.25,0,sideDepth*.42);looker2.rotation.y=Math.PI*.7;
        g.add(looker2);
      }else{
        mesh(new THREE.PlaneGeometry(unitW*.72,.38),new THREE.MeshBasicMaterial({map:signTexture('空铺','点击招商','#2A3340','#9AA8B8')}),
          0,unitH*.42,sideDepth*.53,false);
        /* 虚线感地贴 */
        box(unitW*.5,.02,.04,P.empty,.5,.2,0,.09,sideDepth*.2,false);
      }
      var pick=mesh(new THREE.BoxGeometry(unitW*1.04,unitH*1.08,sideDepth*1.08),
        new THREE.MeshBasicMaterial({visible:false}),0,unitH*.5,0,false);
      pick.userData.slot=i;
      g.add(pick);E.picks.push(pick);
      scene.add(g);
      E.stores.push({root:g,slot:i,status:status,tenant:t,pick:pick,pos:pos});
    }
    E.syncPeople(mall2);
  };
  E.syncPeople=function(mall2){
    var tenants=mall2.tenants||[];
    var openCount=tenants.filter(function(t){return t.status==='open'}).length;
    var slots=mall2.slots||E.slots;
    var want=Math.min(16,Math.max(3,2+openCount*2+(openCount>=slots?4:0)));
    E.pop=Math.max(5,Math.min(100,Math.round(18+openCount/(slots||1)*66+6*Math.sin(Date.now()/2800))));
    while(E.people.length>want){
      var rm=E.people.pop();
      if(rm&&rm.group){scene.remove(rm.group);rm.group.traverse(function(o){if(o.geometry)o.geometry.dispose()})}
    }
    var bodyCols=[0xE57373,0x5B8DEF,0x7BC67E,0xFFB300,0x9C6BFF,0x2EC4B6,0xFF8C42,0xF06292];
    while(E.people.length<want){
      var idx=E.people.length;
      var p=ART3D.person(cache,{body:bodyCols[idx%bodyCols.length],pants:idx%2?0x3D4A5C:0x4A3F35,scale:.92+Math.random()*.08});
      var dir=Math.random()<.5?1:-1;
      var x=(Math.random()-.5)*E.totalW*.8;
      var z=corrZ0+0.25+Math.random()*(corrDepth-0.45);
      p.position.set(x,floorY,z);
      scene.add(p);
      E.people.push({group:p,dir:dir,speed:.5+Math.random()*.55,phase:Math.random()*7,stopT:0,targetX:null});
    }
  };
  E.rebuild(mall);
  /* 相机 + 点选 */
  var el=renderer.domElement,ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
  var downPos=null,moved=false;
  el.addEventListener('pointerdown',function(e){
    downPos={x:e.clientX,y:e.clientY};moved=false;
    E.drag={x:e.clientX,y:e.clientY};
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    el.style.cursor='grabbing';
  });
  el.addEventListener('pointermove',function(e){
    if(!E.drag||!downPos)return;
    if(Math.abs(e.clientX-downPos.x)+Math.abs(e.clientY-downPos.y)>6)moved=true;
    orbit.theta-=(e.clientX-E.drag.x)*.007;
    orbit.phi-=(e.clientY-E.drag.y)*.005;
    E.drag={x:e.clientX,y:e.clientY};applyCam();
  });
  function endDrag(e){
    if(!moved&&downPos&&e){
      var rect=el.getBoundingClientRect();
      mouse.x=((e.clientX-rect.left)/rect.width)*2-1;
      mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;
      ray.setFromCamera(mouse,cam);
      var hits=ray.intersectObjects(E.picks,false);
      var slot=hits.length?hits[0].object.userData.slot:null;
      if(slot!=null){
        G._mallPlanSel=slot;
        G.mallPlanDetail(slot);
        G.mall3dHighlight(slot);
      }
    }
    E.drag=null;downPos=null;el.style.cursor='grab';
  }
  el.addEventListener('pointerup',endDrag);
  el.addEventListener('pointercancel',function(){E.drag=null;downPos=null;el.style.cursor='grab'});
  el.addEventListener('wheel',function(e){e.preventDefault();orbit.r*=1+e.deltaY*.0012;applyCam()},{passive:false});
  window.addEventListener('resize',G.mall3dResize);
  var clock=new THREE.Clock();
  function tick(){
    if(G.mall3d)G.mall3d.raf=requestAnimationFrame(tick);
    if(!G.mall3d||G.mall3d.engine!==E)return;
    var dt=Math.min(clock.getDelta(),.1),t=clock.elapsedTime+E.t0;
    if(G.mall3d.auto&&!E.drag){orbit.theta=Math.sin(t*.28)*.68;applyCam()}
    if(E.ring){
      var sel=G._mallPlanSel;
      if(sel!=null&&E.stores[sel]){
        var sp=E.stores[sel].pos;
        E.ring.position.set(sp.x,floorY+0.04,sp.z+0.35);
        E.ring.visible=true;
        E.ring.scale.setScalar(1+Math.sin(t*3)*.05);
        E.ring.material.opacity=.5+Math.sin(t*3)*.28;
      }else E.ring.visible=false;
    }
    var openN=0;
    E.stores.forEach(function(st){if(st.status==='open')openN++});
    E.people.forEach(function(p,i){
      var u=p.group.userData;
      if(p.stopT>0){
        p.stopT-=dt;
        u.hipL.rotation.x=u.hipR.rotation.x=0;
        u.armL.rotation.x=u.armR.rotation.x=Math.sin(t*1.3+p.phase)*.06;
      }else{
        if(p.targetX==null)p.targetX=p.dir*(E.totalW*.4+Math.random()*E.totalW*.12);
        p.group.position.x+=p.dir*p.speed*dt;
        p.group.rotation.y=p.dir>0?Math.PI/2:-Math.PI/2;
        var swing=Math.sin(t*6*p.speed+p.phase);
        u.hipL.rotation.x=swing*.55;u.hipR.rotation.x=-swing*.55;
        u.kneeL.rotation.x=Math.max(0,-swing)*.4;u.kneeR.rotation.x=Math.max(0,swing)*.4;
        u.armL.rotation.x=-swing*.38;u.armR.rotation.x=swing*.38;
        u.head.rotation.y=Math.sin(t*1.4+p.phase)*.08;
        p.group.position.y=floorY+Math.abs(Math.sin(t*6*p.speed+p.phase))*.02;
        if(p.dir>0&&p.group.position.x>p.targetX){p.dir=-1;p.targetX=null;p.stopT=Math.random()*.5}
        if(p.dir<0&&p.group.position.x<p.targetX){p.dir=1;p.targetX=null;p.stopT=Math.random()*.5}
        if(openN>0&&Math.random()<dt*.22){
          var openStores=E.stores.filter(function(s){return s.status==='open'});
          var pickS=openStores[i%openStores.length];
          if(pickS&&Math.abs(p.group.position.x-pickS.pos.x)<1.3){
            p.stopT=.7+Math.random()*1.1;
            p.group.rotation.y=Math.PI;
          }
        }
      }
    });
    for(var si=0;si<E.escSteps.length;si++){
      var stp=E.escSteps[si],u=stp.userData.esc;
      var ph=(u.idx/7+t*.1)%1;
      if(!u.up)ph=1-ph;
      stp.position.z=u.span/2-ph*u.span;
      stp.position.y=.12+ph*.42;
    }
    renderer.render(scene,cam);
  }
  tick();
  G.mall3dHighlight(G._mallPlanSel);
},
