document.addEventListener('DOMContentLoaded', () => {

    const botao = document.getElementById('btnBaixarRelatorio');

    botao.addEventListener('click', () => {

        const inicio = document.getElementById('dataInicio').value;
        const fim = document.getElementById('dataFim').value;
        const estado = document.getElementById('estadoApolice').value;
        const seguradora = document.getElementById('seguradora').value;

        // validar datas
        if (!inicio || !fim) {
            alert('Preencha as datas');
            return;
        }

        // URL correta
        const url =
            `/api/relatorio/excel?inicio=${inicio}&fim=${fim}&estado=${estado}&seguradora=${seguradora}`;

        console.log(url);

        // iniciar download
        window.location.href = url;
    });

});



document.addEventListener('DOMContentLoaded', () => {

    console.log('JS carregado');

    const botao = document.getElementById('btnBaixarRelatorio');

    console.log(botao);

    botao.addEventListener('click', () => {

        alert('Botão clicado');

    });

});