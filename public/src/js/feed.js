var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';

  if (deferredPrompt) {
    deferredPrompt.prompt()

    deferredPrompt.userChoice.then(choiceResult => {
      console.log(choiceResult.outcome)

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation')
      } else {
        console.log('User added to home screen')
      }
    })

    deferredPrompt = null
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistration()
  //     .then(registrations => {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister()
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'red';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location
  cardSupportingText.style.textAlign = 'center';

  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSupportingText.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);

  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function onSaveButtonClicked(event){
  if ('caches' in window) {
    caches.open('user-requested')
      .then(cache => {
        cache.add('https://httpbin.org/get')
        cache.add('/src/images/sf-boat.jpg')
      })
  }
}

function updateUI(data){
  for (var i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

var url = 'https://pwagram-cf8ed.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
  .then(resp => {
    if (resp) {
      return resp.json()
    }
  })
  .then(data => {
    networkDataReceived = true
    console.log('From web', data)
    var dataArray = []

    for (var key in data) {
      dataArray.push(data[key])
    }

    updateUI(dataArray)
  })

if ('caches' in window) {
  caches.match(url)
    .then(resp => {
      if (resp) {
        return resp.json()
      }
    })
    .then(data => {
      console.log('From cache', data)

      if (!networkDataReceived) {
        var dataArray = []

        for (var key in data) {
          dataArray.push(data[key])
        }
        
        updateUI(dataArray)
      }
    })
}