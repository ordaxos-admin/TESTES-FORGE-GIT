export const menu = Object.freeze([
  { id: "margherita", name: "Margherita", description: "Molho de tomate, muçarela, manjericão e azeite.", price: 4290, category: "Clássicas", emoji: "🍅" },
  { id: "calabresa", name: "Calabresa", description: "Calabresa artesanal, cebola roxa e orégano.", price: 4690, category: "Clássicas", emoji: "🍕" },
  { id: "quatro-queijos", name: "Quatro Queijos", description: "Muçarela, provolone, parmesão e gorgonzola.", price: 5490, category: "Especiais", emoji: "🧀" },
  { id: "frango", name: "Frango Cremoso", description: "Frango desfiado, requeijão cremoso e milho.", price: 4990, category: "Especiais", emoji: "🌽" },
  { id: "portuguesa", name: "Portuguesa", description: "Presunto, ovos, cebola, azeitonas e muçarela.", price: 5290, category: "Especiais", emoji: "🫒" },
  { id: "chocolate", name: "Chocolate", description: "Chocolate ao leite, ganache e raspas de chocolate.", price: 3990, category: "Doces", emoji: "🍫" }
]);
export const formatMoney = cents => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
export function changeQuantity(cart, id, delta) {
  if (!menu.some(item => item.id === id)) throw new RangeError("Produto desconhecido");
  if (!Number.isInteger(delta) || delta === 0) throw new RangeError("Quantidade inválida");
  const current = cart[id] ?? 0;
  if (!Number.isSafeInteger(current) || current < 0) throw new RangeError("Carrinho inválido");
  const next = current + delta;
  if (!Number.isSafeInteger(next)) throw new RangeError("Quantidade excessiva");
  const updated = { ...cart };
  if (next <= 0) delete updated[id];
  else updated[id] = next;
  return updated;
}
export function calculateCart(cart) {
  if (cart === null || typeof cart !== "object" || Array.isArray(cart)) throw new TypeError("Carrinho inválido");
  let count = 0, total = 0;
  const items = [];
  for (const [id, quantity] of Object.entries(cart)) {
    const product = menu.find(p => p.id === id);
    if (!product || !Number.isSafeInteger(quantity) || quantity <= 0) throw new RangeError("Item inválido");
    const subtotal = quantity * product.price;
    if (!Number.isSafeInteger(subtotal) || !Number.isSafeInteger(total + subtotal)) throw new RangeError("Total excessivo");
    count += quantity; total += subtotal;
    items.push({ ...product, quantity, subtotal });
  }
  return { items, count, total };
}
