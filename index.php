<?php
if (isset($_GET['page']) && !empty(trim($_GET['page']))) {
    $page = trim($_GET['page']);
} else {
    $page = 'home';
}


switch ($page) {
    case 'film':
        require 'controllers/FilmControllers.php';
        
        break;

    case 'connexion':
        require 'views/coponements/header.php';
        include 'views/pages/login.php';
        require 'views/coponements/footer.php';
        break;
    case 'inscription':
        require 'views/coponements/header.php';
        include 'views/pages/register.php';
        require 'views/coponements/footer.php';
        break;
    default:
        require 'views/coponements/header.php';
        include 'views/pages/home.php';
        require 'views/coponements/footer.php';
        break;
}
