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

$nome = trim((string) ($_POST['nome'] ?? ''));
$ra = trim((string) ($_POST['ra'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$termo = filter_var($_POST['termo'] ?? null, FILTER_VALIDATE_INT);

if ($nome === '' || $ra === '' || $email === '' || !$termo) {
    redirecionar('../view/perfil.html', ['erro' => 'campos']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirecionar('../view/perfil.html', ['erro' => 'email']);
}

if ($termo < 1 || $termo > 6) {
    redirecionar('../view/perfil.html', ['erro' => 'termo']);
}

try {
    $comando = banco()->prepare(
        'UPDATE usuarios
            SET nome = :nome,
                ra = :ra,
                email = :email,
                termo = :termo,
                atualizado_em = NOW()
          WHERE id = :id'
    );
    $comando->execute([
        'nome' => $nome,
        'ra' => $ra,
        'email' => $email,
        'termo' => $termo,
        'id' => $usuario['id'],
    ]);

    atualizarSessaoUsuario([
        'id' => $usuario['id'],
        'nome' => $nome,
        'email' => $email,
    ]);

    redirecionar('../view/perfil.html', ['sucesso' => 'dados']);
} catch (PDOException $erro) {
    if ($erro->getCode() === '23000') {
        redirecionar('../view/perfil.html', ['erro' => 'duplicado']);
    }

    error_log('Erro ao atualizar perfil: ' . $erro->getMessage());
    redirecionar('../view/perfil.html', ['erro' => 'servidor']);
}
