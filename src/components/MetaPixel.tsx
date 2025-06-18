
import { useEffect } from 'react';

declare global {
  interface Window {
    fbq?: (action: string, ...args: any[]) => void;
    _fbq?: any;
  }
}

const MetaPixel = () => {
  useEffect(() => {
    if (typeof window.fbq !== 'undefined') return;

    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function (...args: any[]) {
        n.callMethod
          ? n.callMethod.apply(n, args)
          : n.queue.push(args);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', undefined);

    if (window.fbq) {
      window.fbq('init', '709563458627541');
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src="https://www.facebook.com/tr?id=709563458627541&ev=PageView&noscript=1"
      />
    </noscript>
  );
};

export default MetaPixel;
