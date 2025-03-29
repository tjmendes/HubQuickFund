# Script para compactar o projeto QuickFundHub

# Definir o caminho do diretório do projeto e o nome do arquivo ZIP
$projectDir = $PSScriptRoot
$zipFileName = "QuickFundHub-Project.zip"
$zipFilePath = Join-Path $projectDir $zipFileName

# Remover arquivo ZIP existente, se houver
if (Test-Path $zipFilePath) {
    Remove-Item $zipFilePath -Force
    Write-Host "Arquivo ZIP anterior removido."
}

# Criar um novo arquivo ZIP
Write-Host "Compactando o projeto em $zipFileName..."

# Excluir node_modules se existir para reduzir o tamanho
$excludeItems = @("node_modules", ".git")

# Usar o método Compress-Archive do PowerShell para criar o arquivo ZIP
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal

# Obter todos os itens no diretório do projeto, excluindo os especificados
$items = Get-ChildItem -Path $projectDir -Exclude $excludeItems

# Comprimir os itens
Compress-Archive -Path $items -DestinationPath $zipFilePath -CompressionLevel $compressionLevel -Force

# Verificar se o arquivo ZIP foi criado com sucesso
if (Test-Path $zipFilePath) {
    $fileSize = (Get-Item $zipFilePath).Length / 1MB
    Write-Host "Arquivo ZIP criado com sucesso: $zipFilePath"
    Write-Host "Tamanho do arquivo: $([math]::Round($fileSize, 2)) MB"
    Write-Host ""
    Write-Host "Para baixar o projeto para seu notebook:"
    Write-Host "1. Localize o arquivo $zipFileName no diretório do projeto"
    Write-Host "2. Copie o arquivo para seu notebook usando um pendrive ou transferência de rede"
    Write-Host "3. Extraia o conteúdo do arquivo ZIP no seu notebook"
    Write-Host "4. Abra o projeto em seu editor de código preferido"
    Write-Host "5. Execute 'npm install' para instalar as dependências"
    Write-Host "6. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
} else {
    Write-Host "Erro ao criar o arquivo ZIP."
}