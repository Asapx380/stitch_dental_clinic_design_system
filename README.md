# Gabriela Ramos Odontologia

Landing page estática da clínica. Abra `code.html` no navegador para visualizar o projeto.

## Estrutura

```text
code.html            Estrutura e conteúdo da página
css/tailwind.css      Entrada do Tailwind local
css/tailwind.generated.css CSS gerado e servido pela página
css/main.css          Estilos personalizados e animações
js/main.js            Interações da interface
assets/images/        Imagens locais e poster do vídeo
assets/videos/        Vídeos locais
tailwind.config.cjs   Tema e varredura de classes do Tailwind
DESIGN.md             Guia visual do projeto
```

O Tailwind é servido localmente, sem CDN. Quando alterar classes utilitárias no HTML, gere o arquivo de produção com:

```bash
npx tailwindcss@3.4.17 -i css/tailwind.css -o css/tailwind.generated.css -c tailwind.config.cjs --minify
```

O formulário de pré-agendamento prepara uma mensagem no WhatsApp. A solicitação só é enviada quando o visitante confirma o envio no próprio WhatsApp. Menu, comparador antes/depois, carrossel de avaliações e vídeo são controlados por `js/main.js`.

O vídeo vertical fica em `assets/videos/video01.mp4`. Ele inicia sem som quando entra na área visível, pausa ao sair e oferece um controle para ativar o áudio. A imagem de capa está em `assets/images/video01-poster.jpg`.
