import React, { useEffect } from 'react';

declare global {
  interface Window {
    Sender: any;
    sender: any;
  }
}

const SenderForm: React.FC = () => {
  useEffect(() => {
    (function (s: any, e: Document, n: string, d: string, er: string) {
      s['Sender'] = er;
      (s[er] =
        s[er] ||
        function () {
          (s[er].q = s[er].q || []).push(arguments);
        }),
        (s[er].l = 1 * new Date().getTime());
      const a = e.createElement(n),
        m = e.getElementsByTagName(n)[0];
      a.async = true;
      a.src = d;
      m.parentNode.insertBefore(a, m);
    })(
      window,
      document,
      'script',
      'https://cdn.sender.net/accounts_resources/universal.js',
      'sender'
    );
    window.sender('9f6ebaddf82463');

    // Hide the specific element inside the iframe after it has been rendered
    const hideElementInIframe = () => {
      const iframe = document.querySelector(
        '.sender-form-container iframe'
      ) as HTMLIFrameElement;
      if (iframe) {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          const element = iframeDocument.querySelector(
            'div[style*="margin-top: 20px"] a[href*="sender.net"]'
          ) as HTMLElement;
          if (element) {
            element.style.display = 'none';
          }
        }
      }
    };

    // Wait for the iframe to load and then hide the element
    const intervalId = setInterval(() => {
      hideElementInIframe();
    }, 1000); // Check every second

    // Clear the interval after a certain time to stop checking
    setTimeout(() => {
      clearInterval(intervalId);
    }, 10000); // Stop checking after 10 seconds
  }, []);

  return (
    <div
      className='sender-form-container sender-form-field'
      data-sender-form-id='m3ta3sfodbbnzqvf785'></div>
  );
};

export default SenderForm;
