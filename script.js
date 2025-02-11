const moedasFiduciarias = ["USD", "BRL", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];
let criptosDisponiveis = [];

// Função para buscar todas as criptos disponíveis
async function carregarCriptos() {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    const resposta = await fetch(url);
    const dados = await resposta.json();
    criptosDisponiveis = dados.map(moeda => moeda.id);
    preencherSelects();
}

// Preencher os selects com moedas fiduciárias e criptos
function preencherSelects() {
    const selects = [document.getElementById("moeda1"), document.getElementById("moeda2")];
    selects.forEach(select => {
        moedasFiduciarias.forEach(moeda => {
            let option = document.createElement("option");
            option.value = moeda;
            option.textContent = moeda;
            select.appendChild(option);
        });

        criptosDisponiveis.forEach(cripto => {
            let option = document.createElement("option");
            option.value = cripto;
            option.textContent = cripto;
            select.appendChild(option);
        });
    });
}

// Função para buscar a taxa de câmbio
async function buscarTaxaDeCambio(moedaOrigem, moedaDestino) {
    if (moedasFiduciarias.includes(moedaOrigem) && moedasFiduciarias.includes(moedaDestino)) {
        const url = `https://api.frankfurter.app/latest?from=${moedaOrigem}&to=${moedaDestino}`;
        const resposta = await fetch(url);
        const dados = await resposta.json();
        return dados.rates[moedaDestino] || 1;
    } else {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${moedaOrigem}&vs_currencies=${moedaDestino}`;
        const resposta = await fetch(url);
        const dados = await resposta.json();
        return dados[moedaOrigem]?.[moedaDestino] || 1;
    }
}

// Atualizar conversão ao mudar o valor ou a moeda
async function atualizarConversao() {
    const moedaOrigem = document.getElementById("moeda1").value;
    const moedaDestino = document.getElementById("moeda2").value;
    const valorOrigem = parseFloat(document.getElementById("valor1").value);

    const taxa = await buscarTaxaDeCambio(moedaOrigem, moedaDestino);
    document.getElementById("valor2").value = (valorOrigem * taxa).toFixed(2);
}

// Adicionar eventos
document.getElementById("moeda1").addEventListener("change", atualizarConversao);
document.getElementById("moeda2").addEventListener("change", atualizarConversao);
document.getElementById("valor1").addEventListener("input", atualizarConversao);

// Iniciar o carregamento das criptos e configurar os selects
carregarCriptos();