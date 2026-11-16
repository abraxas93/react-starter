# Стиль кода и UI

Соглашения основаны на конфигурации starter, `AGENTS.md` и реализациях `main`. Файлы большого приложения местами отформатированы неодинаково; нормативный стиль определяется Biome, а не случайным соседним фрагментом.

## TypeScript и модули

Проект использует ESM и strict TypeScript. В `tsconfig.json` включены `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` и `noUncheckedSideEffectImports`. Target — ES2022, module resolution — bundler, JSX — `react-jsx`.

Практические следствия:

- Используйте `import type` и `export type`, если значение нужно только типовой системе.
- Проверяйте `unknown` на runtime-границе; не превращайте его в доверенные данные через широкий cast.
- Выводите тип из canonical runtime schema, а не дублируйте enum/union вручную.
- Используйте union по `kind`, `status` или `type` для взаимоисключающих вариантов.
- Для коллекций, которые consumer только читает, уместны `readonly` массивы.
- Не обходите strictness с `any`, `@ts-ignore` и необоснованными assertions.
- Используйте явные типы там, где они фиксируют внешний контракт; локальный понятный результат допускает inference.

`type` и `interface` встречаются в исходниках. Жёсткого требования выбрать только один нет: для union естественен `type`, для object contract допустимы оба. Не создавайте массовый style-only diff ради замены одного другим.

## Именование и размещение

Преобладающее соглашение — kebab-case для файлов и папок:

- `mcp-server-registry`, `meeting-details`, `pre-call-brief` — feature names по предметной области;
- `meeting-details-page.tsx`, `feedback-dialog.tsx` — React-файлы;
- `use-delete-thread.ts`, `use-mcp-server-run-workflow.ts` — hooks;
- `threads.api.ts`, `get-catalog.api.ts` — adapters;
- `threads-list.dto.ts`, `catalog.mock.ts` — schema и raw runtime mock;
- `map-thread-summary.ts` — mapper;
- `feedback.schema.ts` — проверка пользовательского ввода;
- `*.test.ts`, `*.test.tsx`, `*.integration.test.tsx` — проверки.

Компоненты именуются PascalCase (`MeetingDetailsPage`), hooks — `useCapability`, функции и локальные значения — camelCase. Название должно сообщать действие или понятие: `requestRun`, `selectView`, `mapThreadSummary`.

В `main` используются и colocated tests, и feature `__tests__`. Следуйте ближайшему подходящему образцу. Не создавайте одновременно `utils` и `lib` без чёткого различия; предпочитайте `mcp-errors.ts` безымянному `helpers.ts`.

## Импорты и exports

Используйте реальные алиасы конфигурации:

```ts
import { ExampleCatalog } from "#/features/example-catalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCatalogQuery } from "../hooks/use-catalog-query";
```

`#` открывает весь `src`, `@` — `src/shared`. Внешние consumers feature/widget/entity используют публичный `index.ts`. Внутренние modules могут обращаться к соседям напрямую, чтобы не замыкаться через собственный barrel.

В репозитории встречаются extensionless импорты и `.ts`/`.tsx`; конфигурация разрешает TypeScript extensions. Для небольшого изменения сохраняйте локальную последовательность, не переписывайте соседние импорты без причины.

Предпочитайте именованные exports, как в feature APIs проекта. Не добавляйте default export только ради стиля и не расширяйте публичную поверхность кодом, у которого нет внешнего consumer.

## Форматирование

Biome настроен на tabs, double quotes, recommended lint rules и organize imports. Используйте formatter для деталей переносов, semicolons и trailing commas; отдельные ручные правила для них не нужны.

```sh
pnpm exec biome check src/features/example-catalog
pnpm check
```

Первый вариант показывает focused check существующей starter feature; для изменения указывайте реальные затронутые source files. `pnpm check` не означает автоматическое исправление. Применение formatter/fixes должно оставаться в пределах задачи.

В текущем `biome.json` основной охват — `src`, `.vscode`, `index.html`, `vite.config.ts`. `routeTree.gen.ts` и `styles.css` исключены. Markdown в `docs` этим check не проверяется.

## React

Используйте function components и hooks. Render должен быть чистым: входы и state не мутируются, запросы и browser effects не запускаются во время render.

Component разделяется по ответственности и причине изменения:

- page выражает регионы экрана и взаимодействие фич;
- connected feature component выбирает данные и состояния;
- presentational component получает narrow data/callback props;
- primitive инкапсулирует нейтральные behavior, styling и accessibility.

Не дробите JSX только ради количества строк. Выделение полезно, когда появляется собственное поведение, subscription, boundary или самостоятельный UI-контракт.

### State, events и effects

Производное значение вычисляйте при render. Пользовательское действие выполняйте в event handler. Effect используйте для синхронизации с внешней системой или lifecycle, а не для зеркалирования props/query в state.

Например, выбор фильтра MCP Registry вызывает `navigate` в callback; поиск сервера по выбранному ID — обычное вычисление. В meeting controller effect канонизирует URL на основе доступных views: это внешняя синхронизация, а не дополнительный владелец projection.

Зависимости hooks должны быть корректны. Не отключайте lint rule, чтобы скрыть stale closure. Memoization нужна при измеримой или структурно очевидной проблеме identity/cost; каждый callback не требует `useCallback` автоматически.

У элементов изменяемого списка используйте стабильный ID. Продумывайте async races и отмену через Query/AbortSignal; отключение кнопки после render само по себе не гарантирует защиту от двух синхронных запусков.

### Props и формы

Props должны выражать допустимый контракт. Для связанных взаимоисключающих состояний используйте discriminated union вместо набора независимых boolean flags. Не передавайте весь store snapshot, когда child нужны два значения и один callback.

Форма владеет draft, отображением validation и submission event. Она возвращает проверенные значения через callback, а API-запрос выполняет owning mutation/workflow. В [FeedbackDialog main](https://github.com/abraxas93/react-template/blob/a87ce5951be3000342e8fc767012b7a0c7505eed/src/features/user-feedback/components/feedback-dialog.tsx) schema очищает и валидирует message, UI показывает field error, наружу уходит `result.data`.

Там используется синхронный callback открытия почтового приложения. Для новой asynchronous server form время закрытия, pending и сохранение draft при ошибке должны соответствовать её реальному workflow; копировать немедленное закрытие этого примера автоматически не следует.

## Tailwind и тема

Layout, spacing, typography, responsive и interaction states выражаются Tailwind utilities. Theme-dependent цвета задаются семантически:

```tsx
<section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
	<p className="text-sm text-muted-foreground">No examples match your search.</p>
</section>
```

Используйте `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `text-muted-foreground`, `border-border`, `ring-ring`, `text-destructive` по смыслу. Не закрепляйте цвет фичи через `bg-[#...]`, `text-zinc-600` или inline color, если существует соответствующий token.

`src/styles.css` содержит CSS variables для light/dark и их Tailwind mapping через `@theme inline`. В `main` есть продуктовый Barlow и палитра Cprime; это оформление конкретного приложения, не универсальное требование starter.

Новый recurring theme role требует осмысленного token с light/dark значениями. Arbitrary value допустим для обоснованного локального размера, но не должен становиться способом обхода темы. Повторяющийся визуальный контракт оформляется variant; feature-specific layout остаётся у consumer.

Для слияния классов используйте существующий `cn` (`clsx` + `tailwind-merge`). Не создавайте конкурирующий class-name helper.

## shadcn/ui и Radix

`components.json` задаёт `radix-nova`, TSX, CSS variables и Lucide. Компоненты в `shared/components/ui` — исходный код репозитория: их можно адаптировать, сохраняя нейтральность и reusable contract.

Starter содержит только Button, Card, Input и Label. При необходимости добавляйте существующий primitive через:

```sh
pnpm exec shadcn add dialog
```

Не создавайте локальную стилизованную копию Button ради другого вида. Используйте готовый variant или добавьте reusable semantic variant, если он действительно нужен нескольким consumers. Бизнес-решения и transport не входят в primitive.

Перед использованием проверяйте локальный API. Например, `Button` поддерживает `asChild` через Radix Slot:

```tsx
<Button asChild variant="outline">
	<Link to="/examples">Explore the example</Link>
</Button>
```

Так сохраняется семантика ссылки и стиль кнопки. Не переносите Base UI `render`-контракт в Radix `asChild` wrapper. Наличие `@base-ui/react` среди зависимостей `main` не отменяет repository rule использовать Radix-based shadcn.

Общие constraints, scrolling и placement задаёт ближайший общий layout. Реализация `PageLayout` из `main` отсутствует в starter и не является обязательной обёрткой каждого нового экрана.

## Доступность

- Для действия используйте button, для навигации — link.
- Сохраняйте keyboard navigation, visible focus и focus-management Radix.
- Связывайте Label и control через `htmlFor`/`id`.
- Связывайте validation error через `aria-invalid` и `aria-describedby`.
- Давайте icon-only controls доступные имена.
- Не кодируйте статус только цветом.
- Проверяйте UI по roles и names, а не по внутренней структуре DOM.

Radix даёт основу, но не может самостоятельно назвать feature-specific control или объяснить ошибку поля.

## Ошибки, комментарии и безопасность

Известную ошибку преобразуйте в понятное сообщение у соответствующей границы. Не показывайте stack trace и raw server payload. Не проглатывайте failure ради пустого «успеха»; осмысленная деградация вроде недоступного сохранения UI preference должна иметь явную причину.

Комментарии объясняют инвариант, контракт или неожиданное ограничение. Не оставляйте закомментированный код, debug logging и необъяснённые TODO. Намеренные lint exceptions требуют узкой причины; например, promise-like request объясняет наличие собственного `then`.

Не помещайте secrets в `VITE_*`: эти значения публичны и попадают в bundle при build. Ввод, search, storage и HTTP payload недоверенны. Client guard и скрытая кнопка не являются backend authorization. HTML-rendering требует отдельно установленной sanitization boundary; наличие rich-text UI в `main` не делает произвольный HTML безопасным.

## Исходники соглашений

- [TypeScript configuration starter](https://github.com/abraxas93/react-template/blob/7438bc6075fe6c32a9743c718109def39a4c459a/tsconfig.json).
- [Biome configuration starter](https://github.com/abraxas93/react-template/blob/7438bc6075fe6c32a9743c718109def39a4c459a/biome.json).
- [Button starter](https://github.com/abraxas93/react-template/blob/7438bc6075fe6c32a9743c718109def39a4c459a/src/shared/components/ui/button.tsx).
- [Theme tokens main](https://github.com/abraxas93/react-template/blob/a87ce5951be3000342e8fc767012b7a0c7505eed/src/styles.css).
