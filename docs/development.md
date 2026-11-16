# Разработка и проверки

Этот документ относится к `codex/starter`. Крупные feature-примеры из `main` разобраны [отдельно](./main-examples.md).

## Среда и команды

Starter фиксирует Node `>=24 <25` и `pnpm@10.23.0`. Используйте `pnpm` и существующий lockfile; второй package manager не нужен.

```sh
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Development server работает на порту 5173. Без `.env` каталог использует API-boundary mock. При подключении backend настройте публичные `VITE_API_URL` и `VITE_ENABLE_MOCK`; формат и defaults определены в `app/config/env.ts`.

Основные команды:

```sh
pnpm generate-routes
pnpm check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

- `generate-routes` запускает TanStack Router CLI.
- `check` запускает Biome format/import/lint checks; `lint` — только lint.
- `typecheck` в starter сначала генерирует routes, затем запускает `tsc --noEmit`.
- `test` уже настроен как `vitest run`, без watch mode.
- `build` создаёт production bundle в `dist`; `preview` позволяет его просмотреть.

В анализируемом `main` `typecheck` содержит только `tsc --noEmit`. Не предполагайте идентичность scripts между ветками: описание выше относится к starter.

## Как выбрать место изменения

1. Сформулируйте пользовательский результат и owning feature.
2. Проверьте соседние реализации, публичные exports, schemas, tests и применимые instruction files.
3. Определите владельца: route для URL/guard/loader, page для screen composition, widget для reusable region, feature для capability, entity для общего доменного понятия, shared для нейтрального механизма.
4. Найдите уже существующую границу. Расширяйте её, если цель и причина изменения совпадают.
5. Установите подтверждённый контракт и необходимые проверки до реализации.

Новая feature нужна для самостоятельной цели с собственными правилами и поддерживаемым API. Не создавайте её только для уменьшения файла. Не извлекайте abstraction при первом синтаксическом сходстве; полезность определяется общей семантикой, независимым изменением и ясностью контракта.

## Как добавить read-сценарий

1. В owning feature добавьте `api/dto/<name>.dto.ts` с реальной response schema.
2. Добавьте named request function в `api`, используя настроенный application client и `.response(schema)`.
3. Раскройте envelope и добавьте mapper только при различии transport и application semantics.
4. Если нужен runtime mock, положите его рядом со schema в `*.mock.ts`, типизируйте через `z.input` и подключите после `.response`.
5. Создайте feature query hook/options и key, включающий все входы server request. Передайте AbortSignal, если требуется отмена.
6. Экспортируйте минимально нужный UI/hook/type через root `index.ts`.
7. Соберите page и thin file route; search проверьте на router boundary.
8. Обработайте initial loading/error, background refresh/error, empty и success.

Начальный образец — `example-catalog`. Для более сложного DTO и mapper смотрите `threads` в `main`.

## Как добавить write или workflow

Write проходит через feature mutation hook. Он владеет cache invalidation/update, а при optimistic UI — rollback и последующей сверкой.

Если сценарий включает несколько шагов и бизнес-проверки, выделите use case. Зависимости делайте узкими и явными, если это создаёт нужную boundary или точку подмены. Не создавайте service, который только переименовывает API-функцию.

Отделяйте command failure от polling failure и чтения результата. Повтор статуса уже запущенной генерации не должен случайно повторно запускать дорогой workflow. Защита от двойного клика на клиенте не является гарантией backend-idempotency.

## Тестирование по границам

### Чистая логика

Модели, filters, mappers и validation тестируются без React. Проверяйте observable behavior: преобразование дат, normalization, ordering, выбор доступного действия и невозможные комбинации.

В `main` полезные примеры — `filter-threads.test.ts`, `map-thread-summary.test.ts`, `derive-meeting-details-projection.test.ts`. Не тестируйте каждое поле простой DTO только ради повторения декларации; тест нужен для transformation/refinement или тонкой optional/nullable semantics.

### API и transport

API adapter проверяется с контролем transport boundary: method, path, query/body, раскрытие envelope и реакция на неверный response. Реальный backend не нужен для детерминированных тестов клиента.

Starter `shared/api/client.test.ts` и `request.test.ts` покрывают transport/request behavior. Runtime mock и test double решают разные задачи: первое — демонстрационный data flow приложения, второе — управление условиями проверки, включая pending и failure.

### Hooks и cache

Изолируйте QueryClient на тест/scope и очищайте его. Для детерминированных проверок отключайте retries, если retry-поведение не является предметом теста.

В `main` mutation/hook tests проверяют invalidation, optimistic removal и rollback. Для workflow важны разные способы восстановления: start failure, status failure, artifact failure и неконсистентный ответ.

### UI и интеграция

Для DOM-тестов файлы используют `// @vitest-environment jsdom`; отдельного `vitest.config.*` в анализируемых версиях нет. UI проверяется через Testing Library roles/names и пользовательские действия. Не связывайте тест с приватным hook или точным деревом CSS-обёрток.

В starter `examples-page.integration.test.tsx` собирает реальный router с memory history и Query provider: проверяет загрузку mock, фильтр в URL, empty state, переход с главной и возврат из not-found.

В `main` `mcp-server-registry-page.integration.test.tsx` полезен для нескольких согласованных UI-регионов. [Meeting route loader test](https://github.com/abraxas93/react-template/blob/a87ce5951be3000342e8fc767012b7a0c7505eed/src/routes/_app/meetings/-meeting-details-route.loader.test.ts) иллюстрирует проверку router/query boundary.

## Проверка перед завершением

Начинайте с узкой проверки; расширяйте её по затронутым границам:

- Source changes: focused `pnpm exec biome check` для изменённых файлов.
- Изменение поведения: соответствующий `pnpm test <path-to-test>`; при общей интеграции — полный `pnpm test`.
- Типы, schemas, public contracts или configuration: `pnpm typecheck`.
- Routes, configuration, dependencies или UI integration: `pnpm build`.
- Только Markdown documentation: diff, корректность ссылок, согласованность команд и фактов с исходниками. Application tests/build не требуются.

Для starter полный набор совпадает с quality workflow: frozen install, check, typecheck, test, build. CI настроен на push в `main`, pull requests и ручной запуск. Сам по себе локальный docs diff не подтверждает прохождение CI.

Проверьте итоговые файлы целиком, а не только изменённые строки: owning layer, public imports, state, DTO, error/loading semantics, accessibility и secrets. Отметьте неприменимые категории, не представляйте их как прошедшие runtime tests.

В отчёте указывайте выполненные проверки и реальные результаты. Не расширяйте задачу до миграции старого приложения или обновления зависимостей. Сохраните несвязанные изменения пользователя.

## Исходники

- [Scripts и engines starter](https://github.com/abraxas93/react-template/blob/7438bc6075fe6c32a9743c718109def39a4c459a/package.json).
- [Quality workflow starter](https://github.com/abraxas93/react-template/blob/7438bc6075fe6c32a9743c718109def39a4c459a/.github/workflows/check.yml).
- [Route integration test starter](https://github.com/abraxas93/react-template/blob/7438bc6075fe6c32a9743c718109def39a4c459a/src/pages/examples-page.integration.test.tsx).
