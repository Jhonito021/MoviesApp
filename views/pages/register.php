<?php
    require 'config/db.php';

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $last_name = $_POST ['last_name'];
        $first_name = $_POST ['first_name'];
        $username = $_POST ['username'];
        $email = $_POST ['email'];
        $password = $_POST ['password'];
        $confirm_password = $_POST ['confirm_password'];
        
    }
?>  
<body class="register-page">
    <div class="container-fluid">
        <div class="row min-vh-100">
            <!-- Côté gauche - Image/Illustration -->
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary">
                <div class="text-center text-white">
                    <i class="fas fa-user-plus fa-6x mb-4"></i>
                    <h1 class="display-4 fw-bold mb-3">Rejoignez-nous</h1>
                    <p class="lead">Créez votre compte et commencez à organiser votre vie</p>
                    <div class="mt-5">
                        <div class="row text-center">
                            <div class="col-4">
                                <i class="fas fa-shield-alt fa-2x mb-2"></i>
                                <p>Sécurisé</p>
                            </div>
                            <div class="col-4">
                                <i class="fas fa-sync fa-2x mb-2"></i>
                                <p>Synchronisé</p>
                            </div>
                            <div class="col-4">
                                <i class="fas fa-clock fa-2x mb-2"></i>
                                <p>24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Côté droit - Formulaire d'inscription -->
            <div class="col-lg-6 d-flex align-items-center justify-content-center">
                <div class="w-100 max-w-md">
                    <div class="text-center mb-5">
                        <h2 class="h3 mb-3">Créer un compte</h2>
                        <p class="text-muted">Rejoignez notre communauté</p>
                    </div>

                    <!-- Messages d'erreur/succès -->
                    <div id="alert-container"></div>

                    <!-- Formulaire d'inscription -->
                    <form id="registerForm" class="needs-validation" novalidate>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="first_name" class="form-label">Prénom</label>
                                <input type="text" class="form-control" id="first_name" name="first_name" required>
                                <div class="invalid-feedback">
                                    Veuillez saisir votre prénom.
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="last_name" class="form-label">Nom</label>
                                <input type="text" class="form-control" id="last_name" name="last_name" required>
                                <div class="invalid-feedback">
                                    Veuillez saisir votre nom.
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="username" class="form-label">Nom d'utilisateur</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-user"></i>
                                </span>
                                <input type="text" class="form-control" id="username" name="username" required>
                                <div class="invalid-feedback">
                                    Veuillez saisir un nom d'utilisateur.
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label">Adresse email</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-envelope"></i>
                                </span>
                                <input type="email" class="form-control" id="email" name="email" required>
                                <div class="invalid-feedback">
                                    Veuillez saisir une adresse email valide.
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="password" class="form-label">Mot de passe</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-lock"></i>
                                </span>
                                <input type="password" class="form-control" id="password" name="password" required minlength="6">
                                <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <div class="invalid-feedback">
                                    Le mot de passe doit contenir au moins 6 caractères.
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="confirm_password" class="form-label">Confirmer le mot de passe</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-lock"></i>
                                </span>
                                <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                                <div class="invalid-feedback">
                                    Les mots de passe ne correspondent pas.
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="terms" required>
                                <label class="form-check-label" for="terms">
                                    J'accepte les <a href="#" class="text-decoration-none">conditions d'utilisation</a>
                                </label>
                                <div class="invalid-feedback">
                                    Vous devez accepter les conditions d'utilisation.
                                </div>
                            </div>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg" id="registerBtn">
                                <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
                                Créer mon compte
                            </button>
                        </div>
                    </form>

                    <div class="text-center mt-4">
                        <p class="mb-0">
                            Déjà un compte ? 
                            <a href="login.php" class="text-decoration-none">Se connecter</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
