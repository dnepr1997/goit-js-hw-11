import axios from '../node_modules/axios';
import Notiflix from '../node_modules/notiflix';
import SimpleLightbox from 'simplelightbox/dist/simple-lightbox.esm';
import 'simplelightbox/dist/simple-lightbox.min.css';

let options = {
  root: null,
  threshold: 1.0,
  rootMargin: '300px',
};

const params = {
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
};

let observer = new IntersectionObserver(onLastItem, options);
let queryString = '';
let page = 1;
let gallery;

const MAIN_URL = 'https://pixabay.com/api/';
const KEY = '41300969-1e734e71ff54bafcbf52be043';
const galleryItem = document.querySelector('.gallery');
const upperBtn = document.querySelector('.upper');
const target = document.querySelector('.js-guard');

const form = document.querySelector('#search-form');
form.addEventListener('submit', onSubmit);

fetchQuery('photo')
  .then(response => addLayout(response))
  .catch(err => console.log(err));

async function onSubmit(event) {
  event.preventDefault();
  observer.unobserve(target);
  galleryItem.innerHTML = '';
  queryString = '';
  page = 1;

  queryString = event.target.searchQuery.value
    .trim()
    .toLowerCase()
    .replaceAll(' ', '+');

  await fetchQuery(queryString)
    .then(response => {
      addLayout(response);
    })
    .catch(err => console.log(err));
}

async function fetchQuery(queryString) {
  const axInstance = await axios(
    `${MAIN_URL}?key=${KEY}&q=${queryString}&image_type=${params.image_type}&orientation=${params.orientation}&safesearch=${params.safesearch}&per_page=${params.per_page}&page=${page}`
  );
  return axInstance;
}
function addLayout(response) {
  if (!response.data.total) {
    form.reset();
    galleryItem.innerHTML = '';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    createLayout(response.data);
  }
}

function createLayout({ hits, total }) {
  const res = hits
    .map(item => {
      return `<a href="${item.largeImageURL}" class="link">
               <div class="photo-card">
                 <img
                   src="${item.webformatURL}"
                   alt="${item.tags}"
                   loading="lazy"
                   class="cardImage gallery__image"
                 />
                    <div class="info">
                      <p class="info-item">
                        <b class="info-title">Likes</b>${item.likes}
                      </p>
                      <p class="info-item">
                        <b class="info-title">Views</b>${item.views}
                      </p>
                      <p class="info-item"><b class="info-title">Comments</b>${item.comments}</p>
                      <p class="info-item">
                        <b class="info-title">Downloads</b>${item.downloads}
                      </p>
                    </div>
               </div>
             </a> `;
    }).join('');
  destroyGalerry();
  galleryItem.insertAdjacentHTML('beforeend', res);
  gallery = new SimpleLightbox('.gallery a');
  page += 1;
  observer.observe(target);

  if (total <= page * params.per_page - params.per_page) {
    observer.unobserve(target);
  }

  smoothScroll(galleryItem, 0.25);

  upperBtn.removeAttribute('disabled');
  upperBtn.style.fillOpacity = 1;
  upperBtn.style.cursor = 'pointer';

  upperBtn.onclick = () => {
    window.scrollTo(0, 0);
  };
}

function smoothScroll(galleryItem, scrollPercentage) {
  const { height: cardHeight } =
    galleryItem.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * scrollPercentage,
    behavior: 'smooth',
  });
}
function onLastItem(entries) {
  if (entries[0].isIntersecting) {
    fetchQuery(queryString)
      .then(response => addLayout(response))
      .catch(err => console.log(err));
  }
}
async function destroyGalerry(){
   await gallery.refresh();
}
