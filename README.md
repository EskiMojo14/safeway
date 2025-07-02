# safeway

A type-safe serialisation and validation wrapper for string storage APIs like `localStorage` and `sessionStorage`, using [Standard Schema](https://standardschema.dev/#what-schema-libraries-implement-the-spec) for validation.

## Installation

```bash
npm install safeway
```

## Usage

### Synchronous Storage

To create a type safe store, provide a key and a schema. The key will be where the value is stored, and the schema will be used to validate the value when getting it from storage. (When _setting_ a value, no runtime validation happens, only TypeScript type checking.)

Defaults to `localStorage` and `JSON` serialisation.

```ts
import { createStore } from "safeway";
import { z } from "zod";

const store = createStore("count", z.number());

store.set(1); // typed based on schema input (number)
console.log(store.get()); // 1 - typed based on schema output (number | undefined)

store.delete();
console.log(store.get()); // undefined (still typed as number | undefined)
```

Schemas are allowed to include transformations, in which case `store.set`'s parameter will be based on the schema's expected _input_.

```ts
import { createStore } from "safeway";
import { z } from "zod";

const store = createStore("count", z.number());

store.set(1); // typed based on schema input (number)
console.log(store.get()); // 1 - typed based on schema output (number | undefined)

store.delete();
console.log(store.get()); // undefined (still typed as number | undefined)
```

#### Custom serialisation

If JSON doesn't cover all your needs, you can provide your own serialisation methods (or use a compatible library like [superjson](https://github.com/blitz-js/superjson)). Should include `parse` and `stringify` methods.

```ts
import { createStore } from "safeway";
import { z } from "zod";
import superjson from "superjson";

const store = createStore("counts", z.set(z.number()), {
  serializer: superjson,
});
```

#### Custom storage

If you want to use a different storage API, you can provide it. Should include `getItem`, `setItem` and `removeItem` methods.

```ts
import { createStore } from "safeway";
import { z } from "zod";

const store = createStore("count", z.number(), {
  storage: sessionStorage,
});
```

### Building a custom store creator

Instead of providing the same config every time, you can build a custom store creator with your own defaults.

```ts
import { buildStoreCreator } from "safeway";
import { z } from "zod";
import superjson from "superjson";

const createSuperStore = buildStoreCreator({
  serializer: superjson,
  storage: sessionStorage,
});

const store = createSuperStore("count", z.number());
```

### Asynchronous Storage

`createStore` requires both storage and schemas to be synchronous. If you need asynchronous storage and/or schemas, use `createAsyncStore` instead.

The API is the same as `createStore`, but all methods return promises.

Defaults to `localStorage` and `JSON` serialisation.

```ts
import { createAsyncStore } from "safeway";
import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";

const store = createAsyncStore("count", z.number(), {
  storage: AsyncStorage,
});

await store.set(1); // typed based on schema input (number)
console.log(await store.get()); // 1 - typed based on schema output (number | undefined)

await store.delete();
console.log(await store.get()); // undefined (still typed as number | undefined)
```

Supports all the same customisation options as the synchronous storage, but with asynchronous storage methods allowed. A store creator can be built with `buildAsyncStoreCreator`.
