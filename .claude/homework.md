Домашнє завдання: міні full-stack застосунок на Next.js 16
Стек (обов'язковий)
Шар
Технологія
Фреймворк
Next.js 16 (App Router, Server Components)
Клієнтські дані / кеш
TanStack Query (@tanstack/react-query)
Форми
react-hook-form
Автентифікація
Better Auth (better-auth)
База даних
Supabase (Postgres)
ORM
Drizzle ORM + Drizzle Kit
Мова
TypeScript


Дані для списку зберігаються у власній таблиці в Supabase і читаються через Drizzle. Зовнішні API не використовуємо.


Що треба зробити
Застосунок-каталог із трьох сценаріїв:

Список — сторінка зі списком якихось даних (тему обираєш сам: книги, курси, фільми, рецепти тощо).
Деталі — окрема сторінка з повною інформацією про один елемент зі списку.
Обране (favorites) — можливість додавати елементи в обране. Обране зберігається тільки для авторизованих користувачів і прив'язане до конкретного користувача.


Структура сторінок (App Router)
Маршрут
Призначення
Доступ
/ (або /items)
Список елементів
публічний
/items/[id]
Деталі одного елемента
публічний
/favorites
Список обраного поточного користувача
тільки авторизовані
/login
Форма входу
публічний
/register
Форма реєстрації
публічний
/api/auth/[...all]
Route-handler Better Auth
—


Захист /favorites реалізувати через proxy.ts (у Next.js 16 middleware замінено на proxy.ts) або перевіркою сесії на сервері з редіректом на /login.


Модель даних (Drizzle + Supabase)
Окрім таблиць, які генерує Better Auth (user, session, account, verification), створити дві свої:

items — дані для списку:

id (uuid, PK)
title (text, not null)
description (text)
image_url (text, nullable)
created_at (timestamp, default now)

favorites — зв'язок користувач ↔ елемент:

id (uuid, PK)
user_id (FK → user.id, not null)
item_id (FK → items.id, not null)
created_at (timestamp, default now)
унікальний індекс на пару (user_id, item_id) — один елемент не можна додати в обране двічі

Таблицю items наповнити seed-скриптом (мінімум 10 записів).


Вимоги по кожній технології
Next.js 16

App Router, серверні компоненти для початкового рендера списку та деталей.
proxy.ts для захисту /favorites.
Route-handler /api/auth/[...all] через toNextJsHandler(auth).

Drizzle ORM + Supabase

Підключення до Postgres Supabase через connection string в .env.local.
Схема в окремому файлі, міграції через drizzle-kit generate + drizzle-kit push (або migrate).
Усі запити до items і favorites — лише через Drizzle (без сирого SQL і без supabase-js клієнта для цих таблиць).

Better Auth

Email + пароль.
drizzleAdapter(db, { provider: "pg", schema }).
BETTER_AUTH_SECRET (мін. 32 символи) у .env.local, не комітити.
Кнопки «Додати в обране» / посилання /favorites доступні лише після входу; неавторизованого користувача редіректимо на /login.

TanStack Query

Отримання списку та деталей на клієнті через useQuery (із початкових серверних даних або окремих route-handler'ів).
Додавання/видалення з обраного через useMutation з інвалідацією відповідних запитів.
Бонус: оптимістичне оновлення стану обраного.

react-hook-form

Форми /login і /register побудовані на react-hook-form з валідацією (email формат, мінімальна довжина пароля, обробка помилок з боку Better Auth).


Критерії приймання (Definition of Done)
Список рендериться з даних Supabase через Drizzle.
Клік по елементу веде на /items/[id] з повними деталями.
Неавторизований користувач не має доступу до /favorites (редірект на /login).
Авторизований користувач може додати/прибрати елемент з обраного; стан зберігається в БД і переживає перезавантаження сторінки.
Обране одного користувача не видно іншому.
Реєстрація та вхід працюють; сесія зберігається між перезавантаженнями.
Зміна обраного оновлює UI без повного перезавантаження сторінки (TanStack Query invalidation/optimistic update).
Форми валідують ввід і показують помилки.
У репозиторії є .env.example, секрети не закомічені.


Бонусні завдання (необов'язково)
Пошук / фільтрація списку (окрема форма на react-hook-form + параметри запиту).
Пагінація списку через TanStack Query.
Оптимістичне оновлення обраного з відкатом при помилці.
OAuth-провайдер (Google або GitHub) через Better Auth.
Лічильник «скільки разів елемент додано в обране».


Що здавати
Посилання на Git-репозиторій.
README.md з інструкцією запуску: змінні оточення, команди міграцій, seed, dev.
Файл .env.example зі списком потрібних змінних (без значень).
