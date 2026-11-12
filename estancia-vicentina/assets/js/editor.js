(() => {
  'use strict';
  const data=JSON.parse(JSON.stringify(window.VICENTINA));
  const names={contacto:'Datos de contacto',redes:'Redes sociales (enlaces completos)',linkedin:'LinkedIn de los impulsores',plano:'Plano',formularios:'Conexión de formularios (programador)',medicion:'Medición de campañas',sitio:'Dirección del sitio publicado',textos:'Textos del sitio'};
  const labels={telefonoVisible:'Teléfono que se muestra',telefono:'Teléfono para llamadas (solo números, código de país incluido)',email:'Correo electrónico',whatsapp:'WhatsApp (solo números, código de país incluido)',mensajeWhatsapp:'Mensaje inicial de WhatsApp',imagen:'Ruta de la imagen del plano',provisorio:'Mostrar aclaración de plano provisorio',contactoEndpoint:'URL del backend de contacto (dejar vacía hasta integrar)',newsletterEndpoint:'URL del backend de newsletter (dejar vacía hasta integrar)',gtmId:'ID de Google Tag Manager (GTM-...)',debug:'Mostrar eventos en la consola para pruebas',url:'URL final del sitio (https://...)'};
  const fields=document.querySelector('#fields');
  Object.entries(data).forEach(([section,values]) => {
    const group=document.createElement('details');group.open=section==='contacto';
    const heading=document.createElement('summary');heading.textContent=names[section]||section;group.append(heading);
    Object.entries(values).forEach(([key,value]) => {
      const label=document.createElement('label');label.textContent=labels[key]||key.replaceAll('_',' ');
      const input=document.createElement(section==='textos'||key==='mensajeWhatsapp'?'textarea':'input');
      if(typeof value==='boolean'){input.type='checkbox';input.checked=value;}else{input.value=value;}
      input.addEventListener('input',()=>{data[section][key]=typeof value==='boolean'?input.checked:input.value;});
      label.append(input);group.append(label);
    });
    fields.append(group);
  });
  document.querySelector('#save').addEventListener('click',()=>{
    if(data.medicion.gtmId&&!/^GTM-[A-Z0-9]+$/.test(data.medicion.gtmId)){document.querySelector('#status').textContent='Revisá el ID de Google Tag Manager: debe comenzar con GTM-.';return;}
    const file=new Blob(['// Configuración editable de Estancia Vicentina.\nwindow.VICENTINA = '+JSON.stringify(data,null,2)+';\n'],{type:'text/javascript;charset=utf-8'});
    const url=URL.createObjectURL(file);const link=document.createElement('a');link.href=url;link.download='configuracion.js';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    document.querySelector('#status').textContent='Configuración descargada. Reemplazá configuracion.js en el proyecto y recargá el sitio.';
  });
})();
