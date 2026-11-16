# Forno 7 — pizzaria demonstrativa

Site estático responsivo em português, com seis pizzas, categorias, preço em reais e carrinho interativo. O carrinho permite adicionar e remover unidades e calcula os subtotais e o total em **centavos inteiros**, sem arredondamentos incorretos.

## Executar localmente

Na raiz do repositório, com Python 3:

```sh
python -m http.server 8000
```

Abrir `http://localhost:8000/demo/`. O servidor local é necessário porque a página usa módulos JavaScript ES.

## Testar

Com Node.js 20 ou superior:

```sh
node --test demo/cart.test.mjs
```

Os testes cobrem catálogo, preços, inclusão, remoção, totais com vários produtos, imutabilidade, entradas inválidas e carrinho vazio. Também é recomendável testar manualmente o fluxo em uma janela estreita (375 px) e larga (1280 px).

## Escopo

Experiência de demonstração apenas: não possui checkout, integração de pagamento ou processamento de pedidos. **Não há implantação/publicação automática.**
