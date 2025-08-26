// Gestion du tableau de bord
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let calendar;
    let currentEvent = null;
    let currentTheme = localStorage.getItem('theme') || 'light';

    // Initialisation
    initDashboard();
    initCalendar();
    loadUserInfo();
    loadUpcomingEvents();
    loadEventStats();

    // Initialisation du tableau de bord
    function initDashboard() {
        // Appliquer le thème sauvegardé
        applyTheme(currentTheme);
        
        // Gestion de la navigation
        initNavigation();
        
        // Gestion des thèmes
        initThemeToggle();
        
        // Gestion des modals
        initModals();
        
        // Gestion de la déconnexion
        initLogout();
    }

    // Initialisation du calendrier FullCalendar
    function initCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'fr',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            buttonText: {
                today: 'Aujourd\'hui',
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour',
                list: 'Liste'
            },
            height: 'auto',
            editable: true,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            weekends: true,
            events: function(info, successCallback, failureCallback) {
                // Charger les événements depuis l'API
                fetch(`../../controllers/event_api.php?action=get_events_by_period&start_date=${info.startStr}&end_date=${info.endStr}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            successCallback(data.events);
                        } else {
                            failureCallback(data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Erreur lors du chargement des événements:', error);
                        failureCallback('Erreur de chargement');
                    });
            },
            select: function(info) {
                // Ouvrir le modal pour créer un nouvel événement
                openEventModal(info.startStr, info.endStr);
            },
            eventClick: function(info) {
                // Ouvrir le modal pour éditer l'événement
                openEventModal(null, null, info.event);
            },
            eventDrop: function(info) {
                // Mettre à jour l'événement après glisser-déposer
                updateEventDates(info.event);
            },
            eventResize: function(info) {
                // Mettre à jour l'événement après redimensionnement
                updateEventDates(info.event);
            }
        });

        calendar.render();

        // Gestion des boutons de navigation
        document.getElementById('todayBtn').addEventListener('click', function() {
            calendar.today();
        });

        document.getElementById('prevBtn').addEventListener('click', function() {
            calendar.prev();
        });

        document.getElementById('nextBtn').addEventListener('click', function() {
            calendar.next();
        });
    }

    // Initialisation de la navigation
    function initNavigation() {
        const navLinks = document.querySelectorAll('[data-view]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const view = this.getAttribute('data-view');
                showView(view);
                
                // Mettre à jour l'état actif
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Afficher une vue spécifique
    function showView(viewName) {
        const views = document.querySelectorAll('.view-content');
        views.forEach(view => {
            view.classList.add('d-none');
        });

        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.classList.remove('d-none');
            
            // Animation d'apparition
            gsap.from(targetView, {
                duration: 0.5,
                opacity: 0,
                y: 20,
                ease: 'power2.out'
            });

            // Charger les données spécifiques à la vue
            if (viewName === 'stats') {
                loadEventStats();
                loadOverdueEvents();
            }
        }
    }

    // Initialisation du toggle de thème
    function initThemeToggle() {
        const themeLinks = document.querySelectorAll('[data-theme]');
        themeLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const theme = this.getAttribute('data-theme');
                changeTheme(theme);
            });
        });
    }

    // Changer de thème
    function changeTheme(theme) {
        applyTheme(theme);
        saveTheme(theme);
        
        // Mettre à jour le thème côté serveur
        fetch('../../controllers/auth_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update_theme',
                theme: theme
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('success', 'Thème mis à jour');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du thème:', error);
        });
    }

    // Appliquer le thème
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        currentTheme = theme;
    }

    // Sauvegarder le thème
    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    // Initialisation des modals
    function initModals() {
        // Modal événement
        const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
        
        // Gestion du formulaire d'événement
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', function(e) {
                e.preventDefault();
                createEvent();
            });
        }

        // Gestion des boutons du modal
        document.getElementById('saveEventBtn').addEventListener('click', function() {
            if (currentEvent) {
                updateEvent();
            } else {
                createEvent();
            }
        });

        document.getElementById('deleteEventBtn').addEventListener('click', function() {
            if (currentEvent) {
                deleteEvent();
            }
        });

        document.getElementById('completeEventBtn').addEventListener('click', function() {
            if (currentEvent) {
                completeEvent();
            }
        });

        // Modal profil
        const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
        
        // Modal mot de passe
        const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                changePassword();
            });
        }
    }

    // Initialisation de la déconnexion
    function initLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    fetch('../../controllers/auth_api.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'logout'
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = 'login.php';
                        }
                    })
                    .catch(error => {
                        console.error('Erreur lors de la déconnexion:', error);
                        window.location.href = 'login.php';
                    });
                }
            });
        }
    }

    // Charger les informations utilisateur
    function loadUserInfo() {
        fetch('../../controllers/auth_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'get_current_user'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                document.getElementById('userName').textContent = user.first_name + ' ' + user.last_name;
                
                // Remplir le modal profil
                document.getElementById('profileFirstName').value = user.first_name;
                document.getElementById('profileLastName').value = user.last_name;
                document.getElementById('profileUsername').value = user.username;
                document.getElementById('profileEmail').value = user.email;
                document.getElementById('profileRole').value = user.role === 'admin' ? 'Administrateur' : 'Utilisateur';
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des informations utilisateur:', error);
        });
    }

    // Charger les événements à venir
    function loadUpcomingEvents() {
        fetch('../../controllers/event_api.php?action=get_upcoming_events&days=7')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayUpcomingEvents(data.events);
                }
            })
            .catch(error => {
                console.error('Erreur lors du chargement des événements à venir:', error);
            });
    }

    // Afficher les événements à venir
    function displayUpcomingEvents(events) {
        const container = document.getElementById('upcomingEvents');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Aucun événement à venir</p>';
            return;
        }

        const eventsHtml = events.map(event => `
            <div class="event-item" data-event-id="${event.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${event.title}</h6>
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            ${formatDate(event.start_date)}
                        </small>
                    </div>
                    <span class="badge" style="background-color: ${event.color}">${event.status}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = eventsHtml;
    }

    // Charger les statistiques des événements
    function loadEventStats() {
        fetch('../../controllers/event_api.php?action=get_stats')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayEventStats(data.stats);
                }
            })
            .catch(error => {
                console.error('Erreur lors du chargement des statistiques:', error);
            });
    }

    // Afficher les statistiques des événements
    function displayEventStats(stats) {
        document.getElementById('totalEvents').textContent = stats.total_events || 0;
        document.getElementById('completedEvents').textContent = stats.completed_events || 0;
        document.getElementById('pendingEvents').textContent = stats.pending_events || 0;
        document.getElementById('overdueEvents').textContent = stats.overdue_events || 0;
    }

    // Charger les événements en retard
    function loadOverdueEvents() {
        fetch('../../controllers/event_api.php?action=get_overdue_events')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayOverdueEvents(data.events);
                }
            })
            .catch(error => {
                console.error('Erreur lors du chargement des événements en retard:', error);
            });
    }

    // Afficher les événements en retard
    function displayOverdueEvents(events) {
        const container = document.getElementById('overdueEventsList');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Aucun événement en retard</p>';
            return;
        }

        const eventsHtml = events.map(event => `
            <div class="event-item overdue" data-event-id="${event.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${event.title}</h6>
                        <small class="text-muted">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            En retard depuis ${formatDate(event.end_date)}
                        </small>
                    </div>
                    <button class="btn btn-sm btn-success" onclick="completeEvent(${event.id})">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = eventsHtml;
    }

    // Ouvrir le modal d'événement
    function openEventModal(startDate = null, endDate = null, event = null) {
        currentEvent = event;
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        
        if (event) {
            // Mode édition
            document.getElementById('eventModalTitle').textContent = 'Modifier l\'événement';
            document.getElementById('editEventId').value = event.id;
            document.getElementById('editEventTitle').value = event.title;
            document.getElementById('editEventDescription').value = event.extendedProps.description || '';
            document.getElementById('editEventStart').value = formatDateTimeForInput(event.start);
            document.getElementById('editEventEnd').value = formatDateTimeForInput(event.end);
            document.getElementById('editEventColor').value = event.backgroundColor;
            document.getElementById('editEventAllDay').checked = event.allDay;
            document.getElementById('editEventReminder').value = event.extendedProps.reminder_minutes || 15;
            
            // Afficher les boutons d'action
            document.getElementById('deleteEventBtn').style.display = 'inline-block';
            document.getElementById('completeEventBtn').style.display = 'inline-block';
        } else {
            // Mode création
            document.getElementById('eventModalTitle').textContent = 'Nouvel événement';
            document.getElementById('editEventId').value = '';
            document.getElementById('editEventTitle').value = '';
            document.getElementById('editEventDescription').value = '';
            document.getElementById('editEventStart').value = startDate ? formatDateTimeForInput(new Date(startDate)) : '';
            document.getElementById('editEventEnd').value = endDate ? formatDateTimeForInput(new Date(endDate)) : '';
            document.getElementById('editEventColor').value = '#3788d8';
            document.getElementById('editEventAllDay').checked = false;
            document.getElementById('editEventReminder').value = 15;
            
            // Masquer les boutons d'action
            document.getElementById('deleteEventBtn').style.display = 'none';
            document.getElementById('completeEventBtn').style.display = 'none';
        }
        
        modal.show();
    }

    // Créer un événement
    function createEvent() {
        const formData = getEventFormData();
        
        fetch('../../controllers/event_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create_event',
                ...formData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('success', 'Événement créé avec succès');
                calendar.refetchEvents();
                loadUpcomingEvents();
                bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
            } else {
                showNotification('danger', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la création de l\'événement:', error);
            showNotification('danger', 'Erreur lors de la création de l\'événement');
        });
    }

    // Mettre à jour un événement
    function updateEvent() {
        const formData = getEventFormData();
        formData.event_id = currentEvent.id;
        
        fetch('../../controllers/event_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update_event',
                ...formData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('success', 'Événement mis à jour avec succès');
                calendar.refetchEvents();
                loadUpcomingEvents();
                bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
            } else {
                showNotification('danger', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour de l\'événement:', error);
            showNotification('danger', 'Erreur lors de la mise à jour de l\'événement');
        });
    }

    // Supprimer un événement
    function deleteEvent() {
        if (!currentEvent) return;
        
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            fetch('../../controllers/event_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete_event',
                    event_id: currentEvent.id
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('success', 'Événement supprimé avec succès');
                    calendar.refetchEvents();
                    loadUpcomingEvents();
                    bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
                } else {
                    showNotification('danger', data.message);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la suppression de l\'événement:', error);
                showNotification('danger', 'Erreur lors de la suppression de l\'événement');
            });
        }
    }

    // Marquer un événement comme terminé
    function completeEvent(eventId = null) {
        const id = eventId || (currentEvent ? currentEvent.id : null);
        if (!id) return;
        
        fetch('../../controllers/event_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'complete_event',
                event_id: id
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('success', 'Événement marqué comme terminé');
                calendar.refetchEvents();
                loadUpcomingEvents();
                loadEventStats();
                if (currentEvent) {
                    bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
                }
            } else {
                showNotification('danger', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du statut:', error);
            showNotification('danger', 'Erreur lors de la mise à jour du statut');
        });
    }

    // Changer le mot de passe
    function changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        
        if (newPassword !== confirmPassword) {
            showNotification('danger', 'Les mots de passe ne correspondent pas');
            return;
        }
        
        fetch('../../controllers/auth_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'change_password',
                current_password: currentPassword,
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('success', 'Mot de passe modifié avec succès');
                bootstrap.Modal.getInstance(document.getElementById('passwordModal')).hide();
                document.getElementById('passwordForm').reset();
            } else {
                showNotification('danger', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors du changement de mot de passe:', error);
            showNotification('danger', 'Erreur lors du changement de mot de passe');
        });
    }

    // Récupérer les données du formulaire d'événement
    function getEventFormData() {
        return {
            title: document.getElementById('editEventTitle').value,
            description: document.getElementById('editEventDescription').value,
            start_date: document.getElementById('editEventStart').value,
            end_date: document.getElementById('editEventEnd').value,
            color: document.getElementById('editEventColor').value,
            is_all_day: document.getElementById('editEventAllDay').checked,
            reminder_minutes: parseInt(document.getElementById('editEventReminder').value)
        };
    }

    // Mettre à jour les dates d'un événement (glisser-déposer)
    function updateEventDates(event) {
        const eventData = {
            action: 'update_event',
            event_id: event.id,
            title: event.title,
            description: event.extendedProps.description || '',
            start_date: formatDateTimeForAPI(event.start),
            end_date: formatDateTimeForAPI(event.end),
            color: event.backgroundColor,
            is_all_day: event.allDay,
            reminder_minutes: event.extendedProps.reminder_minutes || 15
        };
        
        fetch('../../controllers/event_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('success', 'Événement mis à jour');
            } else {
                showNotification('danger', data.message);
                calendar.refetchEvents(); // Recharger pour annuler les changements
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour de l\'événement:', error);
            showNotification('danger', 'Erreur lors de la mise à jour');
            calendar.refetchEvents();
        });
    }

    // Afficher une notification
    function showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        gsap.from(notification, {
            duration: 0.3,
            x: 300,
            opacity: 0,
            ease: 'power2.out'
        });
        
        // Auto-dismiss après 5 secondes
        setTimeout(() => {
            gsap.to(notification, {
                duration: 0.3,
                x: 300,
                opacity: 0,
                ease: 'power2.out',
                onComplete: () => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }
            });
        }, 5000);
    }

    // Fonctions utilitaires
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDateTimeForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function formatDateTimeForAPI(date) {
        return date.toISOString().slice(0, 19);
    }

    // Rendre les fonctions globales pour les boutons inline
    window.completeEvent = completeEvent;
}); 