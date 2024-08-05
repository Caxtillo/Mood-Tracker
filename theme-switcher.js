// Función para cambiar el tema
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDarkTheme);
    updateThemeToggleText();
}

// Función para actualizar el texto del botón de cambio de tema
function updateThemeToggleText() {
    const themeToggle = document.getElementById('theme-toggle');
    if (document.body.classList.contains('dark-theme')) {
        themeToggle.textContent = '🌑';
    } else {
        themeToggle.textContent = '🌗';
    }
}

// Función para aplicar el tema guardado
function applyTheme() {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    updateThemeToggleText();
}

// Agregar el botón de cambio de tema al DOM
function addThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.addEventListener('click', toggleTheme);
    document.body.appendChild(themeToggle);
    updateThemeToggleText();
}

// Inicializar el tema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    addThemeToggle();
    applyTheme();
});