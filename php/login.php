<?php
declare(strict_types=1);

require __DIR__ . '/sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirecionar('../view/login.html');
}

$email = trim((string) ($_POST['email'] ?? ''));
$senha = (string) ($_POST['senha'] ?? '');
$lembrar = !empty($_POST['lembrar']);
$next = destinoLoginSeguro((string) ($_POST['next'] ?? ''));

if ($email === '' || $senha === '') {
    redirecionar('../view/login.html', array_filter(['erro' => 'campos', 'next' => $next]));
}

$consulta = banco()->prepare(
    'SELECT id, nome, email, senha_hash
       FROM usuarios
      WHERE email = :email
        AND ativo = 1
      LIMIT 1'
);
$consulta->execute(['email' => $email]);
$usuario = $consulta->fetch();

if (!$usuario || !password_verify($senha, (string) $usuario['senha_hash'])) {
    redirecionar('../view/login.html', array_filter(['erro' => 'login', 'next' => $next]));
}

iniciarSessaoUsuario($usuario);
criarSessaoPersistente((int) $usuario['id'], $lembrar);

redirecionar('../view/' . ($next ?: 'index.html'), ['login' => 'sucesso']);

function destinoLoginSeguro(string $next): string
{
    $arquivo = basename($next);
    $permitidos = [
        'entrega.html',
        'tad.html',
        'lista-simples.html',
        'lista-dupla.html',
        'manual.html',
        'perfil.html',
        'dashboard.html',
        'trilha.html',
        'cronometro.html',
        'quiz.html',
        'anotacoes.html',
        'revisao.html',
        'index.html',
    ];

    return in_array($arquivo, $permitidos, true) ? $arquivo : '';
}
