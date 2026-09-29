/* ZIR product gallery: zoom lightbox with swipe */
(function(){
  var main=document.getElementById('mainImg'); if(!main) return;
  var box=main.parentNode;
  var btns=[].slice.call(document.querySelectorAll('#thumbs button'));
  var srcs=btns.map(function(b){return b.getAttribute('data-src');});
  var idx=0, scale=1, tx=0, ty=0, lb, im, counter, hint;

  box.style.cursor='zoom-in';
  hint=document.createElement('span'); hint.className='zhint'; hint.textContent='🔍 اضغطي للتكبير';
  box.appendChild(hint);

  function build(){
    lb=document.createElement('div'); lb.className='zlb';
    lb.innerHTML='<button class="zx" aria-label="إغلاق">✕</button><button class="za zprev" aria-label="السابق">‹</button><button class="za znext" aria-label="التالي">›</button><div class="zstage"><img alt=""></div><div class="zcount"></div><div class="ztip">اضغطي على الصورة للتكبير · اسحبي يمين أو يسار للتنقل</div>';
    document.body.appendChild(lb);
    im=lb.querySelector('img'); counter=lb.querySelector('.zcount');
    lb.querySelector('.zx').onclick=close;
    lb.querySelector('.zprev').onclick=function(e){e.stopPropagation();go(-1);};
    lb.querySelector('.znext').onclick=function(e){e.stopPropagation();go(1);};
    var st=lb.querySelector('.zstage'), sx=0, sy=0, ox=0, oy=0, down=false, moved=0;
    st.addEventListener('pointerdown',function(e){down=true;moved=0;sx=e.clientX;sy=e.clientY;ox=tx;oy=ty;try{st.setPointerCapture(e.pointerId);}catch(_){}});
    st.addEventListener('pointermove',function(e){
      if(!down) return;
      var dx=e.clientX-sx, dy=e.clientY-sy; moved=Math.max(moved,Math.abs(dx),Math.abs(dy));
      if(scale>1){ tx=ox+dx; ty=oy+dy; clamp(); apply(); }
    });
    st.addEventListener('pointerup',function(e){
      if(!down) return; down=false;
      var dx=e.clientX-sx;
      if(scale===1 && Math.abs(dx)>50 && Math.abs(dx)>Math.abs(e.clientY-sy)){ go(dx<0?1:-1); return; }
      if(moved<6){ toggleZoom(e); }
    });
    st.addEventListener('wheel',function(e){ e.preventDefault(); zoomAt(e, e.deltaY<0?1.25:0.8); },{passive:false});
    document.addEventListener('keydown',key);
  }
  function key(e){
    if(!lb||!lb.classList.contains('on')) return;
    if(e.key==='Escape') close();
    else if(e.key==='ArrowLeft') go(-1);
    else if(e.key==='ArrowRight') go(1);
  }
  function apply(){ im.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')'; im.style.cursor=scale>1?'grab':'zoom-in'; }
  function clamp(){
    var r=im.getBoundingClientRect(), w=im.offsetWidth*scale, h=im.offsetHeight*scale;
    var vw=window.innerWidth, vh=window.innerHeight;
    var mx=Math.max(0,(w-vw)/2+40), my=Math.max(0,(h-vh)/2+40);
    tx=Math.max(-mx,Math.min(mx,tx)); ty=Math.max(-my,Math.min(my,ty));
  }
  function zoomAt(e,k){
    var s2=Math.max(1,Math.min(4,scale*k)); if(s2===scale) return;
    var cx=window.innerWidth/2, cy=window.innerHeight/2, px=e.clientX-cx, py=e.clientY-cy, r=s2/scale;
    tx=px-(px-tx)*r; ty=py-(py-ty)*r; scale=s2;
    if(scale===1){tx=0;ty=0;} clamp(); apply();
  }
  function toggleZoom(e){ if(scale>1){scale=1;tx=0;ty=0;apply();} else { zoomAt(e,2.6); } }
  function show(i){
    idx=(i+srcs.length)%srcs.length; scale=1; tx=0; ty=0;
    im.src=srcs[idx]; apply(); counter.textContent=(idx+1)+' / '+srcs.length;
  }
  function go(d){ show(idx+d); }
  function open(){
    if(!lb) build();
    var cur=main.getAttribute('src'); idx=Math.max(0,srcs.indexOf(cur));
    lb.classList.add('on'); document.body.style.overflow='hidden'; show(idx);
    lb.querySelector('.zprev').style.display=lb.querySelector('.znext').style.display=srcs.length>1?'':'none';
  }
  function close(){
    lb.classList.remove('on'); document.body.style.overflow='';
    main.src=srcs[idx];
    btns.forEach(function(b,i){ b.classList.toggle('on',i===idx); });
  }
  box.addEventListener('click',function(e){ if(e.target.closest('.pill')&&false) return; open(); });
})();
