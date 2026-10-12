CREATE DATABASE IF NOT EXISTS biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca;

DROP TABLE IF EXISTS livros;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE livros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  autor VARCHAR(150) NOT NULL,
  ano SMALLINT,
  usuario_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_livros_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_livros_usuario (usuario_id),
  INDEX idx_livros_titulo (titulo)
);

-- Usuário de exemplo (apenas para testes). Senha: Senha123
INSERT INTO usuarios (nome, email, senha_hash) VALUES
('Usuário Exemplo', 'exemplo@email.com', '$2b$10$9EtUiq3XPh0e4U9bgwt7mOFu46K4AO/ki5Bl6WrG6kL7T17owfwRO');

INSERT INTO livros (titulo, autor, ano, usuario_id) VALUES
('Dom Casmurro', 'Machado de Assis', 1899, 1),
('O Cortiço', 'Aluísio Azevedo', 1890, 1),
('Capitães da Areia', 'Jorge Amado', 1937, 1),
('Vidas Secas', 'Graciliano Ramos', 1938, 1),
('A Hora da Estrela', 'Clarice Lispector', 1977, 1);
