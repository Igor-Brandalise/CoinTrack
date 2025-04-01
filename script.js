// Lista de moedas fiduciárias (moedas tradicionais emitidas por governos)
const moedasFiduciarias = ["USD", "BRL", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];

// Array que armazenará as criptomoedas disponíveis, carregadas dinamicamente via API
let criptosDisponiveis = [];

// Função assíncrona para buscar criptomoedas disponíveis na API CoinGecko
async function carregarCriptos() {
    try {
        const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"; // Endpoint para obter criptomoedas
        const resposta = await fetch(url); // Faz a requisição à API
        const dados = await resposta.json(); // Converte a resposta para JSON

        if (Array.isArray(dados)) {
            criptosDisponiveis = dados.map(moeda => moeda.id.toUpperCase());
        }

        configurarDropdowns(); // Atualiza os dropdowns após carregar as criptos
    } catch (erro) {
        console.error("Erro ao carregar criptomoedas:", erro);
    }
}

// Função que configura os dropdowns para permitir busca e seleção de moedas
function configurarDropdowns() {
    const entradas = [
        { input: document.getElementById("search1"), dropdown: document.getElementById("dropdown1") },
        { input: document.getElementById("search2"), dropdown: document.getElementById("dropdown2") }
    ];

    entradas.forEach(({ input, dropdown }) => {
        function atualizarLista(filtro) {
            dropdown.innerHTML = "";
            let listaMoedas = [...moedasFiduciarias, ...criptosDisponiveis];

            let moedasFiltradas = listaMoedas.filter(moeda => 
                moeda.toUpperCase().includes(filtro.toUpperCase())
            );

            if (moedasFiltradas.length === 0) {
                dropdown.style.display = "none";
                return;
            }

            moedasFiltradas.forEach(moeda => {
                let item = document.createElement("div");
                item.textContent = moeda;
                item.classList.add("dropdown-item");

                item.onclick = () => {
                    input.value = moeda;
                    dropdown.style.display = "none";
                    atualizarConversao();
                };

                dropdown.appendChild(item);
            });

            dropdown.style.display = "block";
        }

        input.addEventListener("click", () => atualizarLista(input.value));
        input.addEventListener("input", () => atualizarLista(input.value));

        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") dropdown.style.display = "none";
        });
    });
}


// Função assíncrona para buscar a taxa de câmbio entre duas moedas
async function buscarTaxaDeCambio(moedaOrigem, moedaDestino) {
    try {
        if (moedasFiduciarias.includes(moedaOrigem) && moedasFiduciarias.includes(moedaDestino)) {
            const url = `https://api.frankfurter.app/latest?from=${moedaOrigem}&to=${moedaDestino}`;
            const resposta = await fetch(url);
            const dados = await resposta.json();
            return dados.rates[moedaDestino] || 1;
        } else {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${moedaOrigem.toLowerCase()}&vs_currencies=${moedaDestino.toLowerCase()}`;
            const resposta = await fetch(url);
            const dados = await resposta.json();

            if (dados[moedaOrigem.toLowerCase()] && dados[moedaOrigem.toLowerCase()][moedaDestino.toLowerCase()]) {
                return dados[moedaOrigem.toLowerCase()][moedaDestino.toLowerCase()];
            } else {
                console.warn(`Conversão de ${moedaOrigem} para ${moedaDestino} não encontrada.`);
                return 1;
            }
        }
    } catch (erro) {
        console.error("Erro ao buscar taxa de câmbio:", erro);
        return 1;
    }
}

// Função para atualizar a conversão entre moedas quando um valor é inserido
async function atualizarConversao() {
    const moedaOrigem = document.getElementById("search1").value.trim();
    const moedaDestino = document.getElementById("search2").value.trim();
    const valorOrigem = parseFloat(document.getElementById("valor1").value);

    if (!moedaOrigem || !moedaDestino || isNaN(valorOrigem)) return;

    const taxa = await buscarTaxaDeCambio(moedaOrigem, moedaDestino);
    document.getElementById("valor2").value = (valorOrigem * taxa).toFixed(2);
}

// Aguarda o DOM estar carregado antes de executar os scripts
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("valor1").addEventListener("input", atualizarConversao);
    carregarCriptos();
});
