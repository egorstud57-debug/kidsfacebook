/** Цена генерации книги (руб.), для будущей интеграции VK Pay. `0` — бесплатный режим / тесты. */
export const BOOK_GENERATION_PRICE_RUB = Number(
  import.meta.env.VITE_BOOK_GENERATION_PRICE_RUB ?? 0,
);
