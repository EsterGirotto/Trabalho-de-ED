<?php
declare(strict_types=1);

require __DIR__ . '/sessao.php';

limparCookieSessao();
$_SESSION = [];

if (session_status() === PHP_SESSION_ACTIVE) {
    session_destroy();
}

redirecionar('../view/login.html', ['logout' => 'sucesso']);
