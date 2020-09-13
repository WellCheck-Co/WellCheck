var CACHE_NAME = 'static-cache';
var address = "https://dashboard.wellcheck.fr"
var urlsToCache =[
		      "./login.html", "./index.html", "./js/vue.js", "./js/jquery.min.js", "./js/conf.js", "./js/bootstrap.bundle.min.js", "./js/axios.min.js", "./js/login/login.js",
		      "./js/commons/comp_messages.js", "./js/commons/cred.js", "./js/commons/location.js", "./js/commons/user.js", "./imgs/logo_v2.png",
		      "./css/style.css", "./css/font-awesome.css", "./css/bootstrap.min.css", "./login", "./manifest.json"
		   ];
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});
self.addEventListener('fetch', function(event) {
 if (event.request.method == "GET" && urlsToCache.includes(event.request.url.replace(address, "."))){
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetchAndCache(event.request);
    })
  );}
});

function fetchAndCache(url) {
  return fetch(url)
  .then(function(response) {
    // Check if we received a valid response
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return caches.open(CACHE_NAME)
    .then(function(cache) {
      cache.put(url, response.clone());
      return response;
    });
  })
  .catch(function(error) {
    console.log('Request failed:', error);
    // You could return a custom offline 404 page here
  });
}
