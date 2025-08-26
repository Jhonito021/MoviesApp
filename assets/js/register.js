// Gestion de la page d'inscription
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des animations GSAP
    gsap.from('.register-page .col-lg-6:last-child', {
        duration: 1,
        x: 100,
        opacity: 0,
        ease: 'power2.out'
    });

    gsap.from('.register-page .col-lg-6:first-child', {
        duration: 1,
        x: -100,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.2
    });

    // Gestion du toggle du mot de passe
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const alertContainer = document.getElementById('alert-container');

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validation du formulaire
            if (!registerForm.checkValidity()) {
                e.stopPropagation();
                registerForm.classList.add('was-validated');
                return;
            }

            // Validation des mots de passe
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) {
                showAlert('danger', 'Les mots de passe ne correspondent pas');
                gsap.to(confirmPasswordInput, {
                    duration: 0.1,
                    x: -10,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 3
                });
                return;
            }

            // Récupération des données
            const formData = new FormData(registerForm);
            const userData = {
                action: 'register',
                username: formData.get('username'),
                email: formData.get('email'),
                password: password,
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name')
            };

            // Affichage du loading
            showLoading(registerBtn, true);

            // Envoi de la requête
            fetch('../../controllers/auth_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                showLoading(registerBtn, false);
                
                if (data.success) {
                    showAlert('success', data.message);
                    
                    // Animation de succès
                    gsap.to(registerForm, {
                        duration: 0.5,
                        scale: 0.95,
                        opacity: 0.8,
                        ease: 'power2.out',
                        onComplete: () => {
                            // Redirection vers la page de connexion
                            setTimeout(() => {
                                window.location.href = 'login.php';
                            }, 2000);
                        }
                    });
                } else {
                    showAlert('danger', data.message);
                    
                    // Animation d'erreur
                    gsap.to(registerForm, {
                        duration: 0.1,
                        x: -10,
                        ease: 'power2.out',
                        yoyo: true,
                        repeat: 3
                    });
                }
            })
            .catch(error => {
                showLoading(registerBtn, false);
                showAlert('danger', 'Erreur lors de l\'inscription. Veuillez réessayer.');
                console.error('Error:', error);
            });
        });
    }

    // Validation en temps réel des mots de passe
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;

            if (confirmPassword.length > 0) {
                if (password === confirmPassword) {
                    this.setCustomValidity('');
                    gsap.to(this, {
                        duration: 0.3,
                        borderColor: 'var(--success-color)',
                        ease: 'power2.out'
                    });
                } else {
                    this.setCustomValidity('Les mots de passe ne correspondent pas');
                    gsap.to(this, {
                        duration: 0.3,
                        borderColor: 'var(--danger-color)',
                        ease: 'power2.out'
                    });
                }
            }
        });

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const confirmPassword = confirmPasswordInput.value;

            if (confirmPassword.length > 0) {
                if (password === confirmPassword) {
                    confirmPasswordInput.setCustomValidity('');
                    gsap.to(confirmPasswordInput, {
                        duration: 0.3,
                        borderColor: 'var(--success-color)',
                        ease: 'power2.out'
                    });
                } else {
                    confirmPasswordInput.setCustomValidity('Les mots de passe ne correspondent pas');
                    gsap.to(confirmPasswordInput, {
                        duration: 0.3,
                        borderColor: 'var(--danger-color)',
                        ease: 'power2.out'
                    });
                }
            }
        });
    }

    // Validation de la force du mot de passe
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            // Mise à jour visuelle de la force du mot de passe
            updatePasswordStrengthIndicator(strength);
        });
    }

    // Fonction pour calculer la force du mot de passe
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(strength, 5);
    }

    // Fonction pour mettre à jour l'indicateur de force du mot de passe
    function updatePasswordStrengthIndicator(strength) {
        // Créer ou mettre à jour l'indicateur de force
        let indicator = document.getElementById('passwordStrength');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'passwordStrength';
            indicator.className = 'mt-2';
            passwordInput.parentNode.appendChild(indicator);
        }

        const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon'];
        const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
        
        indicator.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="flex-grow-1 me-2">
                    <div class="progress" style="height: 4px;">
                        <div class="progress-bar" style="width: ${(strength / 5) * 100}%; background-color: ${strengthColors[strength - 1] || '#6c757d'};"></div>
                    </div>
                </div>
                <small class="text-muted">${strengthLabels[strength - 1] || 'Aucun'}</small>
            </div>
        `;
    }

    // Fonction pour afficher/masquer le loading
    function showLoading(button, show) {
        const spinner = button.querySelector('.spinner-border');
        
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

    // Gestion de la validation en temps réel
    const formInputs = registerForm.querySelectorAll('input[required]');
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

    // Animation des étapes du formulaire
    const formSteps = registerForm.querySelectorAll('.row, .mb-3');
    gsap.from(formSteps, {
        duration: 0.5,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.5
    });
}); 