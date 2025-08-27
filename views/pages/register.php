<?php
require_once 'config/db.php';



if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $last_name = $_POST['last_name'];
    $first_name = $_POST['first_name'];
    $email = $_POST['email'];
    $password = md5($_POST['password']);



    // Insertion en base
    $stmt = $pdo->prepare("INSERT INTO users (last_name, first_name, email, password, photo) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$last_name, $first_name, $email, $password]);

    header('Location: select_user.php');
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription</title>
    <link rel="stylesheet" href="CSS/style_log.css">
    <link rel="stylesheet" href="CSS/animation.css">
    <link rel="stylesheet" href="CSS/styleTheme.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" crossorigin="anonymous">
</head>
<body>
    <div class="container">
        <div class="box_log">
            <img src="image/metallica.jpg" alt="image" class="back_img">
            <h1 class="title_top"><i class="fa-solid fa-user"></i> Inscription</h1>

            <form method="POST" enctype="multipart/form-data">
                <input type="text" placeholder="last_name" id="last_name" name="last_name" required>
                <input type="text" placeholder="first_name" id="first_name" name="first_name" required>
                <input type="email" placeholder="email" id="email" name="email" required>
                <input type="password" placeholder="Mot de passe" id="password" name="password" required>
                <input type="file" id="photo_profil" name="photo" accept="image/*" style="display: none;" onchange="previewPhoto(this)">

                <button type="button" id="addPhoto" onclick="document.getElementById('photo_profil').click();">
                    <i class="fa-solid fa-image"></i>
                </button>
                <div id="photoPreview" style="margin-top: 10px;">
                    <img src="uploads/" alt="aperçu" style="max-width: 150px; display: none; border-radius: 10px;">
                </div>

                <div class="btn">
                    <button id="enregistrer" type="submit"><a><i class="fa-solid fa-floppy-disk"></i> Enregistrer</a></button>  
                    <button id="dejaCompte"><a href="select_user.php"><i class="fa-solid fa-user"></i> J'ai déja un compte</a></button> 
                </div>
            </form>

            <div class="logo_bottom">
                <a href="#"><img src="image/metallica.jpg" alt="image" class="img_logo_bottom"></a>
            </div>
        </div>
    </div>
    <script src="JavaScript/script.js"></script>
</body>
</html>

    

