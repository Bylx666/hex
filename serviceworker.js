self.addEventListener("install", (e)=> e.waitUntil(caches.open("v1").then((cache)=> cache.addAll(["index.html", "h.js"]))));

self.addEventListener("fetch", (e)=> e.respondWith(caches.match(e.request).then((v)=> v||fetch(e.request).then((v)=> {

  caches.open("v1").then((cache)=> cache.put(e.request, v.clone()));
  return v;

}).catch((r)=> new Response(0, {"status": 404, "statusText": "莫得网络"})))));
