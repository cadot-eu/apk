// Variables globales
let heartRate = 72;
let heartRateHistory = [];
let chartContext;
let isConnected = true;
let animationId;

// Éléments DOM
const bpmValueElement = document.getElementById('bpmValue');
const statusTextElement = document.getElementById('statusText');
const measurementTimeElement = document.getElementById('measurementTime');
const currentTimeElement = document.getElementById('currentTime');
const heartBeatElement = document.getElementById('heartBeat');
const chartCanvas = document.getElementById('heartRateChart');
const detailsModal = document.getElementById('detailsModal');
const closeModalButton = document.getElementById('closeModal');
const topButton = document.getElementById('topButton');
const bottomButton = document.getElementById('bottomButton');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startHeartRateSimulation();
    startTimeUpdate();
    initializeChart();
});

// Initialisation de l'application
function initializeApp() {
    console.log('Galaxy Watch Heart Rate Monitor - Initialisation...');
    
    // Générer l'historique initial des pulsations
    generateInitialHeartRateHistory();
    
    // Mettre à jour l'affichage initial
    updateDisplay();
    
    // Animation d'accueil
    showWelcomeAnimation();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Clic sur l'affichage principal pour ouvrir les détails
    document.querySelector('.bpm-display').addEventListener('click', openDetailsModal);
    
    // Fermeture de la modal
    closeModalButton.addEventListener('click', closeDetailsModal);
    detailsModal.addEventListener('click', function(e) {
        if (e.target === detailsModal) {
            closeDetailsModal();
        }
    });
    
    // Boutons latéraux
    topButton.addEventListener('click', function() {
        vibrate();
        cycleDisplayMode();
    });
    
    bottomButton.addEventListener('click', function() {
        vibrate();
        toggleMeasurement();
    });
    
    // Gestes tactiles
    let startY = 0;
    document.querySelector('.main-display').addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
    });
    
    document.querySelector('.main-display').addEventListener('touchend', function(e) {
        const endY = e.changedTouches[0].clientY;
        const deltaY = startY - endY;
        
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                // Swipe vers le haut
                showNextScreen();
            } else {
                // Swipe vers le bas
                showPreviousScreen();
            }
        }
    });
    
    // Gestion du redimensionnement
    window.addEventListener('resize', resizeChart);
}

// Simulation des données de fréquence cardiaque
function startHeartRateSimulation() {
    function updateHeartRate() {
        // Simulation réaliste des variations de fréquence cardiaque
        const baseHeartRate = 70;
        const timeOfDay = new Date().getHours();
        
        // Variation selon l'heure de la journée
        let timeVariation = 0;
        if (timeOfDay >= 22 || timeOfDay <= 6) {
            timeVariation = -10; // Nuit - fréquence plus basse
        } else if (timeOfDay >= 7 && timeOfDay <= 10) {
            timeVariation = 5; // Matin - léger réveil
        } else if (timeOfDay >= 18 && timeOfDay <= 21) {
            timeVariation = 3; // Soirée - légère activation
        }
        
        // Variation aléatoire naturelle
        const randomVariation = (Math.random() - 0.5) * 10;
        
        // Calcul de la nouvelle fréquence
        let newHeartRate = baseHeartRate + timeVariation + randomVariation;
        
        // Lissage pour éviter les variations trop brutales
        newHeartRate = heartRate + (newHeartRate - heartRate) * 0.1;
        heartRate = Math.round(Math.max(50, Math.min(120, newHeartRate)));
        
        // Ajout à l'historique
        heartRateHistory.push({
            time: Date.now(),
            value: heartRate
        });
        
        // Garder seulement les 100 dernières mesures
        if (heartRateHistory.length > 100) {
            heartRateHistory.shift();
        }
        
        // Mise à jour de l'affichage
        updateDisplay();
        updateChart();
        
        // Prochaine mise à jour
        setTimeout(updateHeartRate, 2000 + Math.random() * 3000);
    }
    
    updateHeartRate();
}

// Génération de l'historique initial
function generateInitialHeartRateHistory() {
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
        const time = now - (i * 60000); // Dernières 60 minutes
        const baseValue = 70 + Math.sin(i / 10) * 5 + (Math.random() - 0.5) * 8;
        heartRateHistory.push({
            time: time,
            value: Math.round(Math.max(55, Math.min(95, baseValue)))
        });
    }
}

// Mise à jour de l'affichage principal
function updateDisplay() {
    // Mise à jour de la valeur BPM
    bpmValueElement.textContent = heartRate;
    
    // Animation du cœur synchronisée avec le BPM
    animateHeartBeat();
    
    // Mise à jour du statut
    updateStatus();
    
    // Mise à jour du temps de mesure
    measurementTimeElement.textContent = 'Temps réel';
}

// Animation du battement de cœur
function animateHeartBeat() {
    const bpm = heartRate;
    const interval = 60000 / bpm; // Intervalle en ms
    
    heartBeatElement.style.animation = 'none';
    heartBeatElement.offsetHeight; // Trigger reflow
    heartBeatElement.style.animation = `heartbeat ${interval}ms ease-in-out infinite`;
}

// Mise à jour du statut
function updateStatus() {
    let status = '';
    let statusColor = '';
    
    if (heartRate < 60) {
        status = 'Bradycardie';
        statusColor = '#3498db';
    } else if (heartRate <= 100) {
        status = 'Fréquence normale';
        statusColor = '#4cd137';
    } else if (heartRate <= 120) {
        status = 'Fréquence élevée';
        statusColor = '#f39c12';
    } else {
        status = 'Tachycardie';
        statusColor = '#e74c3c';
    }
    
    statusTextElement.textContent = status;
    statusTextElement.style.color = statusColor;
}

// Mise à jour de l'heure
function startTimeUpdate() {
    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}`;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Initialisation du graphique
function initializeChart() {
    chartContext = chartCanvas.getContext('2d');
    chartCanvas.width = 280;
    chartCanvas.height = 100;
    updateChart();
}

// Mise à jour du graphique
function updateChart() {
    if (!chartContext) return;
    
    const ctx = chartContext;
    const width = chartCanvas.width;
    const height = chartCanvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    if (heartRateHistory.length < 2) return;
    
    // Configuration du graphique
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Calcul des valeurs min/max
    const values = heartRateHistory.map(d => d.value);
    const minValue = Math.min(...values) - 5;
    const maxValue = Math.max(...values) + 5;
    const valueRange = maxValue - minValue;
    
    // Ligne de base
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Grille
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 4; i++) {
        const y = padding + (chartHeight * i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Courbe des pulsations
    if (heartRateHistory.length > 1) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 71, 87, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 71, 87, 0.1)');
        
        // Ligne principale
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        heartRateHistory.forEach((point, index) => {
            const x = padding + (index / (heartRateHistory.length - 1)) * chartWidth;
            const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Zone sous la courbe
        ctx.fillStyle = gradient;
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fill();
        
        // Point actuel
        const lastPoint = heartRateHistory[heartRateHistory.length - 1];
        const lastX = padding + chartWidth;
        const lastY = height - padding - ((lastPoint.value - minValue) / valueRange) * chartHeight;
        
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Halo autour du point actuel
        ctx.fillStyle = 'rgba(255, 71, 87, 0.3)';
        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Redimensionnement du graphique
function resizeChart() {
    const container = document.querySelector('.chart-container');
    const rect = container.getBoundingClientRect();
    chartCanvas.width = Math.min(280, rect.width - 20);
    updateChart();
}

// Ouverture de la modal détails
function openDetailsModal() {
    vibrate();
    
    // Mise à jour des données dans la modal
    document.getElementById('currentBpm').textContent = `${heartRate} BPM`;
    document.getElementById('maxBpm').textContent = `${Math.max(...heartRateHistory.map(d => d.value))} BPM`;
    
    let zone = 'Zone de repos';
    if (heartRate > 100) zone = 'Zone aérobie';
    if (heartRate > 120) zone = 'Zone anaérobie';
    document.getElementById('hrZone').textContent = zone;
    
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fermeture de la modal
function closeDetailsModal() {
    detailsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Vibration tactile simulée
function vibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // Animation visuelle de feedback
    document.querySelector('.watch-face').style.transform = 'scale(0.98)';
    setTimeout(() => {
        document.querySelector('.watch-face').style.transform = 'scale(1)';
    }, 100);
}

// Cycle des modes d'affichage
function cycleDisplayMode() {
    // Simulation du changement de mode
    const modes = ['Temps réel', 'Moyenne 5min', 'Tendance'];
    const currentMode = measurementTimeElement.textContent;
    const currentIndex = modes.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    
    measurementTimeElement.textContent = modes[nextIndex];
    
    // Animation de transition
    bpmValueElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        bpmValueElement.style.transform = 'scale(1)';
    }, 200);
}

// Basculer la mesure
function toggleMeasurement() {
    isConnected = !isConnected;
    
    if (isConnected) {
        statusTextElement.textContent = 'Connexion...';
        statusTextElement.style.color = '#f39c12';
        document.querySelector('.main-display').classList.add('connecting');
        
        setTimeout(() => {
            document.querySelector('.main-display').classList.remove('connecting');
            updateStatus();
        }, 2000);
    } else {
        statusTextElement.textContent = 'Déconnecté';
        statusTextElement.style.color = '#666';
        bpmValueElement.textContent = '--';
    }
}

// Écrans suivant/précédent (simulation)
function showNextScreen() {
    vibrate();
    // Animation de transition
    document.querySelector('.main-display').style.transform = 'translateY(-20px)';
    document.querySelector('.main-display').style.opacity = '0.7';
    
    setTimeout(() => {
        document.querySelector('.main-display').style.transform = 'translateY(0)';
        document.querySelector('.main-display').style.opacity = '1';
    }, 300);
}

function showPreviousScreen() {
    vibrate();
    // Animation de transition
    document.querySelector('.main-display').style.transform = 'translateY(20px)';
    document.querySelector('.main-display').style.opacity = '0.7';
    
    setTimeout(() => {
        document.querySelector('.main-display').style.transform = 'translateY(0)';
        document.querySelector('.main-display').style.opacity = '1';
    }, 300);
}

// Animation d'accueil
function showWelcomeAnimation() {
    const watchFace = document.querySelector('.watch-face');
    const mainDisplay = document.querySelector('.main-display');
    
    watchFace.style.transform = 'scale(0)';
    watchFace.style.opacity = '0';
    
    setTimeout(() => {
        watchFace.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        watchFace.style.transform = 'scale(1)';
        watchFace.style.opacity = '1';
        
        setTimeout(() => {
            mainDisplay.style.animation = 'fadeIn 0.5s ease-in-out';
        }, 400);
    }, 100);
}

// Gestion des erreurs
window.addEventListener('error', function(e) {
    console.error('Erreur dans l\'application:', e.error);
    statusTextElement.textContent = 'Erreur capteur';
    statusTextElement.style.color = '#e74c3c';
});

// Performance et optimisation
function requestAnimationFrame(callback) {
    return window.requestAnimationFrame || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame || 
           window.oRequestAnimationFrame || 
           window.msRequestAnimationFrame ||
           function(callback) {
               window.setTimeout(callback, 1000 / 60);
           };
}

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});

console.log('Galaxy Watch Heart Rate Monitor - Prêt!');
