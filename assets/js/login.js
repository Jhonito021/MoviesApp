// Gestion de la page de connexion
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des animations GSAP
    gsap.from('.login-page .col-lg-6:last-child', {
        duration: 1,
        x: 100,
        opacity: 0,
        ease: 'power2.out'
    });

    gsap.from('.login-page .col-lg-6:first-child', {
        duration: 1,
        x: -100,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.2
    });

    // Gestion du toggle du mot de passe
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const alertContainer = document.getElementById('alert-container');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validation du formulaire
            if (!loginForm.checkValidity()) {
                e.stopPropagation();
                loginForm.classList.add('was-validated');
                return;
            }

            // Récupération des données
            const formData = new FormData(loginForm);
            const username = formData.get('username');
            const password = formData.get('password');

            // Affichage du loading
            showLoading(loginBtn, true);

            // Envoi de la requête
            fetch('../../controllers/auth_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    username: username,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                showLoading(loginBtn, false);
                
                if (data.success) {
                    showAlert('success', data.message);
                    
                    // Animation de succès
                    gsap.to(loginForm, {
                        duration: 0.5,
                        scale: 0.95,
                        opacity: 0.8,
                        ease: 'power2.out',
                        onComplete: () => {
                            // Redirection selon le rôle
                            if (data.user && data.user.role === 'admin') {
                                window.location.href = '../../admin/dashboard.php';
                            } else {
                                window.location.href = 'dashboard.php';
                            }
                        }
                    });
                } else {
                    showAlert('danger', data.message);
                    
                    // Animation d'erreur
                    gsap.to(loginForm, {
                        duration: 0.1,
                        x: -10,
                        ease: 'power2.out',
                        yoyo: true,
                        repeat: 3
                    });
                }
            })
            .catch(error => {
                showLoading(loginBtn, false);
                showAlert('danger', 'Erreur de connexion. Veuillez réessayer.');
                console.error('Error:', error);
            });
        });
    }

    // Fonction pour afficher/masquer le loading
    function showLoading(button, show) {
        const spinner = button.querySelector('.spinner-border');
        const buttonText = button.querySelector('span:not(.spinner-border)');
        
        if (show) {
            spinner.classList.remove('d-none');
            button.disabled = true;
            button.classList.add('loading');
        } else {
            spinner.classList.add('d-none');
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    // Fonction pour afficher les alertes
    function showAlert(type, message) {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.innerHTML = alertHtml;
        
        // Animation d'apparition
        const alert = alertContainer.querySelector('.alert');
        gsap.from(alert, {
            duration: 0.5,
            y: -50,
            opacity: 0,
            ease: 'power2.out'
        });

        // Auto-dismiss après 5 secondes pour les succès
        if (type === 'success') {
            setTimeout(() => {
                if (alert && alert.parentNode) {
                    gsap.to(alert, {
                        duration: 0.3,
                        opacity: 0,
                        y: -20,
                        ease: 'power2.out',
                        onComplete: () => {
                            alert.remove();
                        }
                    });
                }
            }, 5000);
        }
    }

    // Gestion des animations au focus des champs
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1.02,
                ease: 'power2.out'
            });
        });

        input.addEventListener('blur', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1,
                ease: 'power2.out'
            });
        });
    });

    // Animation des icônes au hover
    const icons = document.querySelectorAll('.fas');
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            gsap.to(this, {
                duration: 0.2,
                scale: 1.1,
                ease: 'power2.out'
            });
        });

        icon.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.2,
                scale: 1,
                ease: 'power2.out'
            });
        });
    });

    // Gestion de l'auto-complétion pour les informations admin
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            if (this.value.toLowerCase() === 'admin') {
                // Animation pour attirer l'attention sur les informations admin
                const adminInfo = document.querySelector('.bg-light');
                if (adminInfo) {
                    gsap.to(adminInfo, {
                        duration: 0.5,
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        ease: 'power2.out',
                        yoyo: true,
                        repeat: 1
                    });
                }
            }
        });
    }

    // Gestion de la validation en temps réel
    const formInputs = loginForm.querySelectorAll('input[required]');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                gsap.to(this, {
                    duration: 0.3,
                    borderColor: 'var(--success-color)',
                    ease: 'power2.out'
                });
            } else {
                gsap.to(this, {
                    duration: 0.3,
                    borderColor: 'var(--danger-color)',
                    ease: 'power2.out'
                });
            }
        });
    });

    // Animation de la page au chargement
    gsap.from('body', {
        duration: 1,
        opacity: 0,
        ease: 'power2.out'
    });

    // Gestion des erreurs de réseau
    window.addEventListener('online', function() {
        showAlert('success', 'Connexion internet rétablie');
    });

    window.addEventListener('offline', function() {
        showAlert('warning', 'Connexion internet perdue');
    });
}); 