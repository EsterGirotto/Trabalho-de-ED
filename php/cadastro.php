<?php
declare(strict_types=1);

require __DIR__ . '/sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirecionar('../view/cadastro.html');
}

$nome = trim((string) ($_POST['nome'] ?? ''));
$ra = trim((string) ($_POST['ra'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$termo = filter_var($_POST['termo'] ?? null, FILTER_VALIDATE_INT);
$senha = (string) ($_POST['senha'] ?? '');
$confirmarSenha = (string) ($_POST['confirmar_senha'] ?? '');

if ($nome === '' || $ra === '' || $email === '' || !$termo || $senha === '') {
    redirecionar('../view/cadastro.html', ['erro' => 'campos']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirecionar('../view/cadastro.html', ['erro' => 'email']);
}

if ($termo < 1 || $termo > 6) {
    redirecionar('../view/cadastro.html', ['erro' => 'termo']);
}

if (strlen($senha) < 6) {
    redirecionar('../view/cadastro.html', ['erro' => 'senha-curta']);
}

if ($senha !== $confirmarSenha) {
    redirecionar('../view/cadastro.html', ['erro' => 'senha-diferente']);
}

try {
    $pdo = banco();
    $comando = $pdo->prepare(
        'INSERT INTO usuarios (nome, ra, email, senha_hash, termo)
         VALUES (:nome, :ra, :email, :senha_hash, :termo)'
    );
    $comando->execute([
        'nome' => $nome,
        'ra' => $ra,
        'email' => $email,
        'senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
        'termo' => $termo,
    ]);

    iniciarSessaoUsuario([
        'id' => (int) $pdo->lastInsertId(),
        'nome' => $nome,
        'email' => $email,
    ]);

    redirecionar('../view/index.html', ['cadastro' => 'sucesso']);
} catch (PDOException $erro) {
    if ($erro->getCode() === '23000') {
        redirecionar('../view/cadastro.html', ['erro' => 'duplicado']);
    }

    error_log('Erro ao cadastrar usuario: ' . $erro->getMessage());
    redirecionar('../view/cadastro.html', ['erro' => 'servidor']);
}
