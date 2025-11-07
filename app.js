const openCameraBtn = document.getElementById('openCamera');
const toggleCameraBtn2 = document.getElementById('toggleCamera2');
const closeCameraBtn = document.getElementById('closeCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const galleryScroll = document.getElementById('galleryScroll');
const clearGalleryBtn = document.getElementById('clearGallery');

let stream = null;
let currentFacingMode = 'environment'; //pa poner la trasera por defecto
let photos = [];

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/pwa-camara/sw.js')
            .then(reg => {
                console.log('Service Worker registrado:', reg);
            })
            .catch(err => {
                console.log('Error al registrar el SW:', err);
            });
    });
}

async function openCamera() {
    try {
        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode },
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        toggleCameraBtn2.disabled = false;
        closeCameraBtn.disabled = false;

        console.log('Cámara abierta correctamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

//cambiar entre cámara frontal y trasera
async function toggleCamera() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    closeCamera();
    await openCamera();
}

function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }
    //aqi es donde se ajustaaaaaa sonsa
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataURL = canvas.toDataURL('image/png');
    photos.push(imageDataURL);
    addPhotoToGallery(imageDataURL);

    console.log('Foto tomada. Total de fotos:', photos.length);
}

//pa agregar
function addPhotoToGallery(imageDataURL) {
    const emptyMessage = galleryScroll.querySelector('.empty-gallery');
    if (emptyMessage) emptyMessage.remove();

    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = imageDataURL;
    img.alt = 'Foto capturada';

    img.addEventListener('click', () => {
        downloadPhoto(imageDataURL);
    });

    galleryItem.appendChild(img);
    galleryScroll.appendChild(galleryItem);

    galleryScroll.scrollLeft = galleryScroll.scrollWidth;
}

//pa descargar
function downloadPhoto(imageDataURL) {
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = `foto-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//pa limpiar
function clearGallery() {
    if (photos.length === 0) {
        alert('No hay fotos para limpiar');
        return;
    }

    if (confirm('¿Seguro que quieres borrar todas las fotos?')) {
        photos = [];
        galleryScroll.innerHTML = '<div class="empty-gallery">No hay fotos aún</div>';
        console.log('Galería limpiada');
    }
}

//pa cerrars
function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;

        cameraContainer.style.display = 'none';
        openCameraBtn.textContent = 'Abrir Cámara';
        openCameraBtn.disabled = false;
        toggleCameraBtn2.disabled = true;
        closeCameraBtn.disabled = true;

        console.log('Cámara cerrada');
    }
}

openCameraBtn.addEventListener('click', openCamera);
toggleCameraBtn2.addEventListener('click', toggleCamera);
closeCameraBtn.addEventListener('click', closeCamera);
takePhotoBtn.addEventListener('click', takePhoto);
clearGalleryBtn.addEventListener('click', clearGallery);

window.addEventListener('beforeunload', closeCamera);