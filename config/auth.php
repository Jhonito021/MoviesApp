<?php
    require_once 'db.php';
    session_start();

    if (!isset($_SESSION['utilisateur_id'])) {
        header('Location: index.php?page=connexion');
        exit;
    }	

    $stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE id = ?");
    $stmt->execute([$_SESSION['utilisateur_id']]);
    $user = $stmt->fetch();
?>
