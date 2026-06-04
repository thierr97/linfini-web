INSERT INTO "Category" (id, name, slug, icon, position, active, "createdAt") VALUES
('cat-tapas',   'Tapas & Snacks',   'tapas',   '🍢', 1, true, NOW()),
('cat-pizza',   'Pizzas',           'pizza',   '🍕', 2, true, NOW()),
('cat-salade',  'Salades',          'salade',  '🥗', 3, true, NOW()),
('cat-braise',  'Plateaux Braise',  'braise',  '🔥', 4, true, NOW()),
('cat-boisson', 'Boissons',         'boisson', '🍹', 5, true, NOW());

INSERT INTO "Item" (id, name, description, "basePrice", "categoryId", active, featured, "createdAt", "updatedAt") VALUES
('item-pizza-26', 'Pizza 26cm', 'Base + sauce + fromage à composer', 8.00, 'cat-pizza', true, true, NOW(), NOW()),
('item-pizza-33', 'Pizza 33cm', 'Base + sauce + fromage à composer', 12.00, 'cat-pizza', true, true, NOW(), NOW()),
('item-salade-jeunes', 'Salade Jeunes Pousses', 'Salade fraîche de saison', 12.00, 'cat-salade', true, true, NOW(), NOW());

INSERT INTO "Table" (id, number, label, capacity, active) VALUES
('table-1', '1', 'Table 1', 4, true),
('table-2', '2', 'Table 2', 4, true),
('table-3', '3', 'Table 3', 6, true),
('table-4', '4', 'Table 4', 2, true),
('table-5', '5', 'Table Salon VIP', 8, true),
('table-bar', 'B1', 'Bar Comptoir', 6, true);
