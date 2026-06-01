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

$senhaAtual = (string) ($_POST['senha_atual'] ?? '');
$novaSenha = (string) ($_POST['nova_senha'] ?? '');
$confirmarSenha = (string) ($_POST['confirmar_senha'] ?? '');

if ($senhaAtual === '' || $novaSenha === '' || $confirmarSenha === '') {
    redirecionar('../view/perfil.html', ['erro' => 'campos']);
}

if (strlen($novaSenha) < 6) {
    redirecionar('../view/perfil.html', ['erro' => 'senha-curta']);
}

if ($novaSenha !== $confirmarSenha) {
    redirecionar('../view/perfil.html', ['erro' => 'senha-diferente']);
}

$consulta = banco()->prepare('SELECT senha_hash FROM usuarios WHERE id = :id LIMIT 1');
$consulta->execute(['id' => $usuario['id']]);
$linha = $consulta->fetch();

if (!$linha || !password_verify($senhaAtual, (string) $linha['senha_hash'])) {
    redirecionar('../view/perfil.html', ['erro' => 'senha-atual']);
}

$comando = banco()->prepare(
    'UPDATE usuarios
        SET senha_hash = :senha_hash,
            atualizado_em = NOW()
      WHERE id = :id'
);
$comando->execute([
    'senha_hash' => password_hash($novaSenha, PASSWORD_DEFAULT),
    'id' => $usuario['id'],
]);

redirecionar('../view/perfil.html', ['sucesso' => 'senha']);
