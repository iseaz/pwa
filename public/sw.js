importScripts('/src/js/idb.js')

let CACHE_STATIC_NAME = 'static-v16'
let CACHE_DYNAMIC_NAME = 'dynamic-v2'
let STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/feed.js',
	'/src/js/idb.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

let dbPromise = idb.open('posts-store', 1, db => {
	if (!db.objectStoreNames.contains('posts')) {
		db.createObjectStore('posts', { keyPath: 'id' })
	}
})

// function trimCache(cacheName, maxItems) {
// 	caches.open(cacheName)
// 		.then(cache => {
// 			return cache.keys()
// 				.then(keys => {
// 					if (keys.length > maxItems) {
// 						cache.delete(keys[0])
// 							.then(trimCache(cacheName, maxItems))
// 					}
// 				})
// 		})
// }

self.addEventListener('install', event => {
	console.log('[Service Worker] install', event)

	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
			.then(cache => {
				cache.addAll([
					'/',
					'/index.html',
					'/offline.html',
					'/src/js/app.js',
					'/src/js/feed.js',
					'/src/js/promise.js',
					'/src/js/fetch.js',
					'/src/js/material.min.js',
					'/src/css/app.css',
					'/src/css/feed.css',
					'/src/images/main-image.jpg',
					'https://fonts.googleapis.com/css?family=Roboto:400,700',
					'https://fonts.googleapis.com/icon?family=Material+Icons',
					'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
				])
			})
	)
})

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys()
			.then(keyList => {
				return Promise.all(keyList.map(key => {
					if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
						console.log('[Service worker] Removing old cache', key)
						return caches.delete(key)
					}
				}))
			})
	)

	return self.clients.claim()
})

// self.addEventListener('fetch', event => {
// 	event.respondWith(
// 		caches.match(event.request)
// 			.then(response => {
// 				if (response) {
// 					return response
// 				} else {
// 					return fetch(event.request)
// 						.then(res => {
// 							return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
// 								cache.put(event.request.url, res.clone())

// 								return res
// 							})
// 						})
// 						.catch(err => {
// 							return caches.open(CACHE_STATIC_NAME)
// 								.then(cache => {
// 									return cache.match('/offline.html')
// 								})
// 						})
// 				}
// 			})
// 	)
// })

// self.addEventListener('fetch', event => {
// 	event.respondWith(
// 		fetch(event.request)
// 			.then(res => {
// 				return caches.open(CACHE_DYNAMIC_NAME)
// 					.then(cache => {
// 						cache.put(event.request.url, res.clone())
// 						return res
// 					})
// 			})
// 			.catch(err => caches.match(event.request))
// 	)
// })

function isInArray(str, arr){
	arr.map(item => {
		if (item === str) {
			return true
		}
	})

	return false
}

self.addEventListener('fetch', event => {
	let url = 'https://pwagram-cf8ed.firebaseio.com/posts'

	if (event.request.url.indexOf(url) > -1) {
		event.respondWith(
			fetch(event.request)
				.then(res => {
					let clonedRes = res.clone()
					clonedRes.json()
						.then(data => {
							for (let key in data) {
								dbPromise.then(db => {
									let tx = db.transaction('posts', 'readwrite')
									let store = tx.objectStore('posts')
									store.put(data[key])

									return tx.complete
								})
							}
						})

					return res
				})
		)
	} else if (isInArray(event.request.url, STATIC_FILES)) {
		event.respondWith(
			caches.match(event.request)
		)
	} else {
		event.respondWith(
			caches.match(event.request)
				.then(response => {
					if (response) {
						return response
					} else {
						return fetch(event.request)
							.then(res => {
								return caches.open(CACHE_DYNAMIC_NAME)
									.then(cache => {
										cache.put(event.request.url, res.clone())

										return res
									})
							})
							.catch(err => {
								return caches.open(CACHE_STATIC_NAME)
									.then(cache => {
										// if (event.request.url.indexOf('/help')) {
										// 	return cache.match('/offline.html')
										// }

										if (event.request.headers.get('accept').includes('text/html')) {
											return cache.match('/offline.html')
										}
									})
							})
					}
				})
		)
	}
})