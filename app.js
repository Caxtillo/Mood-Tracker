// Comprobamos si el navegador soporta las notificaciones
if ("Notification" in window) {
    Notification.requestPermission();
}
generateCharts();
let currentDate = new Date();
let selectedDate = new Date();

// Función para guardar el estado de ánimo
function saveMood(date, mood, energyLevel, stressLevel, sleepQuality, gratitude, note) {
    let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    const dateString = date.toISOString().split('T')[0];  // Usamos toISOString() para asegurar el formato correcto
    moodData[dateString] = { mood, energyLevel, stressLevel, sleepQuality, gratitude, note };
    localStorage.setItem('moodData', JSON.stringify(moodData));
    updateCalendar();
    generateCharts();
}

// Función para eliminar una entrada
function deleteMoodEntry(date) {
    let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    if (moodData[date]) {
        delete moodData[date];
        localStorage.setItem('moodData', JSON.stringify(moodData));
        updateCalendar();
        closeMoodDetails();
    }
}

// Función para actualizar el calendario
function updateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    document.getElementById('current-month').textContent = 
        new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);
    
    // Añadir días vacíos para alinear el primer día del mes
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'empty');
        calendar.appendChild(emptyDay);
    }
    
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateString = date.toISOString().split('T')[0];
        const dayMood = moodData[dateString];
        
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = i;
        dayElement.dataset.date = dateString;
        
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        if (date.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        if (dayMood) {
            dayElement.classList.add('has-mood');
            dayElement.title = dayMood.note || '';
            switch (dayMood.mood) {
                case 'feliz': dayElement.innerHTML += ' 😊'; break;
                case 'triste': dayElement.innerHTML += ' 😢'; break;
                case 'enojado': dayElement.innerHTML += ' 😠'; break;
                case 'neutral': dayElement.innerHTML += ' 😐'; break;
                case 'emocionado': dayElement.innerHTML += ' 🤩'; break;
                case 'ansioso': dayElement.innerHTML += ' 😰'; break;
            }
        }
        
        dayElement.addEventListener('click', selectDate);
        calendar.appendChild(dayElement);
    }
    
}



// Función para seleccionar una fecha
function selectDate(event) {
    const prevSelected = document.querySelector('.calendar-day.selected');
    if (prevSelected) {
        prevSelected.classList.remove('selected');
    }
    event.target.classList.add('selected');
    
    // Corregimos la creación de la fecha seleccionada
    const [year, month, day] = event.target.dataset.date.split('-');
    selectedDate = new Date(year, month - 1, day);  // Restamos 1 al mes porque en JavaScript los meses van de 0 a 11
    
    showMoodDetails(selectedDate);
}

// Función para mostrar detalles del día
function showMoodDetails(date) {
    const dateString = date.toISOString().split('T')[0];
    const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    const dayMood = moodData[dateString];
    
    const modal = document.getElementById('mood-details');
    const content = document.getElementById('mood-details-content');
    
    if (dayMood) {
        content.innerHTML = `
            <p><strong>Fecha:</strong> ${dateString}</p>
            <p><strong>Estado de ánimo:</strong> ${dayMood.mood}</p>
            <p><strong>Nivel de energía:</strong> ${dayMood.energyLevel}/10</p>
            <p><strong>Nivel de estrés:</strong> ${dayMood.stressLevel}/10</p>
            <p><strong>Calidad del sueño:</strong> ${dayMood.sleepQuality}</p>
            <p><strong>Gratitud:</strong> ${dayMood.gratitude}</p>
            <p><strong>Notas:</strong> ${dayMood.note || 'Sin notas'}</p>
            <button id="delete-entry">Eliminar entrada</button>
        `;
        document.getElementById('delete-entry').addEventListener('click', function() {
            deleteMoodEntry(dateString);
        });
    } else {
        content.innerHTML = `
            <p>No hay entrada para esta fecha. ¿Quieres añadir una?</p>
            <button id="add-entry">Añadir entrada</button>
        `;
        document.getElementById('add-entry').addEventListener('click', function() {
            closeMoodDetails();
            document.getElementById('mood-form').scrollIntoView({ behavior: 'smooth' });
        });
    }
    modal.style.display = 'block';
}

// Función para cerrar el modal de detalles
function closeMoodDetails() {
    document.getElementById('mood-details').style.display = 'none';
}

// Evento para manejar el envío del formulario
document.getElementById('mood-input').addEventListener('submit', function(e) {
    e.preventDefault();
    const mood = document.getElementById('mood-select').value;
    const energyLevel = document.getElementById('energy-level').value;
    const stressLevel = document.getElementById('stress-level').value;
    const sleepQuality = document.getElementById('sleep-quality').value;
    const gratitude = document.getElementById('gratitude').value;
    const note = document.getElementById('mood-note').value;
    saveMood(selectedDate, mood, energyLevel, stressLevel, sleepQuality, gratitude, note);
    this.reset();
    // Reiniciar los valores de los rangos a su punto medio
    document.getElementById('energy-level').value = 5;
    document.getElementById('stress-level').value = 5;
});

// Función para mostrar notificación diaria
function showNotification() {
    if (Notification.permission === "granted") {
        new Notification("Daily Mood Tracker", {
            body: "¡No olvides registrar tu estado de ánimo hoy!",
        });
    }
}

// Configurar notificación diaria
const now = new Date();
let millisTillTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;
if (millisTillTen < 0) {
    millisTillTen += 86400000; // Si ya pasó, configurar para mañana
}
setTimeout(function() {
    showNotification();
    setInterval(showNotification, 86400000);
}, millisTillTen);

// Navegación entre meses
document.getElementById('prev-month').addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

document.getElementById('next-month').addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Cerrar modal
document.querySelector('.close').addEventListener('click', closeMoodDetails);

// Inicializar el calendario
updateCalendar();

// Service Worker para soporte offline
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(function(registration) {
        console.log('Service Worker registrado con éxito:', registration.scope);
    })
    .catch(function(error) {
        console.log('Registro de Service Worker fallido:', error);
    });
}

// Initialize Firebase (replace with your Firebase config)
const firebaseConfig = {
    // Your Firebase configuration object
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

function initializeFirebaseMessaging() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            messaging.getToken().then((currentToken) => {
                if (currentToken) {
                    // Send this token to your server to associate it with the user
                    sendTokenToServer(currentToken);
                }
            });
        }
    });
}

function sendTokenToServer(token) {
    // Implement this function to send the token to your server
    console.log('Sending token to server:', token);
}

messaging.onMessage((payload) => {
    console.log('Message received:', payload);
    // Display the notification
    new Notification(payload.notification.title, {
        body: payload.notification.body
    });
});

function generateCharts() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    const dates = Object.keys(moodData);
    
    if (dates.length === 0) {
        console.log('No hay datos de estado de ánimo para generar gráficos');
        return;
    }

    // Conteo de estados de ánimo
    const moodCounts = {
        'feliz': 0, 'triste': 0, 'enojado': 0, 'neutral': 0, 'emocionado': 0, 'ansioso': 0
    };
    dates.forEach(date => {
        const mood = moodData[date].mood;
        if (mood in moodCounts) {
            moodCounts[mood]++;
        }
    });

    // Datos de energía, estrés y calidad de sueño
    const energyLevels = dates.map(date => parseInt(moodData[date].energyLevel));
    const stressLevels = dates.map(date => parseInt(moodData[date].stressLevel));
    const sleepQuality = dates.map(date => {
        switch(moodData[date].sleepQuality) {
            case 'Excelente': return 10;
            case 'Buena': return 7.5;
            case 'Regular': return 5;
            case 'Mala': return 2.5;
            case 'Pésima': return 0;
            default: return 5; // valor por defecto si no hay dato
        }
    });

    const moodCtx = document.getElementById('mood-chart');
    const energyStressCtx = document.getElementById('energy-stress-chart');

    if (!moodCtx || !energyStressCtx) {
        console.error('No se encontraron los elementos del canvas para los gráficos');
        return;
    }

    // Gráfico de estados de ánimo
    new Chart(moodCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(moodCounts),
            datasets: [{
                label: 'Frecuencia de estados de ánimo',
                data: Object.values(moodCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de días'
                    }
                }
            }
        }
    });

    // Gráfico de energía, estrés y calidad de sueño
    new Chart(energyStressCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Nivel de energía',
                data: energyLevels,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }, {
                label: 'Nivel de estrés',
                data: stressLevels,
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: false
            }, {
                label: 'Calidad del sueño',
                data: sleepQuality,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Nivel (0-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                }
            }
        }
    });
}

// Llamar a generateCharts cuando se carga la página y después de guardar un nuevo estado de ánimo
document.addEventListener('DOMContentLoaded', generateCharts);

// Modificar la función saveMood para llamar a generateCharts
function saveMood(date, mood, energyLevel, stressLevel, sleepQuality, gratitude, note) {
    let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    const dateString = date.toISOString().split('T')[0];
    moodData[dateString] = { mood, energyLevel, stressLevel, sleepQuality, gratitude, note };
    localStorage.setItem('moodData', JSON.stringify(moodData));
    updateCalendar();
    generateCharts();  // Llamar a generateCharts después de guardar
}

// Call this function when the page loads
initializeFirebaseMessaging();

selectedDate = new Date();
updateCalendar();