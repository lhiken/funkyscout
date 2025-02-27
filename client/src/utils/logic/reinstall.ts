import throwNotification from "../../components/app/toast/toast";

export default function performReinstallPWA() {
   if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
         for (const registration of registrations) {
            registration.unregister().then(() => {
               caches.keys().then((cacheNames) => {
                  return Promise.all(
                     cacheNames.map((cacheName) => caches.delete(cacheName)),
                  );
               }).then(() => {
                  window.location.reload();
                  setTimeout("1000");
               });
            });
         }
      });
   } else {
      throwNotification("error", "Reinstall failed");
   }
}
