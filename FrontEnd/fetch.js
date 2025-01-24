const API_CONFIG = {
  url: 'http://localhost:5678/api/',
};

async function fetchWorks() {
  try {
    const response = await fetch(`${API_CONFIG.url}works`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const works = await response.json();
    console.log('Données récupérées:', works);
    renderGallery(works);
    return works;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return [];
  }
}

function renderGallery(works) {
  const galleryContainer = document.querySelector('.gallery');
  galleryContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();

  works.forEach((work) => {
    const workElement = document.createElement('figure');
    workElement.dataset.id = work.id;

    const imageElement = document.createElement('img');
    imageElement.src = work.imageUrl;
    imageElement.alt = work.title;

    const captionElement = document.createElement('figcaption');
    captionElement.textContent = work.title;

    workElement.append(imageElement, captionElement);
    fragment.appendChild(workElement);
  });

  galleryContainer.appendChild(fragment);
}

async function fetchCategories() {
  try {
    const response = await fetch(`${API_CONFIG.url}categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const categories = await response.json();
    console.log('Données récupérées:', categories);
    return categories;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return [];
  }
}

function createFilterButtons(works) {
  const portfolioSection = document.getElementById('portfolio');
  let filterContainer = document.getElementById('filter-container');
  const authToken = localStorage.getItem('authToken'); // Vérifie si l'utilisateur est connecté

  // Si connecté, ne crée pas les filtres
  if (authToken) {
    if (filterContainer) {
      filterContainer.remove(); // Supprime le conteneur s'il existe déjà
    }
    return;
  }

  if (!filterContainer) {
    filterContainer = document.createElement('ul');
    filterContainer.id = 'filter-container';
    portfolioSection.insertBefore(filterContainer, portfolioSection.querySelector('.gallery'));
  }

  filterContainer.innerHTML = '';

  const createFilterButton = (label, filterFn, isActive = false) => {
    const button = document.createElement('li');
    button.textContent = label;
    if (isActive) button.classList.add('active');
    button.addEventListener('click', () => {
      const filteredWorks = filterFn(works);
      renderGallery(filteredWorks);
      setActiveButton(button);
    });

    return button;
  };

  const allButton = createFilterButton('Tous', () => works, true);
  filterContainer.appendChild(allButton);

  fetchCategories().then((categories) => {
    if (categories.length > 0) {
      categories.forEach((category) => {
        const categoryButton = createFilterButton(
          category.name,
          (works) => works.filter((work) => work.categoryId === category.id)
        );
        filterContainer.appendChild(categoryButton);
      });
    }
  });
}


function setActiveButton(activeButton) {
  const buttons = document.querySelectorAll('#filter-container li');
  buttons.forEach((btn) => btn.classList.remove('active'));
  activeButton.classList.add('active');
}

function initGallery() {
  fetchWorks()
    .then((works) => {
      if (works.length > 0) {
        createFilterButtons(works);
        renderGallery(works);
      }
    })
    .catch((error) => {
      console.error('Erreur lors de l\'initialisation de la galerie:', error);
    });
}

initGallery();

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_CONFIG.url}users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Erreur inconnue' };
    }

    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, message: 'Erreur réseau. Veuillez réessayer plus tard.' };
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const result = await loginUser(email, password);

    if (result.success) {
      localStorage.setItem('authToken', result.data.token);
      window.location.href = '/FrontEnd/index.html';
    } else {
      alert('Email ou mot de passe incorrect. Veuillez réessayer.');
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    console.log('Token récupéré depuis le localStorage :', authToken);
  } else {
    console.log('Aucun token trouvé dans le localStorage.');
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const iconLink = document.getElementById('icona');
  const adminBar = document.getElementById('admin-bar');
  const loginLink = document.querySelector('a.login');

  if (!iconLink || !loginLink) {
    return;
  }

  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    loginLink.textContent = 'Logout';
    loginLink.href = '#';
    adminBar.classList.add('visible');
    adminBar.style.display = 'flex';
    iconLink.style.display = 'inline-block';

    loginLink.addEventListener('click', function (event) {
      event.preventDefault();
      localStorage.removeItem('authToken');
      loginLink.textContent = 'Login';
      loginLink.href = 'login.html';
      adminBar.classList.remove('visible');
      adminBar.style.display = 'none';
      iconLink.style.display = 'none';
      window.location.reload();
    });
  } else {
    loginLink.textContent = 'Login';
    loginLink.href = 'login.html';
    adminBar.classList.remove('visible');
    adminBar.style.display = 'none';
    iconLink.style.display = 'none';

    iconLink.addEventListener('click', function (event) {
      event.preventDefault();
      alert('Veuillez vous connecter pour modifier.');
    });
  }
});

async function fetchWorksPost() {
  try {
    const formData = new FormData();
    formData.append('title', 'Titre Exemple');
    formData.append('category', 1);
    formData.append('image', new Blob(['fake image data'], { type: 'image/png' }));

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token introuvable dans localStorage. Veuillez vous connecter.');
    }

    const response = await fetch(`${API_CONFIG.url}works`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: FormData,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorText = await response.text();
      console.error(`Erreur HTTP ${response.status}:`, errorText);
    }
  } catch (error) {
    console.error('Erreur lors de la requête POST:', error);
  }
}

let modal = null;

const focusableSelector = 'button, a, input, textarea';
let focusables = [];

const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector(e.target.getAttribute('href'));
  target.style.display = null;
  target.removeAttribute('aria-hidden');
  target.setAttribute('aria-modal', 'true');
  modal = target;
  modal.addEventListener('click', closeModal);
  modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
  modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
  document.body.style.overflow = 'hidden';
};

const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('aria-modal');
  modal.removeEventListener('click', closeModal);
  modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
  modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
  modal = null;
  document.body.style.overflow = '';
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

const focusInModal = function (e) {
  e.preventDefault();
};

document.querySelectorAll('.js-modal').forEach((a) => {
  a.addEventListener('click', openModal);
});

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeModal(e);
  }

  if (e.key === 'Tab' && modal !== null) {
    focusInModal(e);
  }
});

function renderGalleryInModal(works) {
  const modalWrapper = document.querySelector('.modal-wrapper.js-modal-stop');

  if (!modalWrapper) {
    console.error('Le conteneur modal-wrapper.js-modal-stop est introuvable.');
    return;
  }

  // Supprimez l'ancienne galerie si elle existe
  let galleryContainer = modalWrapper.querySelector('.gallery-modal');
  if (galleryContainer) {
    galleryContainer.remove();
  }

  // Créez un nouveau conteneur pour la galerie
  galleryContainer = document.createElement('div');
  galleryContainer.classList.add('gallery-modal');

  // Ajoutez les images à la galerie
  works.forEach((work) => {
    const workElement = document.createElement('div');
    workElement.classList.add('gallery-item');
    workElement.dataset.id = work.id;

    const imageElement = document.createElement('img');
    imageElement.src = work.imageUrl;
    imageElement.classList.add('modal-image');

    const iconElement = document.createElement('i');
    iconElement.classList.add('fa-solid', 'fa-trash-can', 'delete-icon');
    iconElement.title = 'Supprimer';

    // Ajoutez l'événement pour supprimer une image
    iconElement.addEventListener('click', function () {
      workElement.remove();
      console.log(`Image supprimée : ${work.id}`);
    });

    workElement.appendChild(imageElement);
    workElement.appendChild(iconElement);
    galleryContainer.appendChild(workElement);
  });

  // Ajoutez la galerie dans la modale
  modalWrapper.appendChild(galleryContainer);

  // Ajoutez un séparateur sous la galerie (s'il n'existe pas déjà)
  let separator = modalWrapper.querySelector('.modal-separator');
  if (!separator) {
    separator = document.createElement('hr');
    separator.classList.add('modal-separator');
    modalWrapper.appendChild(separator);
  }

  // Créez ou réutilisez la div "bouton-envoie" en la plaçant **après** la galerie
  let buttonContainer = modalWrapper.querySelector('.bouton-envoie');
  if (!buttonContainer) {
    buttonContainer = document.createElement('div');
    buttonContainer.classList.add('bouton-envoie');

    // Créez le bouton "Ajouter une photo"
    const addButton = document.createElement('button');
    addButton.textContent = 'Ajouter une photo';
    addButton.classList.add('add-photo-button');

    // Ajoutez un écouteur d'événement au bouton
    addButton.addEventListener('click', () => {
      console.log('Bouton Ajouter une photo cliqué');

      // Basculer l'affichage entre la galerie et le formulaire
      toggleAddPhotoForm(true); // Affiche le formulaire
    });

    // Ajoutez le bouton dans la div "bouton-envoie"
    buttonContainer.appendChild(addButton);
  }

  // Placez toujours le bouton et le séparateur après la galerie
  modalWrapper.appendChild(separator);
  modalWrapper.appendChild(buttonContainer);
}

// Fonction pour gérer l'état du formulaire
function toggleAddPhotoForm(showForm) {
  const galleryContainer = document.querySelector('.gallery-modal'); // Galerie
  const formContainer = document.querySelector('.add-photo-form'); // Formulaire
  const addButton = document.querySelector('.add-photo-button'); // Bouton principal

  if (!galleryContainer || !formContainer || !addButton) {
    console.error('Élément(s) manquant(s) : impossible de basculer entre la galerie et le formulaire.');
    return;
  }

  if (showForm) {
    galleryContainer.style.display = 'none'; // Masquer la galerie
    formContainer.style.display = 'block'; // Afficher le formulaire
    addButton.textContent = 'Valider'; // Changer texte bouton
  } else {
    galleryContainer.style.display = 'block'; // Afficher la galerie
    formContainer.style.display = 'none'; // Masquer le formulaire
    addButton.textContent = 'Ajouter une photo'; // Texte par défaut
  }
}


function createBackButton() {
  const modalWrapper = document.querySelector('.modal-wrapper.js-modal-stop');
  if (!modalWrapper) {
    console.error('Le conteneur modal-wrapper.js-modal-stop est introuvable.');
    return;
  }

  let backButton = modalWrapper.querySelector('.back-button');
  if (!backButton) {
    backButton = document.createElement('button');
    backButton.classList.add('back-button');
    backButton.style.display = 'none'; // Masqué par défaut
    backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Retour';
    backButton.addEventListener('click', () => toggleAddPhotoForm(false));
    modalWrapper.prepend(backButton); // Ajouter en haut
  }
}

async function fetchAndRenderGalleryInModal() {
  try {
    const response = await fetch(`${API_CONFIG.url}works`);
    const works = await response.json();

    console.log('Données récupérées :', works);

    // Exemple simplifié pour afficher la galerie
    renderGalleryInModal(works);
    createBackButton(); // Créer bouton retour
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
  }
}


// Initialiser la galerie modale
fetchAndRenderGalleryInModal();

// Gestion des états connectés/déconnectés
document.addEventListener('DOMContentLoaded', function () {
  const authToken = localStorage.getItem('authToken');
  const body = document.body;

  if (authToken) {
    body.classList.add('user-logged-in'); // Ajoute une classe si connecté
  } else {
    body.classList.remove('user-logged-in'); // Retire la classe si déconnecté
  }
});

// Ajoutez un séparateur
const separator = document.createElement('hr');
separator.classList.add('modal-separator');

// Créez la div "bouton-envoie"
const buttonContainer = document.createElement('div');
buttonContainer.classList.add('bouton-envoie');

// Créez un nouveau bouton "Ajouter une photo"
const addButton = document.createElement('button');
addButton.textContent = 'Ajouter une photo'; // Texte par défaut
addButton.classList.add('add-photo-button'); // Classe pour le bouton

// Ajoutez un écouteur d'événement au bouton
addButton.addEventListener('click', () => {
  console.log('Bouton Ajouter une photo cliqué');

  // Basculer l'affichage entre la galerie et le formulaire
  const galleryContainer = document.querySelector('.gallery-modal');
  const formContainer = document.querySelector('.add-photo-form');

  if (galleryContainer && formContainer) {
    if (galleryContainer.style.display === 'none') {
      // Si la galerie est masquée, l'afficher et masquer le formulaire
      galleryContainer.style.display = 'flex';
      formContainer.style.display = 'none';
      addButton.textContent = 'Ajouter une photo'; // Rétablir le texte par défaut
    } else {
      // Sinon, masquer la galerie et afficher le formulaire
      galleryContainer.style.display = 'none';
      formContainer.style.display = 'flex';
      addButton.textContent = 'Valider'; // Changer le texte en "Valider"
    }
  } else {
    console.error('Impossible de trouver le conteneur de la galerie ou le formulaire.');
  }
});

// Ajoutez le bouton dans la div "bouton-envoie"
buttonContainer.appendChild(addButton);

// Ajoutez les éléments au conteneur principal (modale)
const modalWrapper = document.querySelector('.modal-wrapper.js-modal-stop');
if (modalWrapper) {
  modalWrapper.appendChild(separator); // Ajoutez le séparateur
  modalWrapper.appendChild(buttonContainer); // Ajoutez la div contenant le bouton
} else {
  console.error('Impossible de trouver le modalWrapper.');
}

// Gérer le bouton dans le formulaire pour importer une image
const fileInput = document.getElementById('imageUpload');
const uploadLabel = document.querySelector('.upload-label');
const iconElement = uploadLabel.querySelector('.fa-image');
const buttonElement = uploadLabel.querySelector('button');
const textElement = uploadLabel.querySelector('p');

// Ajoutez un événement au bouton dans le formulaire pour déclencher l'importation
uploadLabel.addEventListener('click', (event) => {
  event.preventDefault(); // Empêche le comportement par défaut du bouton
  if (fileInput) {
    fileInput.click(); // Déclenche le clic sur l'input de fichier
  } else {
    console.error('Input de type fichier introuvable.');
  }
});

fileInput.addEventListener('change', function (event) {
  const file = event.target.files[0]; // Récupère le fichier sélectionné

  if (file) {
    // Vérifiez si le fichier est une image
    if (file.type.startsWith('image/')) {
      // Vérifiez la taille (4 Mo max)
      const maxFileSize = 4 * 1024 * 1024; // 4 Mo
      if (file.size > maxFileSize) {
        alert('La taille du fichier ne doit pas dépasser 4 Mo.');
        fileInput.value = ''; // Réinitialise le champ
        return;
      }

      // Affiche l'image dans la zone prévue et remplace l'icône, le bouton, et le texte
      const reader = new FileReader();
      reader.onload = function (e) {
        // Supprime ou cache l'icône, le bouton, et le texte
        if (iconElement) iconElement.style.display = 'none';
        if (buttonElement) buttonElement.style.display = 'none';
        if (textElement) textElement.style.display = 'none';

        // Supprime l'image existante (si elle existe)
        const existingImage = uploadLabel.querySelector('img');
        if (existingImage) {
          existingImage.src = e.target.result; // Remplace le src de l'image existante
        } else {
          // Ajoute une nouvelle image si aucune n'existe
          const newImage = document.createElement('img');
          newImage.src = e.target.result;
          newImage.alt = 'Aperçu';
          newImage.style.maxWidth = '100%'; 
          newImage.style.maxHeight = '200px'; 
          newImage.style.objectFit = 'contain'; 
  
          uploadLabel.appendChild(newImage);
        }
      };
      reader.readAsDataURL(file); 
    } else {
      alert('Veuillez sélectionner une image valide (jpg, png).');
      fileInput.value = ''; 
    }
  }
});

// Fonction pour remplir le sélecteur avec les catégories
async function populateCategories() {
  const selectElement = document.getElementById('photoCategory'); // Cible le <select>

  try {
    // Récupère les catégories depuis l'API
    const categories = await fetchCategories();

    if (categories.length > 0) {
      // Vide les options existantes (sauf la première "Choisissez une catégorie")
      while (selectElement.options.length > 1) {
        selectElement.remove(1);
      }

      // Ajoute les options pour chaque catégorie récupérée
      categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.id; // Utilise l'id de la catégorie comme valeur
        option.textContent = category.name; // Utilise le nom de la catégorie comme texte
        selectElement.appendChild(option); // Ajoute l'option au <select>
      });
    } else {
      console.warn('Aucune catégorie disponible.');
    }
  } catch (error) {
    console.error('Erreur lors de la population des catégories:', error);
  }
}

// Appelle la fonction pour remplir la liste des catégories au chargement de la page
document.addEventListener('DOMContentLoaded', populateCategories);
