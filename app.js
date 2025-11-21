if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log("Service Worker зареєстровано:", reg))
      .catch(err => console.log("Помилка Service Worker:", err));
  });
}
