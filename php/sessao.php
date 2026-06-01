<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function banco(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $pdo = require __DIR__ . '/conexao.php';
    }

    return $pdo;
}

function usuarioAtual(): ?array
{
    if (!empty($_SESSION['usuario_id'])) {
        $usuario = buscarUsuarioPorId((int) $_SESSION['usuario_id']);

        if (!$usuario) {
            $_SESSION = [];
            return null;
        }

        atualizarSessaoUsuario($usuario);
        return $usuario;
    }

    if (empty($_COOKIE['ed_token'])) {
        return null;
    }

    $token = (string) $_COOKIE['ed_token'];
    $consulta = banco()->prepare(
        'SELECT u.id, u.nome, u.ra, u.email, u.termo, u.foto_perfil
           FROM sessoes s
           JOIN usuarios u ON u.id = s.usuario_id
          WHERE s.token = :token
            AND s.expira_em > NOW()
            AND u.ativo = 1
          LIMIT 1'
    );
    $consulta->execute(['token' => $token]);
    $usuario = $consulta->fetch();

    if (!$usuario) {
        limparCookieSessao();
        return null;
    }

    atualizarSessaoUsuario($usuario);
    return normalizarUsuario($usuario);
}

function buscarUsuarioPorId(int $usuarioId): ?array
{
    $consulta = banco()->prepare(
        'SELECT id, nome, ra, email, termo, foto_perfil
           FROM usuarios
          WHERE id = :id
            AND ativo = 1
          LIMIT 1'
    );
    $consulta->execute(['id' => $usuarioId]);
    $usuario = $consulta->fetch();

    return $usuario ? normalizarUsuario($usuario) : null;
}

function normalizarUsuario(array $usuario): array
{
    return [
        'id' => (int) $usuario['id'],
        'nome' => (string) $usuario['nome'],
        'ra' => (string) ($usuario['ra'] ?? ''),
        'email' => (string) $usuario['email'],
        'termo' => isset($usuario['termo']) ? (int) $usuario['termo'] : null,
        'foto_perfil' => $usuario['foto_perfil'] ?? null,
    ];
}

function atualizarSessaoUsuario(array $usuario): void
{
    $_SESSION['usuario_id'] = (int) $usuario['id'];
    $_SESSION['usuario_nome'] = (string) $usuario['nome'];
    $_SESSION['usuario_email'] = (string) $usuario['email'];
}

function iniciarSessaoUsuario(array $usuario): void
{
    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int) $usuario['id'];
    $_SESSION['usuario_nome'] = (string) $usuario['nome'];
    $_SESSION['usuario_email'] = (string) $usuario['email'];
}

function criarSessaoPersistente(int $usuarioId, bool $lembrar): void
{
    $token = bin2hex(random_bytes(32));
    $dias = $lembrar ? 30 : 1;
    $expiraEm = (new DateTimeImmutable($lembrar ? '+30 days' : '+8 hours'))->format('Y-m-d H:i:s');

    $comando = banco()->prepare(
        'INSERT INTO sessoes (usuario_id, token, ip, lembrar, expira_em)
         VALUES (:usuario_id, :token, :ip, :lembrar, :expira_em)'
    );
    $comando->execute([
        'usuario_id' => $usuarioId,
        'token' => $token,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        'lembrar' => $lembrar ? 1 : 0,
        'expira_em' => $expiraEm,
    ]);

    setcookie('ed_token', $token, [
        'expires' => $lembrar ? time() + ($dias * 24 * 60 * 60) : 0,
        'path' => '/Trabalho-de-ED',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function limparCookieSessao(): void
{
    if (!empty($_COOKIE['ed_token'])) {
        $comando = banco()->prepare('DELETE FROM sessoes WHERE token = :token');
        $comando->execute(['token' => (string) $_COOKIE['ed_token']]);
    }

    setcookie('ed_token', '', [
        'expires' => time() - 3600,
        'path' => '/Trabalho-de-ED',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function redirecionar(string $destino, array $params = []): void
{
    if ($params) {
        $destino .= (strpos($destino, '?') !== false ? '&' : '?') . http_build_query($params);
    }

    header("Location: {$destino}");
    exit;
}

function responderJson(array $dados, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}
