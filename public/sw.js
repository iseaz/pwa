self.addEventListener('install', event => {
	console.log('[Service Worker] install', event)
})

self.addEventListener('activate', event => {
	console.log('[Service Worker] activate', event)

	return self.clients.claim()
})

self.addEventListener('fetch', event => {
	console.log('[Service Worker] fetching', event)
	event.respondWith(fetch(event.request))
})