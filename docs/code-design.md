# Дизайн кода и данных

Этот документ раскрывает границы внутри feature. Общая структура описана в [архитектуре](./architecture.md), версии примеров — в [оглавлении](./README.md).

## Путь данных

Обычный read проходит через feature API adapter, проверку Zod и, при необходимости, mapper. React получает результат через TanStack Query. UI-состояние выводится из query и входных данных; отдельная копия ответа не создаётся.

При write UI вызывает semantic action, feature mutation выполняет API-запрос и согласует Query-кэш. Бизнес-workflow появляется между hook и API только при наличии самостоятельных правил или нескольких шагов.

## HTTP transport и feature adapter

`shared/api` отвечает за технические механизмы: URL, HTTP methods, body, response parsing, AbortSignal и нормализованные ошибки. Feature API отвечает за endpoint path, transport schema, преобразование результата и известную endpoint-specific семантику ошибки.

В starter `getCatalog` импортирует готовый клиент из `app/di`, передаёт signal, проверяет ответ и раскрывает envelope. Сокращённый пример сохраняет поведение исходника:

```ts
import { apiClient } from "#/app/di/api-client";
import { catalogResponseSchema } from "./dto/catalog.dto";
import { catalogMock } from "./dto/catalog.mock";

export async function getCatalog(signal?: AbortSignal) {
	const response = await apiClient
		.get("/examples/catalog")
		.signal(signal)
		.response(catalogResponseSchema)
		.mock(catalogMock);
	return response.items;
}
```

`/examples/catalog` — демонстрационный контракт starter, backend для него не поставляется. Для реального приложения заменяются endpoint, schema и mock на подтверждённый контракт.

`ApiRequest` реализует PromiseLike: запрос исполняется при `await`/`.then`, успешный payload проходит `safeParseAsync`. Наличие `.response(...)` обязательно. Создавайте отдельный request builder для каждого запроса, а не храните его как server-state или кэшируемый результат.

Не принимайте HTTP client параметром каждой request-функции только ради теста. По умолчанию тестируйте adapter на границе transport. Явная injection нужна при реальном выборе между клиентами или средами исполнения.

## DTO, schema и application model

Три представления данных имеют разные причины существования:

- **DTO:** формат backend, включая envelope, transport names, даты и nullable/optional semantics.
- **Domain/application model:** понятия и инварианты, которыми оперирует фича.
- **View model/projection:** удобный для UI результат применения правил.

Их не нужно обязательно дублировать. В starter `CatalogItem` намеренно совпадает с parsed item; отдельный mapper ничего бы не добавил. В `main/threads` транспортная и application-модель различаются, поэтому преобразование оправданно.

Фрагмент реальной schema из [threads-list.dto.ts](https://github.com/abraxas93/react-template/blob/a87ce5951be3000342e8fc767012b7a0c7505eed/src/features/threads/api/dto/threads-list.dto.ts):

```ts
const isoDateSchema = z.iso
	.datetime({ offset: true })
	.transform((value) => new Date(value));

export const threadListItemDtoSchema = z.object({
	_id: z.string().min(1),
	title: z.string(),
	createdAt: isoDateSchema,
	updatedAt: isoDateSchema,
	agentName: z.string().optional(),
	folders: z.array(threadFolderDtoSchema).optional(),
});

export type ThreadListItemDto = z.infer<typeof threadListItemDtoSchema>;
```

После parsing даты уже имеют тип `Date`. [mapThreadSummary](https://github.com/abraxas93/react-template/blob/a87ce5951be3000342e8fc767012b7a0c7505eed/src/features/threads/mappers/map-thread-summary.ts) переводит `_id` в `id`, отсутствующий `agentName` в `null`, отсутствующие `folders` в `[]`. Компонентам не нужно знать особенности backend.

### Правила схем

1. Описывайте envelope и вложенные объекты через `z.object(...)`; неизвестные поля ответа могут быть отброшены. Проверяйте как минимум все используемые приложением поля.
2. Поле обязательно, пока контракт не говорит обратного. `.optional()` означает разрешённое отсутствие, `.nullable()` — обязательное присутствие с допустимым `null`.
3. Не применяйте `.partial()` ко всему ответу для обхода несовпадений. Не подменяйте ошибку контракта значением «успешно, но пусто».
4. Выводите transport type через `z.infer` или `z.output`. При трансформациях `z.input` описывает сырой payload, `z.output` — результат parsing.
5. Расширяйте schema до вывода типа. Отдельную UI-модель создавайте, если дополнительные поля относятся только к отображению.
6. Для контрактно пустого ответа используйте точную schema, например `z.undefined()`. `z.any()` допустим только для намеренно игнорируемого тела, которое никто не читает и не возвращает как данные.

Search и form schemas могут иметь другие правила обработки некорректного ввода. Например, `.catch("")` в search starter нормализует плохой URL. Это не основание скрывать невалидный успешный API-ответ.

DTO остаются внутри owning feature. Общую transport schema выносите в shared только при одинаковой доменно-нейтральной семантике минимум у двух независимых features. Похожие поля `id` или `createdAt` сами по себе не оправдывают общую schema.

## Runtime mocks

Mock подключается к request на API-границе:

```ts
export const threadsListResponseMock = {
	data: [],
	error: null,
} satisfies z.input<typeof threadsListResponseDtoSchema>;
```

Этот пример из `main` показывает форму raw response. Mock лежит в `api/dto/threads-list.mock.ts`, рядом со schema. Сначала вызывается `.response(schema)`, затем `.mock(payload)`; mock проходит ту же валидацию и mapper, что и live response.

В starter mock flag передаётся при создании клиента. Request builder не читает окружение. `#hasMock` отличает отсутствие mock от намеренного mock с `undefined`, поэтому пустые mock responses поддерживаются.

Не выбирайте `mock ? fakeData : realData` в page, hook или component. Это обходит контракты и создаёт два разных data flow. `vi.mock`, service fakes и UI fixtures — тестовые инструменты, а не runtime backend-response mocks.

## Выбор владельца состояния

Начинайте с вычисляемого значения и расширяйте scope только по необходимости.

### Вычисляемые данные

Отфильтрованный список, найденный по ID сервер и доступность действий вычисляются из текущих входов. Их не нужно дублировать в `useState` и синхронизировать эффектом.

Пример `main`: `useMcpServerRunWorkflow` хранит ID выбранного сервера, а актуальный объект находит в Query-списке. Обновление серверных данных не оставляет диалог со старой копией объекта.

### URL

Params и validated search принадлежат TanStack Router. В starter поисковая строка `/examples?q=...` читается из router и меняется через `navigate`; локального зеркала `q` нет.

Значение, определяющее shareable navigation, должно переживать ссылку, Back/Forward и reload. Редактируемый draft может быть локальным, если продукт действительно различает «ввод» и «применённый фильтр» и определяет их синхронизацию.

### Server state

Данные, status и errors чтения/записи принадлежат TanStack Query. Queries, query keys и mutation hooks находятся внутри feature.

В starter `useCatalogQuery`:

```ts
export function useCatalogQuery() {
	return useQuery({
		queryKey: ["example-catalog"],
		queryFn: ({ signal }) => getCatalog(signal),
		staleTime: 60_000,
	});
}
```

Поиск здесь клиентский, поэтому `q` не входит в query key: backend-данные от него не зависят. Если server request зависит от ID, периода или фильтра, эти входы должны участвовать в key. Иначе разные запросы разделят один cache entry.

Передавайте Query AbortSignal до transport, когда запрос должен отменяться вместе с его жизненным циклом. Не все adapters в `main` уже делают это; starter catalog показывает явную передачу.

### Локальный UI и preferences

Открытие диалога, текст формы и раскрытие секции обычно принадлежат ближайшему component/page. В `main` вид MCP Registry (`list`/`grid`) — localStorage preference, а status/state/search — URL.

Storage — недоверенная и потенциально недоступная граница. `useLocalStoragePreference` проверяет значение schema и оставляет session value, если persistence заблокирован. Такая деградация допустима для preference; она не оправдывает возврат fake success при ошибке бизнес-запроса.

### Page controller, context и store

Controller объединяет существующих владельцев и возвращает semantic API экрана. Он может адаптировать navigation, feature hooks и transient UI, но не копирует query data/status или route search в собственный контейнер.

Сначала используйте узкие props. Один уровень передачи props — нормальная явная зависимость. Page-private context полезен, когда несколько descendants иначе только пересылают общие actions. Такой context должен быть типизированным, fail-fast вне provider и недоступным reusable feature/shared components.

Zustand оправдан сложным совместным client-owned состоянием и переходами, а не потребностью собрать функции в одном объекте. В starter его нет. Если он понадобится:

- создавайте page store через factory и provider на mounted scope;
- сбрасывайте его при unmount, если явно не нужен более долгий workflow;
- используйте narrow selectors; `useShallow` — для новых object/array selections;
- предоставляйте semantic actions вместо generic `setState`;
- оставляйте server data в Query, navigation в Router, обычный form draft локально.

Workflow между sibling pages имеет feature/layout scope, даже если начался на одном экране.

## Loading и ошибки

Первичная загрузка и background fetching имеют разную UI-семантику. При обновлении сохранённые данные обычно остаются видны, а `isFetching` показывает refresh. Background error не должен превращать уже загруженный экран в пустую initial-error заглушку.

`ExampleCatalog` в starter реализует pending, initial error с retry, refresh, stale-data warning и empty result. В `main/meeting-details` аналогичный принцип применён к встрече: background error показывает предупреждение рядом с доступным содержимым.

На границах различайте:

- невалидный пользовательский ввод — ошибки поля/schema;
- нарушение бизнес-правила — feature/domain failure;
- HTTP failure — `ApiError` со status, headers и неизвестным payload;
- невалидный успешный ответ — `ApiResponseValidationError`;
- render failure — route/error boundary.

Общая retry policy исключает `NonRetryableError` и HTTP 404; остальные ошибки допускают повтор при `failureCount < 3`. Это текущая общая политика, а не универсальная retry-стратегия любого endpoint. В проверенных mutations `main` явно задано `retry: false`.

Пользователь получает понятное сообщение и безопасное действие. Raw backend text, stack traces и чувствительные payload не должны попадать в UI. Глобальные диагностические обработчики не заменяют локальные loading/error views.

## Mutations и согласование кэша

Mutation hook владеет invalidation, cache updates и optimistic reconciliation. Component не должен помнить, какие списки устарели после операции.

В [useDeleteThread main](https://github.com/abraxas93/react-template/blob/a87ce5951be3000342e8fc767012b7a0c7505eed/src/features/threads/hooks/use-delete-thread.ts) реализован цикл:

1. Отменить активное чтение списка.
2. Сохранить snapshot.
3. Убрать элемент из Query-кэша.
4. При ошибке восстановить snapshot.
5. После завершения инвалидировать список для сверки с сервером.

Это иллюстрирует rollback, но не доказывает корректность любых конкурентных optimistic writes. Если несколько операций меняют один список одновременно, нужно отдельно продумать их ordering и reconciliation. Простое полное восстановление snapshot может затронуть результат соседней операции.

## Hooks, services и чистые правила

Feature hook адаптирует React lifecycle, queries и workflow к узкому UI-контракту. Pure model не должен зависеть от React, router или Query.

Самостоятельный use case полезен, если он выполняет несколько шагов, проверяет инварианты или имеет независимую причину изменения. `reviewPreCallBrief` в `main` загружает актуальную версию, проверяет принадлежность meeting и сохраняет review. Service, который лишь переименовывает один API-вызов, не добавляет такой границы.

Для нового use case при необходимой подмене зависимостей предпочитайте минимальный порт рядом с consumer: например, функции загрузки документа и сохранения review. Wire concrete implementations в composition root; не передавайте большой object с router, store, HTTP client и unrelated services.

Не создавайте interfaces механически. В существующем `main` review service напрямую импортирует API adapters; это факт реализации, а не пример explicit DI. Подробнее — [разбор сценария](./main-examples.md#подтверждение-актуальной-версии-документа).

Для сложного UI используйте discriminated union. `PreCallBriefGenerationState` различает `starting`, `running`, `loading-artifact`, `ready`, ошибки запуска, polling и чтения артефакта. Такой контракт не допускает случайные комбинации вроде «готово и одновременно ошибка запуска» и определяет правильное retry-действие.
