/* ====== CONFIGURACIÓN (EDITA AQUÍ) ====== */
const WHATSAPP_NUMBER = "573000000000"; // EDITABLE: país + número, sin + ni espacios
const INSTAGRAM_USER  = "tu_usuario";   // EDITABLE: usuario de Instagram sin @

/* ====== PRECIOS DE VENTA (COP por unidad, según tamaño) ======
   Un solo lugar para cambiarlos. Sugeridos: ~1,8x el costo por unidad en paquete de 10. */
const PRECIOS = {
  liso:        {3:22900, 4:39900, 5:57900, 6:92900, 7:135900, 8:171900, 10:309900},
  diamantado:  {3:24900, 4:42900, 5:61900, 6:98900, 7:139900, 8:179900, 10:329900}
};

/* ====== PRODUCTOS (para agregar uno nuevo, copia un bloque) ====== */
const PRODUCTOS = [
  {id:"liso-amarillo", nombre:"Balín Liso Oro Amarillo", acabado:"Lisos", color:"Oro amarillo", precios:PRECIOS.liso,
   imagen:"images/productos/balines-lisos-oro-amarillo.jpg", alt:"Balines lisos en oro amarillo 18k",
   desc:"Oro 18k ley 750, pieza hueca de acabado liso y brillante."},
  {id:"diam-amarillo", nombre:"Balín Diamantado Oro Amarillo", acabado:"Diamantados", color:"Oro amarillo", precios:PRECIOS.diamantado,
   imagen:"images/productos/balines-diamantados-oro-amarillo.jpg", alt:"Balines diamantados en oro amarillo 18k",
   desc:"Oro 18k ley 750, pieza hueca con acabado diamantado."},
  {id:"diam-rosa", nombre:"Balín Diamantado Oro Rosa", acabado:"Diamantados", color:"Oro rosa", precios:PRECIOS.diamantado,
   imagen:"images/productos/balines-diamantados-oro-rosa.jpg", alt:"Balines diamantados en oro rosa 18k",
   desc:"Oro rosa 18k ley 750, pieza hueca con acabado diamantado."}
];
/* ====== FIN CONFIGURACIÓN ====== */

const $ = s => document.querySelector(s);
const fmt = n => "$" + n.toLocaleString("es-CO");
const wa = t => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;
let filtro = "Todos", busqueda = "", lista = [];
const sel = {}; // tamaño elegido por producto
PRODUCTOS.forEach(p => sel[p.id] = Object.keys(p.precios)[0]);

function renderFiltros(){
  const f = ["Todos", ...new Set(PRODUCTOS.flatMap(p => [p.acabado, p.color]))];
  $("#filtros").innerHTML = f.map(x => `<button class="${x===filtro?"on":""}" data-f="${x}">${x}</button>`).join("");
}
function renderGrid(){
  const q = busqueda.toLowerCase().trim();
  const vis = PRODUCTOS.filter(p => (filtro==="Todos" || p.acabado===filtro || p.color===filtro) && p.nombre.toLowerCase().includes(q));
  $("#vacio").hidden = vis.length > 0;
  $("#grid").innerHTML = vis.map(p => {
    const tam = sel[p.id], precio = p.precios[tam];
    return `<article class="card" data-id="${p.id}">
      <div class="ph"><img src="${p.imagen}" alt="${p.alt}" loading="lazy"></div>
      <div class="cb"><h3>${p.nombre}</h3><p>${p.desc}</p>
        <div class="sizes" role="group" aria-label="Tamaño">${Object.keys(p.precios).map(t=>`<button class="${t===tam?"on":""}" data-t="${t}">#${t}</button>`).join("")}</div>
        <div class="price">${precio ? fmt(precio) : "Consultar"} <small style="font:300 .8rem var(--sans);color:var(--mut)">c/u · tamaño #${tam}</small></div>
        <div class="acts"><button class="btn alt" data-a="add">Agregar a mi lista</button><a class="btn" data-a="buy" target="_blank" rel="noopener" href="${wa(`Hola, quiero consultar por: ${p.nombre}, tamaño #${tam} (${precio?fmt(precio):"precio por confirmar"} c/u).`)}">WhatsApp</a></div>
      </div></article>`;
  }).join("");
}
function renderLista(){
  $("#contador").textContent = lista.reduce((a,i)=>a+i.q,0);
  $("#items").innerHTML = lista.length ? lista.map((i,k)=>`<li><div>${i.nombre}<small>Tamaño #${i.t} · ${fmt(i.precio)} c/u</small></div><div><button data-k="${k}" data-d="-1" aria-label="Quitar uno">−</button> ${i.q} <button data-k="${k}" data-d="1" aria-label="Agregar uno">+</button></div></li>`).join("") : "<li>Tu lista está vacía.</li>";
  $("#total").textContent = fmt(lista.reduce((a,i)=>a+i.precio*i.q,0));
}
const abrir = v => { $("#drawer").classList.toggle("open",v); $("#drawer").setAttribute("aria-hidden",!v); $("#veil").hidden = !v; };

$("#filtros").addEventListener("click", e => { const b=e.target.closest("button"); if(!b) return; filtro=b.dataset.f; renderFiltros(); renderGrid(); });
$("#buscador").addEventListener("input", e => { busqueda=e.target.value; renderGrid(); });
$("#grid").addEventListener("click", e => {
  const card = e.target.closest(".card"); if(!card) return;
  const p = PRODUCTOS.find(x=>x.id===card.dataset.id);
  const tb = e.target.closest("[data-t]");
  if(tb){ sel[p.id]=tb.dataset.t; renderGrid(); return; }
  if(e.target.dataset.a==="add"){
    const t=sel[p.id], ex=lista.find(i=>i.id===p.id && i.t===t);
    ex ? ex.q++ : lista.push({id:p.id,nombre:p.nombre,t,precio:p.precios[t]||0,q:1});
    renderLista(); abrir(true);
  }
});
$("#items").addEventListener("click", e => {
  const b=e.target.closest("[data-k]"); if(!b) return;
  const i=lista[b.dataset.k]; i.q+=+b.dataset.d; if(i.q<=0) lista.splice(b.dataset.k,1); renderLista();
});
$("#abrirLista").onclick = () => abrir(true);
$("#cerrarLista").onclick = $("#veil").onclick = () => abrir(false);
$("#vaciar").onclick = () => { lista=[]; renderLista(); };
$("#enviarLista").onclick = () => {
  if(!lista.length) return alert("Agrega al menos un producto a tu lista.");
  const l = lista.map(i=>`• ${i.q} x ${i.nombre}, tamaño #${i.t} (${fmt(i.precio)} c/u)`).join("\n");
  const total = lista.reduce((a,i)=>a+i.precio*i.q,0);
  window.open(wa(`Hola, me interesan estos productos:\n${l}\nTotal estimado: ${fmt(total)}`), "_blank", "noopener");
};
$("#burger").onclick = e => { const o=$("#menu").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded",o); };
$("#menu").addEventListener("click", () => $("#menu").classList.remove("open"));
document.addEventListener("keydown", e => e.key==="Escape" && abrir(false));

$("#fWa").href = wa("Hola, quisiera más información."); $("#fWa").textContent = "+" + WHATSAPP_NUMBER;
$("#fIg").href = `https://instagram.com/${INSTAGRAM_USER}`; $("#fIg").textContent = "@" + INSTAGRAM_USER;
$("#anio").textContent = new Date().getFullYear();
renderFiltros(); renderGrid(); renderLista();
