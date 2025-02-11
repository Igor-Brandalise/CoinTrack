const moedasFiduciarias = ["USD", "BRL", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];
        let criptosDisponiveis = [];

        async function carregarCriptos() {
            const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
            const resposta = await fetch(url);
            const dados = await resposta.json();
            criptosDisponiveis = dados.map(moeda => moeda.id.toUpperCase());
            configurarDropdowns();
        }

        function configurarDropdowns() {
            const entradas = [
                { input: document.getElementById("search1"), dropdown: document.getElementById("dropdown1") },
                { input: document.getElementById("search2"), dropdown: document.getElementById("dropdown2") }
            ];

            entradas.forEach(({ input, dropdown }) => {
                let listaMoedas = [...moedasFiduciarias, ...criptosDisponiveis];

                function atualizarLista(filtro) {
                    dropdown.innerHTML = "";
                    listaMoedas
                        .filter(moeda => moeda.toUpperCase().includes(filtro.toUpperCase()))
                        .forEach(moeda => {
                            let item = document.createElement("div");
                            item.textContent = moeda;
                            item.onclick = () => {
                                input.value = moeda;
                                dropdown.style.display = "none";
                                atualizarConversao();
                            };
                            dropdown.appendChild(item);
                        });
                }

                input.addEventListener("focus", () => {
                    dropdown.style.display = "block";
                    atualizarLista(input.value);
                });

                input.addEventListener("input", () => atualizarLista(input.value));

                document.addEventListener("click", (e) => {
                    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.style.display = "none";
                    }
                });
            });
        }

        async function buscarTaxaDeCambio(moedaOrigem, moedaDestino) {
            if (moedasFiduciarias.includes(moedaOrigem) && moedasFiduciarias.includes(moedaDestino)) {
                const url = `https://api.frankfurter.app/latest?from=${moedaOrigem}&to=${moedaDestino}`;
                const resposta = await fetch(url);
                const dados = await resposta.json();
                return dados.rates[moedaDestino] || 1;
            } else {
                const url = `https://api.coingecko.com/api/v3/simple/price?ids=${moedaOrigem.toLowerCase()}&vs_currencies=${moedaDestino.toLowerCase()}`;
                const resposta = await fetch(url);
                const dados = await resposta.json();
                return dados[moedaOrigem.toLowerCase()]?.[moedaDestino.toLowerCase()] || 1;
            }
        }

        async function atualizarConversao() {
            const moedaOrigem = document.getElementById("search1").value;
            const moedaDestino = document.getElementById("search2").value;
            const valorOrigem = parseFloat(document.getElementById("valor1").value);

            if (!moedaOrigem || !moedaDestino) return;

            const taxa = await buscarTaxaDeCambio(moedaOrigem, moedaDestino);
            document.getElementById("valor2").value = (valorOrigem * taxa).toFixed(2);
        }

        document.getElementById("valor1").addEventListener("input", atualizarConversao);

        carregarCriptos();