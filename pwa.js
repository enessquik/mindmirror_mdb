// PWA - Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW kaydedildi:', registration);
        
        // Update kontrolü her 6 saatte bir
        setInterval(() => {
          registration.update();
        }, 6 * 60 * 60 * 1000);
      })
      .catch((error) => {
        console.warn('SW kayıt başarısız:', error);
      });
  });

  // Yeni bir version var mı kontrol et
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Yeni SW version mevcut, sayfa yenilenebilir');
  });
}

// Offline/Online durumu kontrol et
window.addEventListener('online', () => {
  console.log('İnternet bağlantısı sağlandı');
  // Optionally: Show notification to user
});

window.addEventListener('offline', () => {
  console.log('İnternet bağlantısı kesildi - çevrimdışı mod');
  // Optionally: Show notification to user
});
