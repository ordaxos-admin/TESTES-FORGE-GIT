import test from "node:test";
import assert from "node:assert/strict";
import { menu, changeQuantity, calculateCart, formatMoney } from "./cart.mjs";

test("preços são inteiros em centavos e ids únicos", () => {
  assert.equal(new Set(menu.map(p => p.id)).size, menu.length);
  assert.ok(menu.every(p => Number.isSafeInteger(p.price) && p.price > 0));
});
test("adiciona, acumula, remove uma unidade e exclui ao zerar", () => {
  let cart = {};
  cart = changeQuantity(cart, "calabresa", 1);
  cart = changeQuantity(cart, "calabresa", 2);
  assert.equal(calculateCart(cart).total, 14070);
  cart = changeQuantity(cart, "calabresa", -1);
  assert.deepEqual(calculateCart(cart), { items: [{ ...menu[1], quantity: 2, subtotal: 9380 }], count: 2, total: 9380 });
  cart = changeQuantity(cart, "calabresa", -2);
  assert.deepEqual(cart, {});
});
test("total de produtos diferentes sem erro de ponto flutuante", () => {
  const cart = { margherita: 2, "quatro-queijos": 1, chocolate: 3 };
  assert.equal(calculateCart(cart).total, 2 * 4290 + 5490 + 3 * 3990);
  assert.equal(calculateCart(cart).count, 6);
  assert.equal(formatMoney(4290), "R$ 42,90");
});
test("carrinho não altera o estado anterior", () => {
  const before = { frango: 1 };
  const after = changeQuantity(before, "frango", 1);
  assert.equal(before.frango, 1);
  assert.equal(after.frango, 2);
});
test("não aceita produto inválido, quantidades fracionárias ou estado corrompido", () => {
  assert.throws(() => changeQuantity({}, "inexistente", 1), RangeError);
  assert.throws(() => changeQuantity({}, "frango", 1.2), RangeError);
  assert.throws(() => calculateCart({ frango: -1 }), RangeError);
  assert.throws(() => calculateCart({ adulterado: 1 }), RangeError);
});
test("carrinho vazio tem total e quantidade zero", () => {
  assert.deepEqual(calculateCart({}), { items: [], count: 0, total: 0 });
});
