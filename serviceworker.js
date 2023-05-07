const V = "v4";

oninstall = ()=> {

  skipWaiting();
  caches.open(V).then((cache)=> cache.addAll("/", "/index.html"));

};

onactivate = ()=> caches.keys().then((keys)=> keys.forEach((v)=> v!==V&&caches.delete(v)));

const onfet = async(req)=> {

  var cache = await caches.open(V);
  var cached = await cache.match(req);
  if(cached) return cached;

  try {

    var res = await fetch(req);
    cache.put(req, res.clone());
    return res;

  }catch {

    return new Response("你请求的文件gg了", {"status": 408});

  }

};

onfetch = (e)=> e.respondWith(onfet(e.request));
