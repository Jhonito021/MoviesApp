/**
 * Agenda Personnel - Application JavaScript Principal
 * Gère les fonctionnalités communes de l'application
 */

// Configuration globale de l'application
const APP_CONFIG = {
    apiBaseUrl: '/api',
    refreshInterval: 30000, // 30 secondes
    themeKey: 'agenda_theme',
    language: 'fr'
};

// Classe principale de l'application
class AgendaApp {
    constructor() {
        this.isInitialized = false;
        this.currentTheme = 'light';
        this.notifications = [];
        this.init();
    }

    // Initialisation de l'application
    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.loadUserPreferences();
        this.setupMobileFeatures();
        this.setupNotifications();
        this.setupKeyboardShortcuts();
        this.setupModalManagement();
        
        this.isInitialized = true;
        console.log('AgendaApp initialisée');
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Gestionnaire pour les formulaires
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Gestionnaire pour les liens de suppression
        document.addEventListener('click', this.handleDeleteLinks.bind(this));
        
        // Gestionnaire pour les changements de thème
        document.addEventListener('click', this.handleThemeToggle.bind(this));
        
        // Gestionnaire pour les notifications
        document.addEventListener('click', this.handleNotificationClicks.bind(this));
        
        // Gestionnaire pour la résolution d'écran
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        
        // Gestionnaire pour la visibilité de la page
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // Chargement des préférences utilisateur
    loadUserPreferences() {
        // Charger le thème depuis localStorage
        const savedTheme = localStorage.getItem(APP_CONFIG.themeKey);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.setTheme(savedTheme);
        }
        
        // Charger d'autres préférences si nécessaire
        this.loadNotifications();
    }

    // Configuration des fonctionnalités mobiles
    setupMobileFeatures() {
        if (window.innerWidth <= 768) {
            this.enableMobileFeatures();
        }
    }

    // Activation des fonctionnalités mobiles
    enableMobileFeatures() {
        // Fermer automatiquement les dropdowns en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            const dropdowns = document.querySelectorAll('.dropdown-menu.show');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target) && !e.target.closest('.dropdown-toggle')) {
                    dropdown.classList.remove('show');
                }
            });
        });

        // Gestion des gestes tactiles
        this.setupTouchGestures();
    }

    // Configuration des gestes tactiles
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Swipe horizontal pour naviguer
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe gauche
                    this.handleSwipeLeft();
                } else {
                    // Swipe droite
                    this.handleSwipeRight();
                }
            }
        });
    }

    // Gestion des swipes
    handleSwipeLeft() {
        // Navigation vers la page suivante
        const nextLink = document.querySelector('[data-next-page]');
        if (nextLink) {
            window.location.href = nextLink.href;
        }
    }

    handleSwipeRight() {
        // Navigation vers la page précédente
        const prevLink = document.querySelector('[data-prev-page]');
        if (prevLink) {
            window.location.href = prevLink.href;
        }
    }

    // Configuration des notifications
    setupNotifications() {
        // Charger les notifications initiales
        this.loadNotifications();
        
        // Configurer le polling des notifications
        setInterval(() => {
            if (!document.hidden) {
                this.loadNotifications();
            }
        }, APP_CONFIG.refreshInterval);
    }

    // Chargement des notifications
    async loadNotifications() {
        try {
            const response = await fetch(`${APP_CONFIG.apiBaseUrl}/notifications.php?action=get`);
            const data = await response.json();
            
            if (data.success) {
                this.notifications = data.notifications || [];
                this.updateNotificationUI();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
        }
    }

    // Mise à jour de l'interface des notifications
    updateNotificationUI() {
        const countElement = document.getElementById('notificationCount');
        const listElement = document.getElementById('notificationsList');
        
        if (!countElement || !listElement) return;

        const unreadCount = this.notifications.filter(n => !n.is_read).length;
        
        // Mettre à jour le compteur
        if (unreadCount > 0) {
            countElement.textContent = unreadCount;
            countElement.style.display = 'inline';
        } else {
            countElement.style.display = 'none';
        }

        // Mettre à jour la liste
        listElement.innerHTML = '';
        
        if (this.notifications.length === 0) {
            listElement.innerHTML = '<li><div class="dropdown-item text-muted">Aucune notification</div></li>';
        } else {
            this.notifications.forEach(notification => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <a class="dropdown-item ${notification.is_read ? '' : 'fw-bold'}" href="#" data-notification-id="${notification.id}">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-${this.getNotificationIcon(notification.type)} me-2 text-primary"></i>
                            <div>
                                <div class="small">${notification.title}</div>
                                <div class="text-muted small">${this.formatDate(notification.created_at)}</div>
                            </div>
                        </div>
                    </a>
                `;
                listElement.appendChild(item);
            });
        }
    }

    // Obtenir l'icône pour le type de notification
    getNotificationIcon(type) {
        const icons = {
            'event': 'calendar',
            'task': 'tasks',
            'system': 'cog',
            'reminder': 'bell'
        };
        return icons[type] || 'info-circle';
    }

    // Configuration des raccourcis clavier
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorer si on est dans un champ de saisie
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            // Raccourcis globaux
            switch (e.key) {
                case 'Escape':
                    this.handleEscapeKey();
                    break;
                case 'n':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openNewEventModal();
                    }
                    break;
                case 't':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openNewTaskModal();
                    }
                    break;
                case 'h':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        window.location.href = '/index.php';
                    }
                    break;
            }
        });
    }

    // Gestion de la touche Escape
    handleEscapeKey() {
        // Fermer les modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });

        // Fermer les dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-menu.show');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    // Configuration de la gestion des modals
    setupModalManagement() {
        // Gestionnaire pour les modals
        document.addEventListener('show.bs.modal', (e) => {
            this.handleModalShow(e);
        });

        document.addEventListener('hidden.bs.modal', (e) => {
            this.handleModalHide(e);
        });
    }

    // Gestion de l'ouverture des modals
    handleModalShow(e) {
        const modal = e.target;
        
        // Focus sur le premier champ
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        // Désactiver le scroll du body
        document.body.style.overflow = 'hidden';
    }

    // Gestion de la fermeture des modals
    handleModalHide(e) {
        // Réactiver le scroll du body
        document.body.style.overflow = '';
        
        // Réinitialiser les formulaires
        const form = e.target.querySelector('form');
        if (form) {
            form.reset();
        }
    }

    // Gestion de la soumission des formulaires
    handleFormSubmit(e) {
        const form = e.target;
        
        // Validation basique
        if (!this.validateForm(form)) {
            e.preventDefault();
            this.showNotification('Veuillez remplir tous les champs requis', 'warning');
            return;
        }

        // Ajouter un indicateur de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enregistrement...';
        }
    }

    // Gestion des liens de suppression
    handleDeleteLinks(e) {
        const link = e.target.closest('[data-confirm]');
        if (link) {
            const message = link.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
            }
        }
    }

    // Gestion du changement de thème
    handleThemeToggle(e) {
        if (e.target.closest('[onclick*="toggleTheme"]')) {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    // Gestion des clics sur les notifications
    handleNotificationClicks(e) {
        const notificationLink = e.target.closest('[data-notification-id]');
        if (notificationLink) {
            e.preventDefault();
            const notificationId = notificationLink.getAttribute('data-notification-id');
            this.markNotificationAsRead(notificationId);
        }
    }

    // Gestion du redimensionnement
    handleResize() {
        // Reconfigurer les fonctionnalités mobiles si nécessaire
        if (window.innerWidth <= 768) {
            this.enableMobileFeatures();
        }
    }

    // Gestion du changement de visibilité
    handleVisibilityChange() {
        if (!document.hidden) {
            // Recharger les données quand la page redevient visible
            this.loadNotifications();
        }
    }

    // Changer le thème
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Sauvegarder en base de données
        this.saveThemePreference(newTheme);
    }

    // Définir le thème
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
        localStorage.setItem(APP_CONFIG.themeKey, theme);
        
        // Mettre à jour le texte du bouton
        const themeText = document.getElementById('themeText');
        if (themeText) {
            themeText.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
        }
    }

    // Sauvegarder la préférence de thème
    async saveThemePreference(theme) {
        try {
            const response = await fetch(`${APP_CONFIG.apiBaseUrl}/auth.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=changeTheme&theme=${theme}`
            });
            
            const data = await response.json();
            if (data.success) {
                this.showNotification('Thème changé avec succès', 'success');
            } else {
                this.showNotification('Erreur lors du changement de thème', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du thème:', error);
            this.showNotification('Erreur lors du changement de thème', 'error');
        }
    }

    // Marquer une notification comme lue
    async markNotificationAsRead(id) {
        try {
            const response = await fetch(`${APP_CONFIG.apiBaseUrl}/notifications.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=markRead&id=${id}`
            });
            
            const data = await response.json();
            if (data.success) {
                this.loadNotifications();
            }
        } catch (error) {
            console.error('Erreur lors du marquage de la notification:', error);
        }
    }

    // Ouvrir le modal de nouvel événement
    openNewEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    // Ouvrir le modal de nouvelle tâche
    openNewTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    // Validation de formulaire
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        return isValid;
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const alertClass = type === 'error' ? 'alert-danger' : 
                          type === 'success' ? 'alert-success' : 
                          type === 'warning' ? 'alert-warning' : 'alert-info';
        
        const icon = type === 'error' ? 'exclamation-triangle' : 
                     type === 'success' ? 'check-circle' : 
                     type === 'warning' ? 'exclamation-circle' : 'info-circle';
        
        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas fa-${icon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Insérer au début du main
        const main = document.querySelector('main');
        if (main) {
            main.insertAdjacentHTML('afterbegin', alertHtml);
        }
        
        // Auto-dismiss après 5 secondes
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            });
        }, 5000);
    }

    // Formater une date
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Fonction de debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Fonction de throttle
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialisation de l'application au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Créer l'instance de l'application
    window.agendaApp = new AgendaApp();
    
    // Mettre à jour la date et l'heure
    function updateDateTime() {
        const now = new Date();
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            dateTimeElement.textContent = now.toLocaleString('fr-FR');
        }
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Initialiser le lazy loading
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
});

// Gestionnaire d'erreurs global
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
    if (window.agendaApp) {
        window.agendaApp.showNotification('Une erreur est survenue', 'error');
    }
});

// Gestionnaire pour les requêtes AJAX échouées
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesse rejetée:', e.reason);
    if (window.agendaApp) {
        window.agendaApp.showNotification('Erreur de communication avec le serveur', 'error');
    }
}); 