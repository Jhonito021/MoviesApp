/**
 * Calendar.js - Gestion du calendrier avec FullCalendar
 */

let calendar;
let currentEvent = null;

// Initialisation du calendrier
function initializeCalendar() {
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
        firstDay: 1, // Lundi
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        allDaySlot: true,
        slotDuration: '00:30:00',
        slotLabelInterval: '01:00:00',
        
        // Événements
        events: '/api/events.php?action=getEvents',
        
        // Sélection d'une date/heure
        select: function(info) {
            openEventModal(info.start, info.end, info.allDay);
        },
        
        // Clic sur un événement
        eventClick: function(info) {
            openEventModal(null, null, null, info.event);
        },
        
        // Modification d'un événement (drag & drop)
        eventDrop: function(info) {
            updateEventDates(info.event);
        },
        
        // Modification de la durée d'un événement (resize)
        eventResize: function(info) {
            updateEventDates(info.event);
        },
        
        // Rendu personnalisé des événements
        eventDidMount: function(info) {
            // Ajouter des tooltips
            if (info.event.extendedProps.location) {
                info.el.title = `Lieu: ${info.event.extendedProps.location}`;
            }
            
            // Ajouter des classes CSS selon le statut
            if (info.event.extendedProps.status) {
                info.el.classList.add(`event-status-${info.event.extendedProps.status}`);
            }
        },
        
        // Chargement des événements
        loading: function(isLoading) {
            const loadingEl = document.getElementById('calendarLoading');
            if (loadingEl) {
                loadingEl.style.display = isLoading ? 'block' : 'none';
            }
        },
        
        // Erreur de chargement
        eventSourceFailure: function(error) {
            console.error('Erreur lors du chargement des événements:', error);
            showNotification('Erreur lors du chargement des événements', 'error');
        }
    });

    calendar.render();
    
    // Charger les statistiques et événements à venir
    loadStats();
    loadUpcomingEvents();
}

// Ouvrir le modal d'événement
function openEventModal(startDate = null, endDate = null, allDay = false, event = null) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('eventModalLabel');
    const form = document.getElementById('eventForm');
    const deleteBtn = document.getElementById('deleteEventBtn');
    
    if (!modal || !form) return;

    // Réinitialiser le formulaire
    form.reset();
    
    if (event) {
        // Mode édition
        currentEvent = event;
        modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Modifier l\'événement';
        
        // Remplir le formulaire avec les données de l'événement
        document.getElementById('eventId').value = event.id;
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.extendedProps.description || '';
        document.getElementById('eventStartDate').value = formatDateTimeForInput(event.start);
        document.getElementById('eventEndDate').value = formatDateTimeForInput(event.end);
        document.getElementById('eventColor').value = event.backgroundColor || '#3788d8';
        document.getElementById('eventLocation').value = event.extendedProps.location || '';
        document.getElementById('eventReminder').value = event.extendedProps.reminder_minutes || '0';
        document.getElementById('eventAllDay').checked = event.allDay;
        
        // Afficher le bouton de suppression
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
        }
    } else {
        // Mode création
        currentEvent = null;
        modalTitle.innerHTML = '<i class="fas fa-calendar-plus me-2"></i>Nouvel événement';
        
        // Pré-remplir avec les dates sélectionnées
        if (startDate) {
            document.getElementById('eventStartDate').value = formatDateTimeForInput(startDate);
        }
        if (endDate) {
            document.getElementById('eventEndDate').value = formatDateTimeForInput(endDate);
        }
        if (allDay !== null) {
            document.getElementById('eventAllDay').checked = allDay;
        }
        
        // Masquer le bouton de suppression
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
    }
    
    // Ouvrir le modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Sauvegarder un événement
async function saveEvent(event) {
    const formData = new FormData(event.target);
    const isEdit = formData.get('id') !== '';
    
    try {
        const response = await fetch('/api/events.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
            modal.hide();
            
            // Recharger le calendrier
            calendar.refetchEvents();
            
            // Recharger les statistiques
            loadStats();
            loadUpcomingEvents();
            
            showNotification(
                isEdit ? 'Événement modifié avec succès' : 'Événement créé avec succès', 
                'success'
            );
        } else {
            showNotification(data.error || 'Erreur lors de la sauvegarde', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de communication avec le serveur', 'error');
    }
}

// Supprimer un événement
async function deleteEvent() {
    if (!currentEvent) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/events.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=delete&id=${currentEvent.id}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
            modal.hide();
            
            // Supprimer l'événement du calendrier
            currentEvent.remove();
            
            // Recharger les statistiques
            loadStats();
            loadUpcomingEvents();
            
            showNotification('Événement supprimé avec succès', 'success');
        } else {
            showNotification(data.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de communication avec le serveur', 'error');
    }
}

// Mettre à jour les dates d'un événement (drag & drop, resize)
async function updateEventDates(event) {
    try {
        const response = await fetch('/api/events.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=update&id=${event.id}&start_date=${formatDateTimeForAPI(event.start)}&end_date=${formatDateTimeForAPI(event.end)}&is_all_day=${event.allDay ? 1 : 0}`
        });
        
        const data = await response.json();
        
        if (!data.success) {
            // Revenir à la position précédente en cas d'erreur
            calendar.refetchEvents();
            showNotification(data.error || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        calendar.refetchEvents();
        showNotification('Erreur de communication avec le serveur', 'error');
    }
}

// Ouvrir le modal de tâche
function openTaskModal() {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    
    if (!modal || !form) return;

    // Réinitialiser le formulaire
    form.reset();
    
    // Pré-remplir avec la date d'aujourd'hui
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    document.getElementById('taskDueDate').value = today.toISOString().slice(0, 16);
    
    // Ouvrir le modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Sauvegarder une tâche
async function saveTask(event) {
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/api/tasks.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
            modal.hide();
            
            // Recharger les statistiques
            loadStats();
            
            showNotification('Tâche créée avec succès', 'success');
        } else {
            showNotification(data.error || 'Erreur lors de la sauvegarde', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de communication avec le serveur', 'error');
    }
}

// Charger les statistiques
async function loadStats() {
    try {
        const response = await fetch('/api/events.php?action=getStats');
        const data = await response.json();
        
        if (data.success) {
            updateStatsUI(data.stats);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Mettre à jour l'interface des statistiques
function updateStatsUI(stats) {
    const statsContainer = document.getElementById('quickStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="row text-center">
            <div class="col-6">
                <div class="stat-item">
                    <i class="fas fa-calendar-check text-success"></i>
                    <div class="stat-number">${stats.total || 0}</div>
                    <div class="stat-label">Total</div>
                </div>
            </div>
            <div class="col-6">
                <div class="stat-item">
                    <i class="fas fa-clock text-warning"></i>
                    <div class="stat-number">${stats.upcoming || 0}</div>
                    <div class="stat-label">À venir</div>
                </div>
            </div>
        </div>
    `;
}

// Charger les événements à venir
async function loadUpcomingEvents() {
    try {
        const response = await fetch('/api/events.php?action=getUpcomingEvents');
        const data = await response.json();
        
        if (data.success) {
            updateUpcomingEventsUI(data.events);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des événements à venir:', error);
    }
}

// Mettre à jour l'interface des événements à venir
function updateUpcomingEventsUI(events) {
    const container = document.getElementById('upcomingEventsList');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<div class="text-muted small">Aucun événement à venir</div>';
        return;
    }
    
    let html = '';
    events.forEach(event => {
        const date = new Date(event.start_date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="upcoming-event-item">
                <div class="event-dot" style="background-color: ${event.color}"></div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${formattedDate}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Formater une date pour l'input datetime-local
function formatDateTimeForInput(date) {
    if (!date) return '';
    
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

// Formater une date pour l'API
function formatDateTimeForAPI(date) {
    if (!date) return '';
    return date.toISOString();
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le calendrier
    initializeCalendar();
    
    // Gestionnaires d'événements pour les formulaires
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', saveEvent);
    }
    
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', saveTask);
    }
    
    // Gestionnaire pour le bouton de suppression d'événement
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    if (deleteEventBtn) {
        deleteEventBtn.addEventListener('click', deleteEvent);
    }
    
    // Gestionnaire pour le changement de vue du calendrier
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            calendar.changeView(view);
        });
    });
    
    // Gestionnaire pour le filtre par couleur
    const colorFilter = document.getElementById('colorFilter');
    if (colorFilter) {
        colorFilter.addEventListener('change', function() {
            const color = this.value;
            if (color === 'all') {
                calendar.getEvents().forEach(event => {
                    event.setProp('display', 'auto');
                });
            } else {
                calendar.getEvents().forEach(event => {
                    if (event.backgroundColor === color) {
                        event.setProp('display', 'auto');
                    } else {
                        event.setProp('display', 'none');
                    }
                });
            }
        });
    }
});

// Fonctions utilitaires globales
window.openEventModal = openEventModal;
window.openTaskModal = openTaskModal;
window.saveEvent = saveEvent;
window.saveTask = saveTask;
window.deleteEvent = deleteEvent;
window.loadStats = loadStats;
window.loadUpcomingEvents = loadUpcomingEvents; 