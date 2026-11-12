/* GTM es el único punto de instalación: configurar GA4, Google Ads y Meta allí.
 * No enviar nombres, emails, teléfonos ni mensajes al dataLayer. */
(() => {
  'use strict';
  const config = window.VICENTINA.medicion;
  window.dataLayer = window.dataLayer || [];
  const gtag = function () { window.dataLayer.push(arguments); };
  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* Navegación privada */ } }
  };
  let choice = storage.get('vicentina_consent');
  let started = false;
  const enabled = /^GTM-[A-Z0-9]+$/.test(config.gtmId);
  gtag('consent', 'default', { ad_storage:'denied', analytics_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
  const attributionKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','fbclid'];
  let attribution = {};
  try { attribution = JSON.parse(storage.get('vicentina_attribution') || '{}'); } catch { /* Estado anterior inválido */ }
  const params = new URLSearchParams(location.search);
  attributionKeys.forEach(key => { if (params.has(key)) attribution[key] = params.get(key).slice(0,500); });
  function loadGTM() {
    if (!enabled || started) return;
    started = true;
    window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + config.gtmId;
    document.head.append(script);
  }
  function consent(value) {
    choice = value;
    storage.set('vicentina_consent', value);
    gtag('consent', 'update', {ad_storage:value,analytics_storage:value,ad_user_data:value,ad_personalization:value});
    if (value === 'granted') {
      storage.set('vicentina_attribution', JSON.stringify(attribution));
      loadGTM();
    } else { storage.set('vicentina_attribution','{}'); }
  }
  window.VicentinaTracking = {
    // Solo la atribución autorizada viaja al backend; nunca se publica en dataLayer.
    attribution: () => choice === 'granted' ? {...attribution} : {},
    event(name, details = {}) {
      const allowed = ['label','form_id','lot_type','event_id','error_type'];
      const payload = {event:name,page_type:document.body.dataset.page,page_path:location.pathname};
      allowed.forEach(key => { if (details[key] !== undefined) payload[key] = String(details[key]).slice(0,100); });
      if (choice === 'granted' || !enabled) window.dataLayer.push(payload);
      if (config.debug) console.info('[Vicentina]',payload);
    }
  };
  if (choice === 'granted') consent(choice);
  const banner = document.querySelector('.consent');
  if (enabled && !choice) banner.hidden = false;
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const revoked = started && button.dataset.consent === 'denied';
    consent(button.dataset.consent);
    banner.hidden = true;
    // Recargar retira scripts de terceros ya cargados tras una aceptación previa.
    if (revoked) location.reload();
  }));
  const settings = document.querySelector('.privacy-settings');
  if (enabled) { settings.hidden = false; settings.addEventListener('click', () => { banner.hidden = false; }); }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-track]');
    if (link) window.VicentinaTracking.event(link.dataset.track, {label:link.dataset.label || link.getAttribute('aria-label') || link.textContent.trim()});
  });
})();
