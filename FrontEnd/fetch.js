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
   
    renderGallery(works);
    return works;
  } catch (error) {
   
    return [];
  }
}


function renderGallery(works) {
  const galleryContainer = document.querySelector('.gallery');
  if (galleryContainer) {
      galleryContainer.innerHTML = '';
  }

  works.forEach((work) => {
    const workElement = document.createElement('figure');
    workElement.dataset.id = work.id;

    const imageElement = document.createElement('img');
    imageElement.src = work.imageUrl;
    imageElement.alt = work.title;

    const captionElement = document.createElement('figcaption');
    captionElement.textContent = work.title;

    workElement.append(imageElement, captionElement);
    galleryContainer.appendChild(workElement);
  });
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
   
    return categories;
  } catch (error) {
 
    return [];
  }
}


function createFilterButtons(works) {
  const portfolioSection = document.getElementById('portfolio');
  let filterContainer = document.getElementById('filter-container');
  

  if (Token) {
    if (filterContainer) {
      filterContainer.remove(); 
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

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async function(event) {
      event.preventDefault();
      
  });


  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (!emailInput || !passwordInput) return; 

  let emailError = document.getElementById('email-error');
  let passwordError = document.getElementById('password-error');

  if (!emailError) {
    emailError = document.createElement('span');
    emailError.id = 'email-error';
    emailError.style.color = 'red';
    emailInput.insertAdjacentElement('afterend', emailError);
  }
  
  if (!passwordError) {
    passwordError = document.createElement('span');
    passwordError.id = 'password-error';
    passwordError.style.color = 'red';
    passwordInput.insertAdjacentElement('afterend', passwordError);
  }

  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const result = await loginUser(email, password);
    resetErreurs();

    if (result.success) {
      localStorage.setItem('authToken', result.data.token);
      window.location.href = '/FrontEnd/index.html';
    } else {
      afficherErreur(emailInput, emailError, "Email ou mot de passe incorrect.");
      afficherErreur(passwordInput, passwordError, "Email ou mot de passe incorrect.");
    }
  });

  function afficherErreur(input, errorSpan, message) {
    errorSpan.textContent = message;
    input.style.border = '2px solid red';
  }

  function resetErreurs() {
    emailError.textContent = "";
    passwordError.textContent = "";
    emailInput.style.border = "1px solid #ccc";
    passwordInput.style.border = "1px solid #ccc";
  }

  emailInput.addEventListener('input', resetErreurs);
  passwordInput.addEventListener('input', resetErreurs);
});


document.addEventListener('DOMContentLoaded', function () {
  const iconLink = document.getElementById('icona');
  const adminBar = document.getElementById('admin-bar');
  const loginLink = document.querySelector('a.login');

  if (!iconLink || !loginLink) {
    return;
  }

  

  if (Token) {
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

const Token = localStorage.getItem('authToken'); 

async function fetchWorksPost() {
  try {
    const formData = new FormData();
    formData.append('title', 'Titre Exemple');
    formData.append('category', 1);
    formData.append('image', new Blob(['fake image data'], { type: 'image/png' }));

    
    if (!Token) {
      throw new Error('Token introuvable dans localStorage. Veuillez vous connecter.');
    }

    const response = await fetch(`${API_CONFIG.url}works`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Token}`,
      },
      body: FormData,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorText = await response.text();
   
    }
  } catch (error) {

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

  if (e && e.preventDefault) {
      e.preventDefault();
  }

  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('aria-modal');
  modal.removeEventListener('click', closeModal);

  const closeButton = modal.querySelector('.js-modal-close');
  if (closeButton) closeButton.removeEventListener('click', closeModal);

  const stopElement = modal.querySelector('.js-modal-stop');
  if (stopElement) stopElement.removeEventListener('click', stopPropagation);

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
    return;
  }

  let galleryContainer = modalWrapper.querySelector('.gallery-modal');
  if (!galleryContainer) {
    galleryContainer = document.createElement('div');
    galleryContainer.classList.add('gallery-modal');
    modalWrapper.appendChild(galleryContainer);
  } else {
    galleryContainer.innerHTML = ''; 
  }

  works.forEach((work) => {
    const workElement = document.createElement('div');
    workElement.classList.add('gallery-item');
    workElement.dataset.id = work.id;

    const imageElement = document.createElement('img');
    imageElement.src = work.imageUrl;
    imageElement.alt = work.title;
    imageElement.classList.add('modal-image');

    const iconElement = document.createElement('i');
    iconElement.classList.add('fa-solid', 'fa-trash-can', 'delete-icon');
    iconElement.title = 'Supprimer';

    iconElement.addEventListener('click', async () => {
      const confirmDelete = confirm(`Voulez-vous supprimer "${work.title}" ?`);
      if (confirmDelete) {
        const success = await deleteWork(work.id);
        if (success) {
          workElement.remove();
        }
      }
    });

    workElement.appendChild(imageElement);
    workElement.appendChild(iconElement);
    galleryContainer.appendChild(workElement);
  });
}



function toggleAddPhotoForm(show) {
  const formContainer = document.querySelector('.add-photo-form');
  const galleryContainer = document.querySelector('.gallery-modal');
  const retourButton = document.querySelector('.retour');
  const addPhotoButton = document.querySelector('.addImageButton');

  if (formContainer && galleryContainer && retourButton && addPhotoButton) {
    if (show) {
      formContainer.style.display = 'flex';
      galleryContainer.style.display = 'none';
      retourButton.style.display = 'inline-block';
      addPhotoButton.style.display = 'none';
    } else {
      formContainer.style.display = 'none';
      galleryContainer.style.display = 'flex';
      retourButton.style.display = 'none';
      addPhotoButton.style.display = 'block';
    }
  }
}

const button = document.querySelector('.addImageButton');
if (button) {
    button.addEventListener('click', () => {
        
    });
}

document.addEventListener('DOMContentLoaded', function () {
  function safeAddEventListener(selector, event, callback) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener(event, callback);
    } else {
    
    }
}


  
  safeAddEventListener('.addImageButton', 'click', () => toggleAddPhotoForm(true));
  safeAddEventListener('.retour', 'click', () => toggleAddPhotoForm(false));
  safeAddEventListener('.addProjectButton', 'click', (event) => {
    event.preventDefault();
    addProjectToAPI();
  });
});



/**
 * Fonction qui attend l'apparition d'un élément dans le DOM
 */
function waitForElement(selector) {
  return new Promise(resolve => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}




async function fetchAndRenderGalleryInModal() {
  try {
    const response = await fetch(`${API_CONFIG.url}works`);
    const works = await response.json();

  

    renderGalleryInModal(works);
   
  } catch (error) {
    
  }
}

fetchAndRenderGalleryInModal();

document.addEventListener('DOMContentLoaded', function () {
 
  const body = document.body;

  if (Token) {
    body.classList.add('user-logged-in'); 
  } else {
    body.classList.remove('user-logged-in'); 
  }
});

const buttonContainer = document.createElement('div');
buttonContainer.classList.add('bouton-envoie');

const fileInput = document.getElementById('imageUpload');
const uploadLabel = document.querySelector('.upload-label');
if (uploadLabel) {
    const previewImage = uploadLabel.querySelector('img');
    if (previewImage) {
        previewImage.remove();
    }
}

let iconElement = null;
let buttonElement = null;
let textElement = null;

if (uploadLabel) {
    iconElement = uploadLabel.querySelector('.fa-image');
    buttonElement = uploadLabel.querySelector('button');
    textElement = uploadLabel.querySelector('p');
}


if (uploadLabel) {
  uploadLabel.addEventListener('click', (event) => {
      event.preventDefault();
      if (fileInput) {
          fileInput.click();
      }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('imageUpload');

  if (!fileInput) return;

  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
      if (file.type.startsWith('image/')) {
        const maxFileSize = 4 * 1024 * 1024;
        if (file.size > maxFileSize) {
          alert('La taille du fichier ne doit pas dépasser 4 Mo.');
          fileInput.value = ''; 
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          const uploadLabel = document.querySelector('.upload-label');
          if (uploadLabel) {
            const iconElement = uploadLabel.querySelector('.fa-image');
            const buttonElement = uploadLabel.querySelector('.ajouter-photo');
            const textElement = uploadLabel.querySelector('p');

            if (iconElement) iconElement.style.display = 'none';
            if (buttonElement) buttonElement.style.display = 'none';
            if (textElement) textElement.style.display = 'none';

            const existingImage = uploadLabel.querySelector('img');
            if (existingImage) {
              existingImage.src = e.target.result;
            } else {
              const newImage = document.createElement('img');
              newImage.src = e.target.result;
              newImage.alt = 'Aperçu';
              newImage.style.maxWidth = '100%';
              newImage.style.maxHeight = '200px';
              newImage.style.objectFit = 'contain';
              uploadLabel.appendChild(newImage);
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Veuillez sélectionner une image valide (jpg, png).');
        fileInput.value = ''; 
      }
    }
  });
});






document.addEventListener('DOMContentLoaded', () => {
  const galleryContainer = document.querySelector('.gallery-modal');
  const addPhotoButton = document.querySelector('.addImageButton');
  const formContainer = document.querySelector('.add-photo-form');
  const retourButton = document.querySelector('.retour');

  if (addPhotoButton && galleryContainer && formContainer && retourButton) {
    addPhotoButton.addEventListener('click', () => {
      galleryContainer.style.display = 'none'; 
      addPhotoButton.style.display = 'none'; 
      retourButton.style.display = 'inline-block'; 
      formContainer.style.display = 'flex'; 
    });

    retourButton.addEventListener('click', () => {
      galleryContainer.style.display = 'flex';
      addPhotoButton.style.display = 'block'; 
      retourButton.style.display = 'none'; 
      formContainer.style.display = 'none'; 
    });
  }
});



async function populateCategories() {
  const selectElement = document.getElementById('photoCategory');
  try {
    const categories = await fetchCategories();

    if (categories.length > 0) {
      categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        selectElement.appendChild(option);
      });
    }
  } catch (error) {

  }
}


document.addEventListener('DOMContentLoaded', async () => {
  const works = await fetchWorks(); 
  populateCategories(); 
 
});

async function deleteWork(workId) {
  try {
      
      if (!Token) throw new Error('Utilisateur non authentifié.');

      const response = await fetch(`${API_CONFIG.url}works/${workId}`, {
          method: 'DELETE',
          headers: {
              Authorization: `Bearer ${Token}`,
              'Content-Type': 'application/json',
          },
      });

      if (response.ok) {
         

          setTimeout(async () => {
              const works = await fetchWorks();
              renderGallery(works);
              renderGalleryInModal(works);
          }, 300); 

          closeModal();
          return true;
      } else {
          
          return false;
      }
  } catch (error) {
     
      return false;
  }
}





async function addProjectToAPI() {
  const titleInput = document.getElementById('photoTitle');
  const imageInput = document.getElementById('imageUpload');
  const categorySelect = document.getElementById('photoCategory');

  const title = titleInput.value.trim();
  const imageFile = imageInput.files[0];
  const categoryId = categorySelect.value;

  if (!title || !imageFile || !categoryId) {
      alert('Veuillez remplir tous les champs avant de valider.');
      return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('image', imageFile);
  formData.append('category', categoryId);

  try {
     
      if (!Token) {
          alert('Vous devez être connecté pour ajouter un projet.');
          return;
      }

      const response = await fetch(`${API_CONFIG.url}works`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${Token}` },
          body: formData,
      });

      if (response.ok) {
      
        resetForm();
        closeModal(); 
    
        const works = await fetchWorks();
        renderGallery(works);
        renderGalleryInModal(works); 
    }else {
          
          alert('Erreur lors de l\'ajout du projet.');
      }
  } catch (error) {
     
      alert('Une erreur est survenue. Veuillez réessayer.');
  }
}


function updateValidateButtonState() {
  const titleInput = document.getElementById('photoTitle');
  const imageInput = document.getElementById('imageUpload');
  const categorySelect = document.getElementById('photoCategory');
  const validateButton = document.querySelector('.addProjectButton');


  if (!titleInput || !imageInput || !categorySelect || !validateButton) {
    return; 
  }

  const isFormValid =
      titleInput.value.trim() !== '' &&
      imageInput.files.length > 0 &&
      categorySelect.value.trim() !== '';

  if (isFormValid) {
      validateButton.classList.add('enabled'); 
      validateButton.disabled = false; 
  } else {
      validateButton.classList.remove('enabled'); 
      validateButton.disabled = true; 
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('photoTitle');
  const imageInput = document.getElementById('imageUpload');
  const categorySelect = document.getElementById('photoCategory');

  if (titleInput) {
    titleInput.addEventListener('input', updateValidateButtonState);
  } else {
 
  }

  if (imageInput) {
    imageInput.addEventListener('change', updateValidateButtonState);
  } else {
 
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', updateValidateButtonState);
  } else {
 
  }
 updateValidateButtonState();
});


document.addEventListener('DOMContentLoaded', function () {
  const contactLink = document.querySelector('.contact'); 
  const contactSection = document.getElementById('contact');

  if (contactLink && contactSection) {
      contactLink.addEventListener('click', function (event) {
          event.preventDefault(); 

          window.scrollTo({
              top: contactSection.offsetTop - 50,  
              behavior: 'smooth' 
          });
      });
  }
});

function resetForm() {
  const titleInput = document.getElementById('photoTitle');
  const categorySelect = document.getElementById('photoCategory');
  const imageInput = document.getElementById('imageUpload');
  const uploadLabel = document.querySelector('.upload-label');

  if (titleInput) titleInput.value = ''; 
  if (categorySelect) categorySelect.value = ''; 

  
  const previewImage = uploadLabel.querySelector('img');
  if (previewImage) {
      previewImage.remove();
  }

  if (imageInput) {
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.id = 'imageUpload';
    newInput.accept = 'image/png, image/jpeg';
    newInput.style.display = 'none';

    imageInput.replaceWith(newInput);

   
    newInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const existingImage = uploadLabel.querySelector('img');
                if (existingImage) {
                    existingImage.src = e.target.result;
                } else {
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
        }
    });
}

 
  const iconElement = uploadLabel.querySelector('.fa-image');
  const buttonElement = uploadLabel.querySelector('.ajouter-photo');
  const textElement = uploadLabel.querySelector('p');

  if (iconElement) iconElement.style.display = 'block';
  if (buttonElement) buttonElement.style.display = 'block';
  if (textElement) textElement.style.display = 'block';

  
}


document.addEventListener('DOMContentLoaded', function () {
  const titleModal = document.getElementById('titlemodal');
  const addPhotoButton = document.querySelector('.addImageButton');
  const retourButton = document.querySelector('.retour');
  const formSection = document.querySelector('.photo-form'); 
  const gallerySection = document.querySelector('.photo-gallery'); 
  const modalSeparator = document.getElementById('modalSeparator'); 

  if (addPhotoButton) {
      addPhotoButton.addEventListener('click', () => {
          if (titleModal) titleModal.textContent = 'Ajout photo';
          if (formSection) formSection.style.display = 'block';
          if (gallerySection) gallerySection.style.display = 'none';
          if (modalSeparator) modalSeparator.style.display = 'none'; 
      });
  }

  if (retourButton) {
      retourButton.addEventListener('click', () => {
          if (titleModal) titleModal.textContent = 'Galerie photo';
          if (formSection) formSection.style.display = 'none';
          if (gallerySection) gallerySection.style.display = 'block';
          if (modalSeparator) modalSeparator.style.display = 'block'; 
      });
  }
});
