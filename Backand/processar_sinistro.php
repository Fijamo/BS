```php
<?php
$conn = new mysqli("localhost", "root", "", "bons_sinais");

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Receber dados
$cliente_id = $_POST['cliente_id'];
$tipo = $_POST['tipo'];
$data = $_POST['data'];
$descricao = $_POST['descricao'];
$resultado = $_POST['resultado'];
$valor = $_POST['valor'];

// 📁 UPLOAD DO ARQUIVO
$arquivo_nome = "";

if(isset($_FILES['arquivo']) && $_FILES['arquivo']['error'] == 0){

    $pasta = "uploads/";
    if(!is_dir($pasta)){
        mkdir($pasta);
    }

    $arquivo_nome = time() . "_" . basename($_FILES['arquivo']['name']);
    $caminho = $pasta . $arquivo_nome;

    move_uploaded_file($_FILES['arquivo']['tmp_name'], $caminho);
}

// Buscar cliente
$sql = "SELECT nome, email FROM clientes WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows == 0){
    die("Cliente não encontrado.");
}

$cliente = $result->fetch_assoc();

$email_cliente = $cliente['email'];
$nome_cliente = $cliente['nome'];

// Email seguradora
$email_seguradora = "seguradora@empresa.com";

// Criar mensagem
$mensagem = "
Relatório de Sinistro

Cliente: $nome_cliente
Tipo: $tipo
Data: $data

Descrição:
$descricao

Resultado:
$resultado

Valor: $valor MZN
";

// Cabeçalhos
$headers = "From: sistema@bonsinais.com";

// Enviar email
mail($email_cliente, "Relatório de Sinistro", $mensagem, $headers);
mail($email_seguradora, "Relatório de Sinistro", $mensagem, $headers);

// Inserir no banco
$sqlInsert = "INSERT INTO sinistros 
(cliente_id, tipo, data, descricao, resultado, valor, arquivo)
VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sqlInsert);
$stmt->bind_param("issssds", $cliente_id, $tipo, $data, $descricao, $resultado, $valor, $arquivo_nome);
$stmt->execute();

echo "✅ Sinistro registrado e relatório enviado!";
?>
```
