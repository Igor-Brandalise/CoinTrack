// Lista de moedas fiduciárias (moedas tradicionais emitidas por governos)
const moedasFiduciarias = ["USD", "BRL", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];

// Array que armazenará as criptomoedas disponíveis, carregadas dinamicamente via API
let criptosDisponiveis = [""];

// Função assíncrona para buscar criptomoedas disponíveis na API CoinGecko
async function carregarCriptos() {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"; // Endpoint para obter criptomoedas
    const resposta = await fetch(url); // Faz a requisição à API
    const dados = await resposta.json(); // Converte a resposta para JSON

    // Mapeia os dados para obter apenas os IDs das criptomoedas e os converte para maiúsculas
    criptosDisponiveis = dados.map(moeda => moeda.id.toUpperCase());

    // Chama a função que configura os dropdowns de seleção de moedas
    configurarDropdowns();
}

// Função que configura os dropdowns para permitir busca e seleção de moedas
function configurarDropdowns() {
    // Seleciona os inputs de pesquisa e os respectivos dropdowns de sugestões
    const entradas = [
        { input: document.getElementById("search1"), dropdown: document.getElementById("dropdown1") },
        { input: document.getElementById("search2"), dropdown: document.getElementById("dropdown2") }
    ];

    // Configuração para cada input e dropdown correspondente
    entradas.forEach(({ input, dropdown }) => {
        // Combina moedas fiduciárias e criptomoedas disponíveis
        let listaMoedas = [...moedasFiduciarias, ...criptosDisponiveis];

        // Função para atualizar a lista exibida no dropdown com base no que foi digitado
        function atualizarLista(filtro) {
            dropdown.innerHTML = ""; // Limpa a lista atual

            // Filtra moedas que contenham a string digitada (case insensitive)
            listaMoedas
                .filter(moeda => moeda.toUpperCase().includes(filtro.toUpperCase()))
                .forEach(moeda => {
                    let item = document.createElement("div"); // Cria um item da lista
                    item.textContent = moeda; // Define o nome da moeda

                    // Define o comportamento ao clicar na moeda encontrada
                    item.onclick = () => {
                        input.value = moeda; // Define o valor do input com a moeda selecionada
                        dropdown.style.display = "none"; // Esconde a lista de sugestões
                        atualizarConversao(); // Atualiza a conversão de moedas
                    };

                    dropdown.appendChild(item); // Adiciona o item à lista
                });
        }

        // Quando o input recebe foco, exibe a lista de moedas e aplica o filtro inicial
        input.addEventListener("focus", () => {
            dropdown.style.display = "block"; // Exibe o dropdown
            atualizarLista(input.value); // Aplica o filtro inicial baseado no valor digitado
        });

        // Atualiza a lista de sugestões conforme o usuário digita no input
        input.addEventListener("input", () => atualizarLista(input.value));

        // Fecha o dropdown ao clicar fora dele ou do input
        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = "none"; // Esconde a lista de sugestões
            }
        });
    });
}

// Função assíncrona para buscar a taxa de câmbio entre duas moedas
async function buscarTaxaDeCambio(moedaOrigem, moedaDestino) {
    // Verifica se ambas as moedas são fiduciárias
    if (moedasFiduciarias.includes(moedaOrigem) && moedasFiduciarias.includes(moedaDestino)) {
        const url = `https://api.frankfurter.app/latest?from=${moedaOrigem}&to=${moedaDestino}`;
        const resposta = await fetch(url); // Faz a requisição à API Frankfurter (taxas entre moedas fiduciárias)
        const dados = await resposta.json(); // Converte a resposta para JSON
        return dados.rates[moedaDestino] || 1; // Retorna a taxa de conversão ou 1 caso não haja dados
    } else {
        // Se ao menos uma moeda for criptomoeda, usa a API CoinGecko
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${moedaOrigem.toLowerCase()}&vs_currencies=${moedaDestino.toLowerCase()}`;
        const resposta = await fetch(url); // Faz a requisição à API CoinGecko
        const dados = await resposta.json(); // Converte a resposta para JSON

        // Retorna a taxa de conversão, ou 1 caso não haja dados disponíveis
        return dados[moedaOrigem.toLowerCase()]?.[moedaDestino.toLowerCase()] || 1;
    }
}

// Função para atualizar a conversão entre moedas quando um valor é inserido
async function atualizarConversao() {
    const moedaOrigem = document.getElementById("search1").value; // Obtém a moeda de origem
    const moedaDestino = document.getElementById("search2").value; // Obtém a moeda de destino
    const valorOrigem = parseFloat(document.getElementById("valor1").value); // Obtém o valor a ser convertido

    // Se não houver moeda selecionada, interrompe a função
    if (!moedaOrigem || !moedaDestino) return;

    const taxa = await buscarTaxaDeCambio(moedaOrigem, moedaDestino); // Obtém a taxa de câmbio
    document.getElementById("valor2").value = (valorOrigem * taxa).toFixed(2); // Atualiza o valor convertido no campo de destino
}

// Adiciona um evento para atualizar a conversão sempre que o usuário modificar o valor inserido
document.getElementById("valor1").addEventListener("input", atualizarConversao);

// Chama a função para carregar as criptomoedas ao iniciar o site
carregarCriptos();
