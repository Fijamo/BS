CREATE DATABASE IF NOT EXISTS sistema_bs;
USE sistema_bs;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apelido VARCHAR(120) NOT NULL,
  nome VARCHAR(180) NOT NULL,
  apolice VARCHAR(120) NOT NULL UNIQUE,
  ramo VARCHAR(120) NOT NULL,
  matricula VARCHAR(50),
  marca_modelo VARCHAR(150),
  ano_fabrico INT,
  quilometragem INT,
  data_inicio DATE,
  data_fim DATE,
  duracao INT,
  tipo_duracao VARCHAR(50),
  contacto_principal VARCHAR(50) NOT NULL,
  contacto_alternativo VARCHAR(50),
  endereco VARCHAR(255) NOT NULL,
  seguradora VARCHAR(120) NOT NULL,
  estado_veiculo VARCHAR(80),
  danos_visiveis VARCHAR(80),
  estado_carrocaria VARCHAR(80),
  estado_pneus VARCHAR(80),
  observacoes_avaliacao TEXT,
  parecer_segurabilidade VARCHAR(120) NOT NULL,
  estado_apolice VARCHAR(20) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, senha)
SELECT 'Administrador', 'admin@bsseguros.co.mz', '1234'
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios WHERE email = 'admin@bsseguros.co.mz'
);
