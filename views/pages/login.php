<link rel="stylesheet" href="../assets/css/style.css">
<body class="login-page">
    <div class="container-fluid">
        <div class="row min-vh-100">
            <!-- Côté gauche - Image/Illustration -->
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary">
                <div class="text-center text-white">
                    <i class="fas fa-calendar-alt fa-6x mb-4"></i>
                    <h1 class="display-4 fw-bold mb-3">Agenda Personnel</h1>
                    <p class="lead">Gérez vos événements et tâches avec facilité</p>
                    <div class="mt-5">
                        <div class="row text-center">
                            <div class="col-4">
                                <i class="fas fa-tasks fa-2x mb-2"></i>
                                <p>Gestion des tâches</p>
                            </div>
                            <div class="col-4">
                                <i class="fas fa-bell fa-2x mb-2"></i>
                                <p>Rappels intelligents</p>
                            </div>
                            <div class="col-4">
                                <i class="fas fa-mobile-alt fa-2x mb-2"></i>
                                <p>Responsive design</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Côté droit - Formulaire de connexion -->
            <div class="col-lg-6 d-flex align-items-center justify-content-center">
                <div class="w-100 max-w-md">
                    <div class="text-center mb-5">
                        <h2 class="h3 mb-3">Connexion</h2>
                        <p class="text-muted">Connectez-vous à votre compte</p>
                    </div>

                    <!-- Messages d'erreur/succès -->
                    <div id="alert-container"></div>

                    <!-- Formulaire de connexion -->
                    <form id="loginForm" class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="username" class="form-label">Nom d'utilisateur</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-user"></i>
                                </span>
                                <input type="text" class="form-control" id="username" name="username" required>
                                <div class="invalid-feedback">
                                    Veuillez saisir votre nom d'utilisateur.
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label">Mot de passe</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-lock"></i>
                                </span>
                                <input type="password" class="form-control" id="password" name="password" required>
                                <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <div class="invalid-feedback">
                                    Veuillez saisir votre mot de passe.
                                </div>
                            </div>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg" id="loginBtn">
                                <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
                                Se connecter
                            </button>
                        </div>
                    </form>

                    <div class="text-center mt-4">
                        <p class="mb-0">
                            Pas encore de compte ? 
                            <a href="register.php" class="text-decoration-none">Créer un compte</a>
                        </p>
                    </div>

                    <!-- Informations de connexion admin -->
                    <div class="mt-5 p-3 bg-light rounded">
                        <h6 class="text-muted mb-2">
                            <i class="fas fa-info-circle me-2"></i>
                            Accès administrateur
                        </h6>
                        <small class="text-muted">
                            <strong>Utilisateur:</strong> admin<br>
                            <strong>Mot de passe:</strong> admin123
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!--script-->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="../../assets/js/login.js"></script>
</body>
</html> 