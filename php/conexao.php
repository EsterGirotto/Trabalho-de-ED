<?php
declare(strict_types=1);

$host = '127.0.0.1';
$banco = 'estruturas_dados';
$usuario = 'root';
$senha = '';
$charset = 'utf8mb4';

$dsn = "mysql:host={$host};dbname={$banco};charset={$charset}";
$opcoes = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    return new PDO($dsn, $usuario, $senha, $opcoes);
} catch (PDOException $erro) {
    error_log('Erro de conexao com o banco: ' . $erro->getMessage());
    http_response_code(500);
    exit('Nao foi possivel conectar ao banco de dados.');
}
