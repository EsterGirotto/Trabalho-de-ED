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

if (empty($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    redirecionar('../view/perfil.html', ['erro' => 'foto']);
}

$foto = $_FILES['foto'];

if ($foto['size'] > 2 * 1024 * 1024) {
    redirecionar('../view/perfil.html', ['erro' => 'foto-tamanho']);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($foto['tmp_name']);
$extensoes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

if (!isset($extensoes[$mime])) {
    redirecionar('../view/perfil.html', ['erro' => 'foto-tipo']);
}

$pastaDestino = dirname(__DIR__) . '/uploads/perfis';

if (!is_dir($pastaDestino)) {
    mkdir($pastaDestino, 0775, true);
}

$nomeArquivo = 'usuario-' . $usuario['id'] . '-' . time() . '.' . $extensoes[$mime];
$destino = $pastaDestino . '/' . $nomeArquivo;

if (!move_uploaded_file($foto['tmp_name'], $destino)) {
    redirecionar('../view/perfil.html', ['erro' => 'foto']);
}

$caminhoRelativo = 'uploads/perfis/' . $nomeArquivo;

if (!empty($usuario['foto_perfil']) && strpos((string) $usuario['foto_perfil'], 'uploads/perfis/') === 0) {
    $fotoAntiga = dirname(__DIR__) . '/' . $usuario['foto_perfil'];

    if (is_file($fotoAntiga)) {
        @unlink($fotoAntiga);
    }
}

$comando = banco()->prepare(
    'UPDATE usuarios
        SET foto_perfil = :foto_perfil,
            atualizado_em = NOW()
      WHERE id = :id'
);
$comando->execute([
    'foto_perfil' => $caminhoRelativo,
    'id' => $usuario['id'],
]);

redirecionar('../view/perfil.html', ['sucesso' => 'foto']);
