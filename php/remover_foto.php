<?php
declare(strict_types=1);

require __DIR__ . '/sessao.php';

$usuario = usuarioAtual();

if (!$usuario) {
    redirecionar('../view/login.html', ['acesso' => 'restrito', 'next' => 'perfil.html']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirecionar('../view/perfil.html');
}

if (!empty($usuario['foto_perfil']) && strpos((string) $usuario['foto_perfil'], 'uploads/perfis/') === 0) {
    $fotoAntiga = dirname(__DIR__) . '/' . $usuario['foto_perfil'];

    if (is_file($fotoAntiga)) {
        @unlink($fotoAntiga);
    }
}

$comando = banco()->prepare(
    'UPDATE usuarios
        SET foto_perfil = NULL,
            atualizado_em = NOW()
      WHERE id = :id'
);
$comando->execute(['id' => $usuario['id']]);

redirecionar('../view/perfil.html', ['sucesso' => 'foto-removida']);
