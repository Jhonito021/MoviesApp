<?php
    $pdo = new PDO('mysql:host=localhost;dbname=movie_app;charset=utf8', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>
