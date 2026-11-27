/* ---------- reseñas reales (Google Maps, perfil del Dr. Josué Cauich Segovia) ---------- */
const RATING={score:"5.0",count:458,url:"https://www.google.com/maps/place/Dr+Josu%C3%A9+Cauich+Segovia+Cardi%C3%B3logo+Pediatra/@21.0160689,-89.5849652,17z/data=!4m8!3m7!1s0x8f5677212c8c126d:0xbca4947630c16ba3!8m2!3d21.0160689!4d-89.5849652!9m1!1b1!16s%2Fg%2F1pty506rj"};
const REVIEWS=[
  ["Heydi Patricia Cimé Madera","Excelente doctor, profesional, empático. Lo recomiendo 100%. Te da una confianza y tranquilidad"],
  ["Diego Resendi Guzmán","Este doctor tiene la mejor actitud que jamás he visto, nos atendió de manera increíble. Mi hijo estuvo super tranquilo durante su cita. Mas doctores asi"],
  ["Glendy Ojeda","1000% recomendable, su trato hacia los padres la empatía y la confianza que nos brinda, explica de manera que no nos quede ni una duda muy humano el doctor y súper paciente con los niños para ganarse su confianza y pueda realizar los estudios."],
  ["Marisol Quijano","Excelente doctor, explica con detalle, si tiene dudas vuelve a explicar, muy buena atención. Muy recomendable, te da la seguridad y confianza."],
  ["Anni Novelo","Excelente Dr siempre atento y con toda la confianza del mundo. Ya nos dio de alta y estamos muy satisfechos con el trato desde el día 1 que llegamos con él. Super recomendado"]
];
const STAR='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z"/></svg>';
const stars=(n=5)=>`<span class="stars" role="img" aria-label="${n} de 5 estrellas">${STAR.repeat(n)}</span>`;
const initials=n=>n.split(" ").slice(0,2).map(w=>w[0]).join("");
const plus='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const bi=(ic=plus)=>`<span class="bi">${ic}</span>`;
const im=(key,alt="",extra="")=>IMG[key]?`<img src="${IMG[key]}" alt="${alt}" decoding="async" ${extra}>`:"";
const nn=i=>String(i+1).padStart(2,"0");
const two=(t)=>{const k=t.indexOf(":");return k>0?`${t.slice(0,k)}: <span class="gr">${t.slice(k+1).trim()}</span>`:t};
const ORDER=["diagnostico-avanzado","colocacion-de-stents","disautonomia","cateterismo","dolor-toracico","cardiopatias-congenitas","diagnostico-de-arritmias","soplos","cierre-de-defectos"];
const SVC=ORDER.map(k=>bySlug[k]);

/* trazo de ECG de ancho completo */
function ecgWide(beats=[.37,.82],w=1400,h=110){
  let d=`M0 70`;
  for(const b of beats){const x=b*w;d+=`H${x-40}l10-8 10 8h8l6 5 10-58 12 74 8-21h${0}l14-10 14 10`}
  return `<svg class="ecg draw" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="${d}H${w}"/></svg>`;
}
/* tira de ritmo: latidos reales para 6 segundos a la frecuencia media del rango */
let SW=0;
const RMQ=matchMedia("(prefers-reduced-motion: reduce)").matches;
function sweep(W,H,d,dur,cls="",gap=34){
  const id="sw"+(++SW);
  const anim=RMQ?"":`<animate attributeName="x" from="${-gap}" to="${W}" dur="${dur}s" repeatCount="indefinite"/>`;
  return `<svg ${cls?`class="${cls}"`:""} viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}g"><stop offset="0" stop-color="#000"/><stop offset=".7" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="-20" width="${W}" height="${H+40}"><rect x="0" y="-20" width="${W}" height="${H+40}" fill="#fff"/>${RMQ?"":`<rect x="${-gap}" y="-20" width="${gap}" height="${H+40}" fill="url(#${id}g)">${anim}</rect>`}</mask></defs><path vector-effect="non-scaling-stroke" mask="url(#${id})" d="${d}"/></svg>`;
}
/* tira de ritmo: 6 segundos a la frecuencia media del rango, barrido como en un monitor */
function strip(rate,color){
  const W=620,per=W/(rate/10);
  const beat="l4-4 4 4h4l4 3 6-26 7 34 4-11";let d="M0 34";
  for(let x=per*.35;x+33<W;x+=per){d+=`H${x.toFixed(1)}${beat}`}
  d+=`H${W}`;
  return sweep(W,50,d,6).replace("<path ",`<path stroke="${color}" `);
}
function ecgLoop(w=1400,h=110){
  let d="M0 70";
  for(const b of [.2,.64]){const x=b*w;d+=`H${x-40}l10-8 10 8h8l6 5 10-58 12 74 8-21l14-10 14 10`}
  return sweep(w,h,d+`H${w}`,7,"ecg loop",70);
}

/* horario con hora de Mérida */
function nowMerida(){
  try{const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Merida",weekday:"short",hour:"numeric",hour12:false}).formatToParts(new Date());
    const wd=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.find(x=>x.type==="weekday").value);
    return {d:wd,h:+p.find(x=>x.type==="hour").value%24};}catch(e){const n=new Date();return {d:n.getDay(),h:n.getHours()}}
}
function liveHTML(){
  const {d,h}=nowMerida();const r=HOURS.find(x=>x[2].includes(d));
  if(r&&r[3]!=null&&h>=r[3]&&h<r[4])return `<span class="live open"><i></i>Abierto ahora · hasta las ${r[4]}:00</span>`;
  return `<span class="live closed"><i></i>Cerrado ahora · agenda por teléfono</span>`;
}
const hoursHTML=()=>{const {d}=nowMerida();return HOURS.map(x=>`<div class="h ${x[2].includes(d)?"today":""}"><span>${x[0]}</span><span>${x[1]}</span></div>`).join("")};

/* ---------- bloques compartidos ---------- */
const carousel=(list,id,bigFirst=true)=>`
<div class="car" id="${id}" tabindex="0" aria-label="Servicios">
  ${list.map((s,i)=>{const k=(i===0&&bigFirst&&IMG[s.img[2]+"-54"])?s.img[2]+"-54":s.img[2];return `<a class="sc ${i===0&&bigFirst?"big":""}" href="#servicio-${s.slug}">${im(k,s.img[1],'loading="lazy"')}<span class="n">${nn(S.indexOf(s))} / ${String(S.length).padStart(2,"0")}</span><span class="tx"><span><h3>${s.name}</h3><p>${s.short}</p></span><span class="ar">${I.arrow}</span></span></a>`}).join("")}
</div>`;
const arrows=id=>`<div class="arrows"><button class="prev" data-car="${id}" data-dir="-1" aria-label="Anterior">${I.arrow}</button><button class="next" data-car="${id}" data-dir="1" aria-label="Siguiente">${I.arrow}</button></div>`;

const contactBlock=(t1="Estamos en",t2="Altabrisa, Mérida")=>`
<section class="cta" id="ubicacion" aria-labelledby="ct-h">
  <div class="l">
    <div>
      <span class="lbl">Contacto</span>
      <h2 class="h2" id="ct-h"><span class="gr">${t1}</span> ${t2}</h2>
      ${liveHTML()}
      <div class="rows">
        <div>Teléfonos<div class="ph">${PHONES.map(([t,n])=>`<a href="tel:${n}">${t}</a><button class="copy" data-copy="${t}">Copiar</button>`).join("")}</div></div>
        <div>Dirección<span class="ad">${ADDRESS}</span></div>
        <div><a class="fb" href="https://www.facebook.com/" target="_blank" rel="noopener">Escríbenos en Facebook</a></div>
      </div>
    </div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center"><a class="btn w" href="tel:${PHONES[0][1]}">Agenda tu cita ${bi(I.phone)}</a><a class="link" style="color:#C3CBE3" href="${MAPS}" target="_blank" rel="noopener">Cómo llegar ${I.arrow.replace('<svg','<svg width="15" height="15"')}</a></div>
  </div>
  <div class="map">
    <iframe src="${MAP_EMBED}" title="Mapa: Hospital Star Médica Mérida" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    <div class="card"><div><b>Hospital Star Médica Mérida</b>Consultorio 916, Col. Altabrisa</div><div>${hoursHTML()}</div></div>
  </div>
</section>`;

const ALMA="https://www.almabruta.studio";
const footer=()=>`
<footer class="foot">
  <div class="ftop">
    <div class="fbrand"><a class="logo" href="#inicio">${LOGO}<span>Cardio Care</span></a><p>Dr. Josué Cauich Segovia<br>Cardiólogo Pediatra Intervencionista<br>Mérida, Yucatán</p></div>
    <nav aria-label="Pie de página"><h2 class="fh">Sitio</h2><a href="#inicio">Inicio</a><a href="#acerca-de">Acerca de</a><a href="#servicios">Servicios</a><a href="#contacto">Contacto</a></nav>
    <div><h2 class="fh">Contacto</h2>${PHONES.map(([t,n])=>`<a class="mono" href="tel:${n}">${t}</a>`).join("")}<a href="${MAPS}" target="_blank" rel="noopener">Hospital Star Médica, Altabrisa</a></div>
    <div><h2 class="fh">Horario</h2>${HOURS.map(x=>`<span class="hr"><span>${x[0]}</span><span class="mono">${x[1]}</span></span>`).join("")}</div>
  </div>
  <div class="fwm" aria-hidden="true">${ecgWide([.2,.64]).replace('class="ecg draw"','class="ecg"')}<span class="wm">Cardio Care</span></div>
  <div class="fbot"><span>© 2026 Cardio Care · Dr. Josué Cauich Segovia</span><span class="r"><a class="ab" href="${ALMA}" target="_blank" rel="noopener">Diseñado por <b>Alma Bruta</b></a><a href="#inicio" onclick="scrollTo({top:0,behavior:'smooth'});return false">Volver arriba ↑</a></span></div>
</footer>`;

const steps=()=>`<ol class="steps">
  <li><span class="k">01</span><small>Licenciatura</small><h3>Médico Cirujano</h3><p>Orgullosamente egresado como Médico Cirujano de la UADY.</p></li>
  <li><span class="k">02</span><small>Especialidad</small><h3>Pediatría</h3><p>Realizada en el Instituto Nacional de Pediatría (UNAM), donde aprendió el cuidado integral de los niños.</p></li>
  <li><span class="k">03</span><small>Subespecialidad</small><h3>Cardiología Pediátrica</h3><p>Especialización en el Instituto Nacional de Cardiología “Ignacio Chávez”, el centro de referencia más importante del país.</p></li>
  <li><span class="k">04</span><small>Alta especialidad</small><h3>Cardiología Intervencionista</h3><p>También en el Instituto Nacional de Cardiología, enfocándose en corregir cardiopatías congénitas mediante cateterismo (mínima invasión).</p></li>
</ol>`;
const QUOTE="“Como padre y médico, entiendo que no hay nada más importante que la tranquilidad de saber que el corazón de tu hijo está en las mejores manos. Mi formación se ha centrado en traer a Mérida las técnicas más avanzadas y menos invasivas para tratar el corazón de los niños, permitiéndoles crecer sanos y sin límites.”";
const pillars=()=>`<div class="pillars">
  <div><span class="ic">${I.cath}</span><h3>Tecnología humana</h3><p>Usamos cateterismos para evitar cirugías de pecho abierto siempre que es posible.</p></div>
  <div><span class="ic">${I.talk}</span><h3>Explicaciones claras</h3><p>Nada de términos médicos confusos; aquí hablamos de familia a familia.</p></div>
  <div><span class="ic">${I.home}</span><h3>Compromiso local</h3><p>Atención de alta especialidad sin que tengas que salir de Yucatán.</p></div>
</div>`;

/* ---------- vistas ---------- */
function home(){
  const RATES=[["1 semana",90,160,"var(--r)"],["1–2 meses",120,180,"var(--r)"],["6–11 meses",110,170,"var(--r)"],["3–4 años",70,140,"var(--primary)"],["8–11 años",60,130,"var(--primary)"],["16+ años",50,120,"var(--ink)"]];
  const co=(slug,cls,tag,pos)=>{const s=bySlug[slug];return `<a class="co ${cls}" href="#servicio-${s.slug}"><span class="tg">${tag}</span><b>${s.name}</b><p>${s.short}.</p><span class="link">Leer más +</span></a>`};
  return `
<section class="panel hero" aria-labelledby="h1">
  <div class="t">
    <span class="lbl rise">Cardiólogo Pediatra Intervencionista · Mérida</span>
    <h1 id="h1" class="rise d1"><span class="gr">Tu aliado en la salud</span> del corazón de tus hijos.</h1>
    <p class="lead rise d2">Técnicas avanzadas y de mínima invasión para que tu hijo crezca sano y sin límites, sin salir de Yucatán.</p>
    <div class="ct rise d3"><a class="btn" href="#contacto">Agenda tu cita ${bi()}</a><span class="alt">o llama al <a href="tel:${PHONES[0][1]}">${PHONES[0][0]}</a></span></div>
    <div class="nums rise d4">
      <div><b>250<sup>+</sup></b><span>Pacientes atendidos</span></div>
      <div><b>315<sup>+</sup></b><span>Sesiones médicas</span></div>
      <a href="${RATING.url}" target="_blank" rel="noopener" style="text-decoration:none"><b>${RATING.score}<sup>★</sup></b><span>${RATING.count} reseñas en Google</span></a>
    </div>
  </div>
  <div class="v">
    <div class="rings" aria-hidden="true"></div>
    ${im("dr-cut","El Dr. Josué Cauich Segovia, cardiólogo pediatra, con bata blanca",'class="doc" fetchpriority="high"')}
    <div class="float f1"><span class="ic">${I.seal}</span><span><b>Certificado</b>Consejo Mexicano de Cardiología</span></div>
    <div class="float f2"><span class="ic">${I.cath}</span><span><b>Mínima invasión</b>Cateterismo sin abrir el pecho</span></div>
    <div class="float f3"><span class="ic">${I.people}</span><span><b>Instituto Nacional</b>de Cardiología “Ignacio Chávez”</span></div>
  </div>
</section>

<section class="band bleed" aria-label="Atendemos"><small>Atendemos</small><ul><li>Soplos cardiacos</li><li>Dolores de pecho</li><li>Arritmias</li><li>Desmayos y desvanecimientos</li></ul></section>

<section class="svc" id="servicios" aria-labelledby="svc-h">
  <div class="center in"><span class="lbl">Nuestros servicios</span><h2 class="h2" id="svc-h"><span class="gr">¿Con qué nos consultan</span> las familias?</h2>${arrows("car-home")}</div>
  ${carousel(SVC,"car-home",false)}
</section>

<section class="panel tech" id="tecnologia" aria-labelledby="tech-h">
  <div class="hd"><div><span class="lbl">Por qué elegirnos</span><h2 class="h2" id="tech-h"><span class="gr">Tecnología humana</span><br>para cada corazón</h2></div><p class="sub">Usamos cateterismos para evitar cirugías de pecho abierto siempre que es posible.</p></div>
  <div class="stage">
    <span class="sonar" style="--i:0" aria-hidden="true"></span><span class="sonar" style="--i:1" aria-hidden="true"></span><span class="sonar" style="--i:2" aria-hidden="true"></span>
    ${im("il-diagnostico-54","Ilustración de un corazón infantil con un catéter trazando su recorrido",'loading="lazy"')}
    ${co("cateterismo","c1","Diagnóstico y tratamiento")}
    ${co("colocacion-de-stents","red c2","Mínima invasión")}
    ${co("cardiopatias-congenitas","c3","1 de cada 100 recién nacidos")}
    ${co("cierre-de-defectos","c4","Valvuloplastia")}
  </div>
</section>

<section class="about" id="por-que" aria-labelledby="ab-h">
  <div class="t">
    <span class="lbl">Dr. Josué Cauich Segovia</span>
    <h2 class="h2" id="ab-h"><span class="gr">Un camino de excelencia</span> para cuidar a los más pequeños</h2>
    <blockquote>${QUOTE}</blockquote>
    <p class="who"><b>Dr. Josué Cauich</b> · Cardiólogo Pediatra Intervencionista</p>
    ${steps()}
    <a class="btn" href="#acerca-de" style="margin-top:44px">Conoce al doctor ${bi()}</a>
  </div>
  <div class="ph">${im("dr2","El Dr. Josué Cauich Segovia con bata blanca y los brazos cruzados",'loading="lazy"')}<div class="float"><span class="ic">${I.people}</span><span><b>Miembro activo</b>AMECC</span></div></div>
</section>

<section class="papas bleed" aria-labelledby="pp-h">
  <div><span class="lbl">Para papás</span><h2 class="h2" id="pp-h"><span class="gr">El corazón de un niño</span> late más rápido que el tuyo</h2><p class="sub">Y es normal. Estos son los rangos de frecuencia cardiaca en reposo por edad. Si algo no te cuadra, lo revisamos juntos en consulta.</p></div>
  <div class="strips" role="list" aria-label="Frecuencia cardiaca en reposo por edad">
    ${RATES.map(([a,lo,hi,c])=>`<div class="lane" role="listitem"><span>${a}</span>${strip((lo+hi)/2,c)}<b>${lo}–${hi}<i>lpm</i></b></div>`).join("")}
    <div class="note"><span></span><span>6 segundos de ritmo, en reposo</span></div>
  </div>
</section>

<section class="rev" id="resenas" aria-labelledby="rev-h">
  <div class="center in"><span class="lbl">Reseñas en Google</span><h2 class="h2" id="rev-h"><span class="gr">Lo que dicen</span> las familias</h2>
  <a class="score" href="${RATING.url}" target="_blank" rel="noopener"><b>${RATING.score}</b>${stars()}<span>${RATING.count} reseñas · Ver en Google</span></a></div>
  ${arrows("rc")}
  <div class="rc" id="rc">${REVIEWS.map(([n,t],i)=>`<figure class="rv ${i===2?"on":""}"><blockquote>“${t}”</blockquote><figcaption><span class="av" aria-hidden="true">${initials(n)}</span><span><b>${n}</b><span>Google · ★★★★★</span></span></figcaption></figure>`).join("")}</div>
</section>

${contactBlock()}
${footer()}`;
}

function about(){
  return `
<header class="phead">
  <div>
    <nav class="crumb rise" aria-label="Ruta"><a href="#inicio">Inicio</a><span>/</span><span>Acerca de</span></nav>
    <h1 class="rise d1"><span class="gr">Tu aliado en la salud</span> del corazón de tus hijos.</h1>
    <p class="q rise d2">${QUOTE}</p>
    <div class="ct rise d3"><a class="btn" href="tel:${PHONES[0][1]}">Agenda tu cita ${bi(I.phone)}</a></div>
    <div class="nums rise d4" style="padding-top:44px"><div><b>250<sup>+</sup></b><span>Pacientes satisfechos</span></div><div><b>315<sup>+</sup></b><span>Intervenciones</span></div></div>
  </div>
  <div class="media tall rise d2">${im("dr-portrait","El Dr. Josué Cauich Segovia con bata blanca",'fetchpriority="high"')}</div>
</header>

<section class="about" aria-labelledby="tl-h">
  <div class="t" style="grid-column:1/-1">
    <span class="lbl">Formación</span>
    <h2 class="h2" id="tl-h"><span class="gr">Un camino de excelencia</span> para cuidar a los más pequeños</h2>
    <p class="who" style="font-size:18px;max-width:52ch">El Dr. Josué Cauich cuenta con una sólida preparación en las instituciones líderes de cardiología en México:</p>
    ${steps()}
  </div>
</section>

<section class="certs bleed" aria-labelledby="cert-h">
  <div><span class="lbl">Certificaciones</span><h2 class="h2" id="cert-h"><span class="gr">Confianza</span> y certificación</h2><p class="sub">Para tu seguridad, el Dr. Cauich mantiene sus credenciales vigentes ante los organismos reguladores más exigentes:</p></div>
  <ul>
    <li><span class="ic">${I.seal}</span><div><b>Certificado</b><span>por el Consejo Mexicano de Pediatría.</span></div></li>
    <li><span class="ic">${I.seal}</span><div><b>Certificado</b><span>por el Consejo Mexicano de Cardiología (tanto en Cardiología Pediátrica como Intervencionista).</span></div></li>
    <li><span class="ic">${I.people}</span><div><b>Miembro activo</b><span>de la Asociación Mexicana de Especialistas en Cardiopatías Congénitas (AMECC).</span></div></li>
  </ul>
</section>

<section class="certs" style="display:block" aria-labelledby="pil-h">
  <span class="lbl">Su práctica</span><h2 class="h2" id="pil-h"><span class="gr">¿Por qué elegir</span> al Dr. Josué Cauich?</h2><p class="sub">Más allá de los títulos, su práctica se define por tres pilares:</p>
  ${pillars()}
</section>

<section class="help bleed" aria-label="Consulta">
  <div class="im">${im("dr2","El Dr. Josué Cauich Segovia con los brazos cruzados",'loading="lazy" style="object-position:50% 15%"')}</div>
  <div class="t"><div><span class="lbl">Consulta</span><h2 class="h2"><span class="gr">Agenda una consulta</span> para tu hijo</h2><p>Estamos en el Hospital Star Médica Mérida, en Altabrisa.</p></div><a class="btn red" href="tel:${PHONES[0][1]}">${PHONES[0][0]} ${bi(I.phone)}</a></div>
</section>
${contactBlock()}
${footer()}`;
}

function contact(){
  return `
<section class="cpage" aria-labelledby="ct1">
  <div>
    <nav class="crumb rise" aria-label="Ruta"><a href="#inicio">Inicio</a><span>/</span><span>Contacto</span></nav>
    <h1 id="ct1" class="rise d1"><span class="gr">Contáctanos.</span> Agenda una consulta para tu hijo.</h1>
    <p class="q rise d2">Agenda una consulta por teléfono. Estamos en Altabrisa, Mérida.</p>
    <div class="rise d2" style="margin-top:22px">${liveHTML()}</div>
    <div class="calls rise d3">${PHONES.map(([t,n],i)=>`<a class="call" href="tel:${n}"><span><small>${i?"Teléfono alterno":"Teléfono principal"}</small><b>${t}</b></span><span class="ar">${I.phone}</span></a>`).join("")}</div>
    <div class="cinfo rise d4">
      <div><h2 class="fh">Dirección</h2><p>${ADDRESS}</p><a class="link" href="${MAPS}" target="_blank" rel="noopener">Cómo llegar ${I.arrow.replace('<svg','<svg width="15" height="15"')}</a></div>
      <div><h2 class="fh">Horario</h2>${hoursHTML()}</div>
    </div>
  </div>
  <div class="map cmap rise d2"><iframe src="${MAP_EMBED}" title="Mapa: Hospital Star Médica Mérida" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="card"><div><b>Hospital Star Médica Mérida</b>Consultorio 916, Col. Altabrisa</div><div><a class="btn" href="${MAPS}" target="_blank" rel="noopener" style="padding:5px 5px 5px 18px;font-size:14px">Abrir en Maps <span class="bi" style="width:34px;height:34px">${I.arrow}</span></a></div></div></div>
</section>
${footer()}`;
}

function service(s){
  const i=S.indexOf(s);
  const others=SVC.filter(x=>x!==s);
  return `
<header class="phead">
  <div>
    <nav class="crumb rise" aria-label="Ruta"><a href="#servicios">Servicios</a><span>/</span><span>${nn(i)} de ${String(S.length).padStart(2,"0")}</span></nav>
    <h1 class="rise d1">${two(s.title)}</h1>
    <p class="q rise d2">${s.q||s.short}</p>
    <div class="ct rise d3"><a class="btn" href="tel:${PHONES[0][1]}">Agenda tu cita ${bi(I.phone)}</a></div>
  </div>
  <div class="media rise d2">${im(s.img[2],s.img[1],'fetchpriority="high"')}</div>
</header>
<article class="article"><div class="prose">${s.body}</div></article>
<section class="help bleed" aria-labelledby="help-h">
  <div class="im">${im("ph-recepcion","Recepcionista del consultorio atendiendo una llamada",'loading="lazy"')}</div>
  <div class="t"><div><span class="lbl">Atención</span><h2 class="h2" id="help-h"><span class="gr">¿Tienes alguna</span> pregunta?</h2><p>Nuestros gestores de atención al cliente están disponibles las 24 horas, los 7 días de la semana para responder a tus preguntas.</p></div><a class="btn red" href="tel:${PHONES[0][1]}">${PHONES[0][0]} ${bi(I.phone)}</a></div>
</section>
<section class="svc" aria-labelledby="oth-h">
  <div class="center in"><span class="lbl">Servicios</span><h2 class="h2" id="oth-h"><span class="gr">Otros</span> servicios</h2>${arrows("car-oth")}</div>
  ${carousel(others,"car-oth",false)}
</section>
${contactBlock()}
${footer()}`;
}

/* ---------- router ---------- */
const main=document.getElementById("main");
const SCROLL={servicios:"servicios","por-que":"por-que",resenas:"resenas",tecnologia:"tecnologia",ubicacion:"ubicacion"};
let last="";
function route(){
  const h=(location.hash||"#inicio").slice(1);
  let view="inicio",html,target=null;
  if(h.startsWith("servicio-")&&bySlug[h.slice(9)]){view="servicios";html=service(bySlug[h.slice(9)])}
  else if(h==="acerca-de"){view="acerca-de";html=about()}
  else if(h==="contacto"){view="contacto";html=contact()}
  else {view=SCROLL[h]==="servicios"?"servicios":"inicio";html=home();target=SCROLL[h]||null}
  const key=h.startsWith("servicio-")||h==="acerca-de"||h==="contacto"?h:"inicio";
  // La portada ya viene escrita en el HTML (prerender): la primera vez no se vuelve a pintar, solo se activa.
  if(key!==last){if(main.dataset.pre===key)main.removeAttribute("data-pre");else main.innerHTML=html;last=key;bindPage()}
  document.querySelectorAll("[data-nav]").forEach(a=>a.toggleAttribute("aria-current",a.dataset.nav===view)||a.removeAttribute("aria-current"));
  document.querySelectorAll("[data-nav]").forEach(a=>{if(a.dataset.nav===view)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  closeMega();closeDrawer();
  if(target){const el=document.getElementById(target);if(el)requestAnimationFrame(()=>el.scrollIntoView({behavior:"smooth"}))}
  else window.scrollTo({top:0,behavior:"instant"});
  document.title=(view==="inicio"?"Cardiólogo Pediatra en Mérida":h.startsWith("servicio-")?bySlug[h.slice(9)].name:view==="acerca-de"?"Acerca del Dr. Josué Cauich":"Contacto")+" · Cardio Care";
  onScroll();
}
function fitWM(){document.querySelectorAll(".fwm").forEach(f=>{const w=f.querySelector(".wm");const cs=getComputedStyle(f),cw=f.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);if(!cw)return;
  const ws=getComputedStyle(w),t=w.textContent,ctx=(fitWM.c||(fitWM.c=document.createElement("canvas"))).getContext("2d");
  ctx.font=`${ws.fontWeight} 100px ${ws.fontFamily}`;const ls=-5.5;
  const all=ctx.measureText(t),a=ctx.measureText(t[0]),z=ctx.measureText(t[t.length-1]);
  const left=-a.actualBoundingBoxLeft,right=z.width-z.actualBoundingBoxRight;
  const ink=all.width+ls*(t.length-1)-left-right;const k=cw/ink;
  w.style.fontSize=(100*k)+"px";w.style.marginLeft=(-left*k)+"px"})}
addEventListener("resize",fitWM);addEventListener("load",fitWM);if(document.fonts){document.fonts.ready.then(fitWM);document.fonts.addEventListener&&document.fonts.addEventListener("loadingdone",fitWM)}setTimeout(fitWM,800);
/* slider con arrastre e inercia */
const RM=matchMedia("(prefers-reduced-motion: reduce)");
const easeOut=t=>1-Math.pow(1-t,4);
function slider(el){
  const center=el.classList.contains("rc");
  const items=()=>[...el.children];
  const pad=()=>parseFloat(getComputedStyle(el).paddingLeft)||0;
  const max=()=>el.scrollWidth-el.clientWidth;
  const targetOf=c=>{const er=el.getBoundingClientRect(),cr=c.getBoundingClientRect();
    return Math.max(0,Math.min(max(),el.scrollLeft+(center?(cr.left+cr.width/2)-(er.left+el.clientWidth/2):cr.left-er.left-pad())))};
  const nearest=x=>{let best=null,bd=1e9;for(const c of items()){const d=Math.abs(targetOf(c)-x);if(d<bd){bd=d;best=c}}return best};
  let anim=0,cur=null;
  const mark=c=>{cur=c;if(center)items().forEach(x=>x.classList.toggle("on",x===c))};
  function go(c,dur=1000){if(!c)return;mark(c);const from=el.scrollLeft,to=targetOf(c);cancelAnimationFrame(anim);
    if(!dur||RM.matches){el.scrollLeft=to;return}
    el.style.scrollSnapType="none";const t0=performance.now();
    const tick=now=>{const t=Math.min(1,(now-t0)/dur);el.scrollLeft=from+(to-from)*easeOut(t);if(t<1)anim=requestAnimationFrame(tick);else el.style.scrollSnapType=""};
    anim=requestAnimationFrame(tick)}
  el._go=go;
  el._step=d=>{const list=items();const i=list.indexOf(cur||nearest(el.scrollLeft));go(list[Math.max(0,Math.min(list.length-1,i+d))],900)};
  let down=false,sx=0,sl=0,lx=0,lt=0,v=0,moved=false;
  el.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||e.button!==0)return;down=true;moved=false;sx=lx=e.clientX;sl=el.scrollLeft;lt=performance.now();v=0;cancelAnimationFrame(anim);el.style.scrollSnapType="none"});
  addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-sx;if(!moved&&Math.abs(dx)>5){moved=true;el.classList.add("drag")}
    if(moved){el.scrollLeft=sl-dx;const now=performance.now(),dt=now-lt;if(dt>0){v=.8*((e.clientX-lx)/dt)+.2*v}lx=e.clientX;lt=now}});
  addEventListener("pointerup",()=>{if(!down)return;down=false;if(!moved){el.style.scrollSnapType="";return}
    setTimeout(()=>el.classList.remove("drag"),0);
    const proj=el.scrollLeft-v*320;const c=nearest(proj);const dist=Math.abs(targetOf(c)-el.scrollLeft);
    go(c,Math.min(1400,Math.max(650,dist*1.4)))});
  el.addEventListener("click",e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
  let st;el.addEventListener("scroll",()=>{if(down||!center)return;clearTimeout(st);st=setTimeout(()=>{const c=nearest(el.scrollLeft);if(c!==cur)mark(c)},120)},{passive:true});
  mark(center?el.querySelector(".on"):items()[0]);
}
function reveal(){
  if(RM.matches||!("IntersectionObserver" in window))return;
  document.documentElement.classList.add("js-rv");
  const SEL="section:not(.hero) > .lbl, section:not(.hero) .h2, .sub, .center .score, .arrows, .car, .rv, .stage > img, .stage .co, .about blockquote, .about .who, .about .t > .btn, .steps > *, .about .ph, .lane, .papas .note, .certs li, .pillars > *, .prose > *, .groups > *, .help .t > *, .help .im, .calls > *, .cinfo > *, .cmap, .ftop > *, .fwm, .contact .t > *, .map, .tablewrap";
  const els=[...main.querySelectorAll(SEL)].filter(e=>!e.closest(".hero,.phead,.rise")&&!e.classList.contains("rise"));
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in-v");io.unobserve(en.target)}}),{rootMargin:"0px 0px -8% 0px",threshold:.08});
  els.forEach(e=>{const sib=[...e.parentElement.children].filter(x=>els.includes(x));e.style.setProperty("--rd",Math.min(sib.indexOf(e),6));e.setAttribute("data-r","");io.observe(e)});
  main.querySelectorAll(".about .ph > img, .help .im img, .phead .media img").forEach(i=>i.setAttribute("data-px",""));
  parallax();
}
let pxq=0;
function parallax(){if(RM.matches)return;cancelAnimationFrame(pxq);pxq=requestAnimationFrame(()=>{const H=innerHeight;
  main.querySelectorAll("[data-px]").forEach(i=>{const b=i.parentElement.getBoundingClientRect();if(b.bottom<-50||b.top>H+50)return;
    const p=((b.top+b.height/2)-H/2)/(H/2+b.height/2);i.style.setProperty("--py",(p*-b.height*.06).toFixed(1)+"px")})})}
function bindPage(){fitWM();reveal();
  main.querySelectorAll(".car,.rc").forEach(slider);
  main.querySelectorAll("[data-car]").forEach(b=>b.addEventListener("click",()=>{const el=document.getElementById(b.dataset.car);el._step&&el._step(+b.dataset.dir)}));
  main.querySelectorAll(".copy").forEach(b=>b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent="Copiado"}catch(e){b.textContent=b.dataset.copy}setTimeout(()=>b.textContent="Copiar",1800)}));
  const rc=document.getElementById("rc");
  if(rc){const on=rc.querySelector(".on");requestAnimationFrame(()=>rc._go&&rc._go(on,0))}
}

/* menú de servicios */
const megaWrap=document.getElementById("mega"), megabtn=document.getElementById("megabtn");
(function(){
  const mp=document.getElementById("megapanel");
  const N=String(S.length).padStart(2,"0");
  mp.innerHTML=`<div class="mg-l"><div class="mg-h"><span class="lbl">Nuestros servicios</span><a class="link" href="#servicios">Ver todos ${I.arrow.replace('<svg','<svg width="15" height="15"')}</a></div>
  <div class="mg-list">${SVC.map((s,i)=>`<a class="mg-i" href="#servicio-${s.slug}" data-k="${s.slug}"><span class="n">${nn(S.indexOf(s))}</span><span class="t"><b>${s.name}</b><small>${s.short}</small></span><span class="go">${I.arrow}</span></a>`).join("")}</div>
  <div class="mg-f"><span>¿Tienes alguna pregunta? Llámanos y te orientamos.</span><a class="mono" href="tel:${PHONES[0][1]}">${PHONES[0][0]}</a></div></div>
  <a class="mg-feat" id="mgfeat" href="#servicio-${SVC[0].slug}"><img id="mgimg" src="${IMG[SVC[0].img[2]]}" alt="" loading="lazy" decoding="async"><span class="tx"><small id="mgn">Servicio ${nn(S.indexOf(SVC[0]))} / ${N}</small><b id="mgt">${SVC[0].name}</b><span id="mgs">${SVC[0].short}</span></span><span class="ar">${I.arrow}</span></a>`;
  const show=s=>{document.getElementById("mgfeat").href="#servicio-"+s.slug;document.getElementById("mgimg").src=IMG[s.img[2]];document.getElementById("mgn").textContent=`Servicio ${nn(S.indexOf(s))} / ${N}`;document.getElementById("mgt").textContent=s.name;document.getElementById("mgs").textContent=s.short;mp.querySelectorAll(".mg-i").forEach(x=>x.classList.toggle("on",x.dataset.k===s.slug))};
  mp.querySelectorAll(".mg-i").forEach(a=>{a.addEventListener("mouseenter",()=>show(bySlug[a.dataset.k]));a.addEventListener("focus",()=>show(bySlug[a.dataset.k]))});
  show(SVC[0]);
})();
document.getElementById("drawersvc").innerHTML=SVC.map(s=>`<a href="#servicio-${s.slug}">${s.name}</a>`).join("");
function closeMega(){megaWrap.classList.remove("open");megabtn.setAttribute("aria-expanded","false")}
megabtn.addEventListener("click",e=>{e.stopPropagation();const o=!megaWrap.classList.contains("open");megaWrap.classList.toggle("open",o);megabtn.setAttribute("aria-expanded",String(o))});
document.addEventListener("click",e=>{if(!megaWrap.contains(e.target))closeMega()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeMega();closeDrawer()}});
const drawer=document.getElementById("drawer"), menubtn=document.getElementById("menubtn");
function closeDrawer(){drawer.hidden=true;menubtn.setAttribute("aria-expanded","false");document.body.style.overflow=""}
menubtn.addEventListener("click",()=>{drawer.hidden=false;menubtn.setAttribute("aria-expanded","true");document.body.style.overflow="hidden";document.getElementById("closebtn").focus()});
document.getElementById("closebtn").addEventListener("click",closeDrawer);
drawer.addEventListener("click",e=>{if(e.target.closest("a"))closeDrawer()});
/* el logo es el inicio: si ya estás en la portada, sube arriba */
document.querySelectorAll("a.logo").forEach(a=>a.addEventListener("click",()=>{if((location.hash||"#inicio")==="#inicio")window.scrollTo({top:0,behavior:"smooth"})}));

/* barra flotante y navegación al hacer scroll */
const top_=document.getElementById("top");
function onScroll(){top_.classList.toggle("scrolled",scrollY>40);parallax()}
addEventListener("scroll",onScroll,{passive:true});
addEventListener("hashchange",route);
route();
