
document.addEventListener("DOMContentLoaded",()=>{
 const nodes=[...document.querySelectorAll("h1,h2,h3,h4,label,button")];
 const target=nodes.find(x=>/api key/i.test(x.textContent||""));
 if(target && !document.getElementById("lsProviderNote")){
   const p=document.createElement("div");p.id="lsProviderNote";p.className="small";
   p.innerHTML="<b>V2:</b> el motor conserva el proveedor existente como fuente opcional; el registro, liquidación, memoria y calibración funcionan localmente. Para automatización real sin exponer claves se recomienda conectar un backend/proxy.";
   target.parentNode.insertBefore(p,target.nextSibling);
 }
});
