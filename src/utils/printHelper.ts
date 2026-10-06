/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilitário para impressão robusta em ambientes web e iframes sandboxed.
 * Evita o uso de window.open que é frequentemente bloqueado por navegadores e iframes.
 */
export const printHtml = (title: string, bodyContent: string, customStyles: string = ''): void => {
  try {
    // 1. Criar iframe invisível
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;z-index:-9999;');
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @page {
              margin: 8mm;
              size: auto;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            ${customStyles}
          </style>
        </head>
        <body>
          ${bodyContent}
        </body>
      </html>
    `;

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // 2. Aguardar renderização das imagens/estilos e disparar o diálogo de impressão
    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Erro ao acionar impressão via iframe, usando fallback:', err);
        window.print();
      } finally {
        setTimeout(() => {
          try {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          } catch {}
        }, 3000);
      }
    };

    // Dar tempo para imagens carregarem no documento do iframe
    setTimeout(triggerPrint, 350);
  } catch (e) {
    console.error('Falha na impressão via printHtml:', e);
    window.print();
  }
};
