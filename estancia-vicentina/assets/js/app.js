/* Interacciones compartidas. Los datos editables viven en configuracion.js. */
(() => {
  'use strict';
  const config = window.VICENTINA;
  const track = window.VicentinaTracking;
  document.querySelectorAll('[data-content]').forEach(el => {
    if (typeof config.textos[el.dataset.content] === 'string') el.textContent = config.textos[el.dataset.content];
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    if (el.tagName === 'A' && el.dataset.page === document.body.dataset.page) el.setAttribute('aria-current','page');
  });
  document.querySelectorAll('[data-phone]').forEach(el => { el.textContent = config.contacto.telefonoVisible; el.href = 'tel:+' + config.contacto.telefono.replace(/\D/g,''); });
  document.querySelectorAll('[data-email]').forEach(el => { el.textContent = config.contacto.email; el.href = 'mailto:' + config.contacto.email; });
  document.querySelectorAll('[data-whatsapp]').forEach(el => { el.href = 'https://wa.me/' + config.contacto.whatsapp.replace(/\D/g,'') + '?text=' + encodeURIComponent(config.contacto.mensajeWhatsapp); });
  function external(el,url) {
    try { const parsed = new URL(url); if (parsed.protocol !== 'https:') return; el.href = parsed.href; el.target='_blank'; el.rel='noopener noreferrer'; el.hidden=false; } catch { /* Enlace aún no entregado */ }
  }
  document.querySelectorAll('[data-social]').forEach(el => external(el,config.redes[el.dataset.social]));
  document.querySelectorAll('[data-linkedin]').forEach(el => external(el,config.linkedin[el.dataset.linkedin]));
  const plan = document.querySelector('.plan-image');
  if (plan) {
    plan.src = config.plano.imagen;
    document.querySelector('[data-plan-link]').href = config.plano.imagen;
    document.querySelector('.plan-note').hidden = !config.plano.provisorio;
    plan.alt = config.plano.provisorio ? 'Plano provisorio de Estancia Vicentina' : 'Plano de Estancia Vicentina';
  }
  if (config.sitio.url) {
    try {
      const base = new URL(config.sitio.url.endsWith('/') ? config.sitio.url : config.sitio.url+'/');
      const canonical = document.createElement('link'); canonical.rel='canonical'; canonical.href=new URL(document.body.dataset.page === 'home' ? './' : document.body.dataset.page+'.html',base).href; document.head.append(canonical);
      document.querySelector('[property="og:image"]').content=new URL('assets/images/hero-home.webp',base).href;
    } catch { /* Dominio no configurado */ }
  }
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  toggle.addEventListener('click', () => { menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded',String(!menu.hidden)); toggle.setAttribute('aria-label',menu.hidden?'Abrir menú':'Cerrar menú'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) {menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();} });
  const lot = new URLSearchParams(location.search).get('lote');
  if (['origen','encuentro','reserva','general'].includes(lot)) { const select=document.querySelector('[name="lote"]'); if(select) select.value=lot; }
  document.querySelectorAll('form[data-form]').forEach(form => {
    let busy = false;
    let started = false;
    form.addEventListener('input', () => { if (!started) { track.event('form_start',{form_id:form.dataset.form}); started=true; } });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      const data = new FormData(form);
      if (data.get('website')) return;
      const id = form.dataset.form;
      const endpoint = config.formularios[id+'Endpoint'];
      const status = form.querySelector('.form-status');
      status.textContent = '';
      if (!endpoint) {
        status.textContent = id === 'contacto' ? 'El envío desde la web todavía no está disponible. Podés consultarnos por WhatsApp o correo.' : 'La suscripción todavía no está disponible. Escribinos por correo para solicitar información.';
        const link=document.createElement('a');link.textContent=' Escribinos';link.href='mailto:'+config.contacto.email;status.append(link);
        track.event('form_unavailable',{form_id:id});
        return;
      }
      busy = true;
      const button=form.querySelector('[type="submit"]');button.disabled=true;button.setAttribute('aria-busy','true');
      status.textContent='Enviando…';
      const eventId = globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
      const payload={...Object.fromEntries(data),form_id:id,event_id:eventId,attribution:track.attribution()};
      track.event('form_submit',{form_id:id});
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(),15000);
      try {
        const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('server');
        status.textContent=id==='contacto'?'Gracias. Recibimos tu consulta y nos pondremos en contacto.':'Gracias por suscribirte.';
        track.event(id==='contacto'?'generate_lead':'newsletter_signup',{form_id:id,lot_type:String(data.get('lote')||''),event_id:eventId});
        form.reset();started=false;
      } catch(error) {
        status.textContent='No pudimos confirmar el envío. Intentá nuevamente o contactanos por WhatsApp.';
        track.event('form_error',{form_id:id,error_type:error.name==='AbortError'?'timeout':'server'});
      } finally { clearTimeout(timeout);busy=false;button.disabled=false;button.removeAttribute('aria-busy'); }
    });
  });
})();
