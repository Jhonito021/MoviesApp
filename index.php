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
    default:
        require 'views/coponements/header.php';
        require 'views/pages/home.php';
        require 'views/coponements/footer.php';
        break;
}
