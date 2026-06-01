<?php
declare(strict_types=1);

require __DIR__ . '/sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['erro' => 'Metodo nao permitido.'], 405);
}

$usuario = usuarioAtual();
$pagina = trim((string) ($_POST['pagina'] ?? ''));

if ($pagina === '') {
    responderJson(['erro' => 'Pagina nao informada.'], 400);
}

$pagina = substr($pagina, 0, 100);

$comando = banco()->prepare(
    'INSERT INTO log_acessos (usuario_id, pagina, ip)
     VALUES (:usuario_id, :pagina, :ip)'
);
$comando->execute([
    'usuario_id' => $usuario['id'] ?? null,
    'pagina' => $pagina,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
]);

responderJson(['sucesso' => true]);
