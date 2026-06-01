<?php
declare(strict_types=1);

require __DIR__ . '/sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['erro' => 'Metodo nao permitido.'], 405);
}

$usuario = usuarioAtual();

if (!$usuario) {
    responderJson(['erro' => 'Entre para salvar seu progresso.'], 401);
}

$slug = trim((string) ($_POST['slug'] ?? ''));

if ($slug === '') {
    responderJson(['erro' => 'Topico nao informado.'], 400);
}

$consultaTopico = banco()->prepare('SELECT id FROM topicos WHERE slug = :slug LIMIT 1');
$consultaTopico->execute(['slug' => $slug]);
$topico = $consultaTopico->fetch();

if (!$topico) {
    responderJson(['erro' => 'Topico nao encontrado.'], 404);
}

$comando = banco()->prepare(
    'INSERT INTO progresso (usuario_id, topico_id, visualizado, visualizado_em)
     VALUES (:usuario_id, :topico_id, 1, NOW())
     ON DUPLICATE KEY UPDATE visualizado = 1, visualizado_em = NOW()'
);
$comando->execute([
    'usuario_id' => $usuario['id'],
    'topico_id' => $topico['id'],
]);

responderJson([
    'sucesso' => true,
    'slug' => $slug,
    'mensagem' => 'Progresso salvo.',
]);
