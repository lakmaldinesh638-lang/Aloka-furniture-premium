(() => {
  "use strict";
  const PHONE = "94779507683";
  const CART_KEY = "aloka_advanced_cart_v1";
  const products = window.ALOKA_PRODUCTS || [];
  const categories = window.ALOKA_CATEGORIES || [];
  let cart = readCart();

  function readCart(){ try { const v=JSON.parse(localStorage.getItem(CART_KEY)||"[]"); return Array.isArray(v)?v:[]; } catch(e){return [];} }
  function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
  function getProduct(id){ return products.find(p=>p.id===id); }
  function esc(s){ return String(s??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function toast(message){ const el=document.getElementById("toast"); if(!el)return; el.textContent=message; el.classList.add("show"); clearTimeout(window.__alokaToastTimer); window.__alokaToastTimer=setTimeout(()=>el.classList.remove("show"),2500); }
  function updateCartCount(){ const n=cart.reduce((sum,item)=>sum+item.qty,0); document.querySelectorAll("#cartCount").forEach(el=>el.textContent=n); }
  function categoryTitle(slug){ return (categories.find(c=>c.slug===slug)||{}).title || "Furniture"; }
  function categoryCard(c){ return `<a class="category-card" href="${esc(c.slug)}.html"><span class="category-icon">${c.icon}</span><strong>${esc(c.title)}</strong><span>${esc(c.tagline)}</span></a>`; }
  function productCard(p){ return `<article class="product-card"><a href="product.html?id=${encodeURIComponent(p.id)}" class="product-media" aria-label="View ${esc(p.name)} details"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='https://placehold.co/800x600/07172d/ffffff?text=Aloka+Furniture'"><span class="badge">${esc(p.badge||"ALOKA")}</span></a><div class="product-info"><span class="product-cat">${esc(categoryTitle(p.category))}</span><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="product-price">${esc(p.priceLabel || "Request a quote")}</div><div class="product-actions"><button class="btn btn-primary" type="button" data-add="${esc(p.id)}">＋ Add to cart</button><a class="btn btn-outline" href="product.html?id=${encodeURIComponent(p.id)}">View details →</a></div></div></article>`; }
  function renderCategoryCards(){ const el=document.getElementById("homeCategories"); if(el)el.innerHTML=categories.map(categoryCard).join(""); }
  function renderFeatured(){ const el=document.getElementById("featuredProducts"); if(el)el.innerHTML=products.slice(0,8).map(productCard).join(""); }
  function renderCatalog(){
    const grid=document.getElementById("productsGrid"); if(!grid)return;
    const path=(location.pathname.split("/").pop()||"index.html").replace(".html","");
    const pageCategory=grid.dataset.category || (path==="cupboards"?"cupboards":path==="wardrobes"?"wardrobes":path==="bedroom"?"bedroom":path==="storage"?"storage":path==="office"?"office":path==="custom"?"custom":"all");
    const filters=document.getElementById("categoryFilters");
    if(filters)filters.innerHTML=`<button class="pill ${pageCategory==="all"?"active":""}" data-filter="all">All products</button>`+categories.map(c=>`<button class="pill ${pageCategory===c.slug?"active":""}" data-filter="${c.slug}">${esc(c.title)}</button>`).join("");
    const search=document.getElementById("productSearch"), sort=document.getElementById("productSort");
    function draw(){
      const q=(search?.value||"").trim().toLowerCase();
      let list=products.filter(p=>(pageCategory==="all"||p.category===pageCategory)&&(!q||(p.name+" "+p.desc+" "+p.category).toLowerCase().includes(q)));
      if(sort?.value==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
      grid.innerHTML=list.length?list.map(productCard).join():`<div class="empty-state" style="grid-column:1/-1"><h3>No products found</h3><p>Try another search term or open another category.</p></div>`;
    }
    search?.addEventListener("input",draw); sort?.addEventListener("change",draw);
    filters?.addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;location.href=b.dataset.filter==="all"?"products.html":b.dataset.filter+".html";});
    draw();
  }
  function addToCart(id){ const p=getProduct(id);if(!p)return;const found=cart.find(i=>i.id===id);if(found)found.qty++;else cart.push({id,qty:1});saveCart();toast("Added to cart: "+p.name); }
  function changeQty(id,delta){const item=cart.find(i=>i.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);saveCart();renderCart();}
  function removeItem(id){cart=cart.filter(i=>i.id!==id);saveCart();renderCart();toast("Product removed from cart");}
  function renderProductDetailPage(){
    const host=document.getElementById("productDetail");
    if(!host)return;
    const id=new URLSearchParams(location.search).get("id");
    const p=getProduct(id);
    if(!p){
      host.innerHTML=`<div class="empty-state"><h2>Product not found</h2><p>Please browse our catalog to choose a product.</p><a class="btn btn-primary" href="products.html">Browse products →</a></div>`;
      return;
    }
    document.title=p.name+" | Aloka Furniture";
    host.innerHTML=`<div class="cart-layout" style="grid-template-columns:1fr 1fr;align-items:start">
      <div><img src="${esc(p.image)}" alt="${esc(p.name)}" style="width:100%;height:440px;object-fit:cover;border-radius:22px;border:1px solid var(--line)" onerror="this.src='https://placehold.co/900x700/07172d/ffffff?text=Aloka+Furniture'"></div>
      <div class="checkout-box"><span class="eyebrow">${esc(categoryTitle(p.category))}</span><h1 class="page-title">${esc(p.name)}</h1><p class="product-price" style="font-size:18px">${esc(p.priceLabel||"Request a quote")}</p><p class="muted">${esc(p.desc)}</p><h3 style="font-size:13px;color:var(--navy);margin-top:22px">Design details</h3><ul style="padding-left:18px;color:var(--muted);font-size:12px;line-height:2">${p.features.map(f=>`<li>${esc(f)}</li>`).join("")}</ul><div class="notice">This is a design reference, not a confirmed stock listing. Ask us to confirm the exact design, dimensions, finish, final price and delivery.</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><button class="btn btn-primary" type="button" data-add="${esc(p.id)}">＋ Add to cart</button><a class="btn btn-green" href="https://wa.me/${PHONE}?text=${encodeURIComponent("Hello Aloka Furniture, I am interested in: "+p.name+". Please share the price, dimensions and availability.")}" target="_blank" rel="noopener">Ask on WhatsApp ↗</a></div><p style="margin-top:18px"><a href="${esc(p.category)}.html" style="color:var(--blue);font-size:12px;font-weight:900">← More ${esc(categoryTitle(p.category))}</a></p></div>
    </div><section style="margin-top:44px"><div class="section-head"><div><span class="eyebrow">You may also like</span><h2>Related ideas</h2></div></div><div class="product-grid">${products.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4).map(productCard).join("")}</div></section>`;
  }
  function renderCart(){
    const host=document.getElementById("cartItems");if(!host)return;
    if(!cart.length){host.innerHTML=`<div class="empty-state"><div style="font-size:35px">🛒</div><h3>Your cart is empty</h3><p>Browse the furniture collection and add products you like.</p><a class="btn btn-primary" href="products.html">Browse products →</a></div>`;document.getElementById("summaryCount").textContent="0";return;}
    host.innerHTML=cart.map(item=>{const p=getProduct(item.id);if(!p)return "";return `<div class="cart-line"><img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.src='https://placehold.co/200x200/07172d/ffffff?text=Aloka'"><div><h3>${esc(p.name)}</h3><p>${esc(categoryTitle(p.category))} · ${esc(p.priceLabel||"Request a quote")}</p><div class="qty"><button type="button" data-minus="${esc(p.id)}" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button type="button" data-plus="${esc(p.id)}" aria-label="Increase quantity">+</button></div><br><button class="remove-btn" type="button" data-remove="${esc(p.id)}">Remove</button></div><strong class="line-price">${item.qty} × quote</strong></div>`;}).join("");
    document.getElementById("summaryCount").textContent=cart.reduce((s,i)=>s+i.qty,0)+" item(s)";
  }
  function waOpen(message){const url="https://wa.me/"+PHONE+"?text="+encodeURIComponent(message);window.open(url,"_blank","noopener,noreferrer");}
  function wireForms(){
    document.getElementById("checkoutForm")?.addEventListener("submit",e=>{e.preventDefault();if(!cart.length){toast("Your cart is empty");return;}const f=new FormData(e.currentTarget);const lines=cart.map(i=>{const p=getProduct(i.id);return p?`• ${p.name} — Qty: ${i.qty} (price to be quoted)`:null;}).filter(Boolean);const msg=["Hello Aloka Furniture! I would like to inquire about these products:","",...lines,"","Customer name: "+f.get("name"),"Phone: "+f.get("phone"),"Delivery area/address: "+f.get("address"),"Extra notes: "+(f.get("notes")||"None"),"","Please confirm price, availability, delivery and payment details."].join("\n");waOpen(msg);});
    document.getElementById("customForm")?.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.currentTarget);const msg=["Hello Aloka Furniture! I would like a custom furniture quote.","","Name: "+f.get("name"),"Phone: "+f.get("phone"),"Furniture type: "+f.get("type"),"Height: "+(f.get("height")||"Not specified"),"Width: "+(f.get("width")||"Not specified"),"Depth: "+(f.get("depth")||"Not specified"),"Preferred finish: "+(f.get("finish")||"Not specified"),"Details: "+(f.get("notes")||"None")].join("\n");waOpen(msg);});
  }
  document.addEventListener("click",e=>{const add=e.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return;}const plus=e.target.closest("[data-plus]");if(plus){changeQty(plus.dataset.plus,1);return;}const minus=e.target.closest("[data-minus]");if(minus){changeQty(minus.dataset.minus,-1);return;}const rem=e.target.closest("[data-remove]");if(rem){removeItem(rem.dataset.remove);return;}});
  document.getElementById("mobileMenu")?.addEventListener("click",()=>document.getElementById("navlinks")?.classList.toggle("open"));
  document.querySelectorAll("#navlinks a").forEach(a=>a.addEventListener("click",()=>document.getElementById("navlinks")?.classList.remove("open")));
  const topBtn=document.getElementById("backTop");window.addEventListener("scroll",()=>{const progress=document.getElementById("progress");if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+"%";}if(topBtn)topBtn.style.display=scrollY>450?"flex":"none";},{passive:true});topBtn?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
  document.getElementById("year")?.replaceChildren(String(new Date().getFullYear()));
  renderCategoryCards();renderFeatured();renderCatalog();renderProductDetailPage();renderCart();wireForms();updateCartCount();
})();
