async function CriptoMoedas() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,brl,eur";

  try {
    const resposta = await fetch(url); //requisita a url
    const dados = await resposta.json(); //converte para JSON
    console.log(dados);
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
  }
}

CriptoMoedas()
