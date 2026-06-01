<?php
declare(strict_types=1);

require __DIR__ . '/sessao.php';

$usuario = usuarioAtual();

if (!$usuario) {
    responderJson([
        'autenticado' => false,
        'usuario' => null,
        'progresso' => [],
    ]);
}

$consulta = banco()->prepare(
    'SELECT t.slug, p.visualizado, p.visualizado_em
       FROM topicos t
       LEFT JOIN progresso p
         ON p.topico_id = t.id
        AND p.usuario_id = :usuario_id
      ORDER BY t.ordem'
);
$consulta->execute(['usuario_id' => $usuario['id']]);

$progresso = [];
foreach ($consulta->fetchAll() as $linha) {
    $progresso[$linha['slug']] = [
        'visualizado' => (bool) $linha['visualizado'],
        'visualizado_em' => $linha['visualizado_em'],
    ];
}

responderJson([
    'autenticado' => true,
    'usuario' => $usuario,
    'progresso' => $progresso,
]);
