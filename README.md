# safe-storage

A type safe wrapper for string storage APIs like `localStorage` and `sessionStorage`, using [Standard Schema](https://standardschema.dev/#what-schema-libraries-implement-the-spec) for validation. Includes serialisation and deserialisation methods for non-string values.

## Installation

```bash
npm install safe-storage
```

## Usage

_Note_: Schema is only used for validation when getting value from storage. When _setting_ a value, no runtime validation happens, only TypeScript type checking.

### Synchronous Storage

Defaults to `localStorage` and `JSON` serialisation.

```ts
import { createStorage } from "safe-storage";
import { z } from "zod";

const storage = createStorage("count", z.number());

storage.set(1); // typed based on schema
console.log(storage.get()); // typed based on schema

storage.delete();
console.log(storage.get()); // undefined
```

#### Custom serialisation

If JSON doesn't cover all your needs, you can provide your own serialisation methods (or use a compatible library like [superjson](https://github.com/blitz-js/superjson)). Should include `parse` and `stringify` methods.

```ts
import { createStorage } from "safe-storage";
import { z } from "zod";
import superjson from "superjson";

const storage = createStorage("counts", z.set(z.number()), {
  serializer: superjson,
});
```

#### Custom storage

If you want to use a different storage API, you can provide it. Should include `getItem`, `setItem` and `removeItem` methods.

```ts
import { createStorage } from "safe-storage";
import { z } from "zod";

const storage = createStorage("count", z.number(), {
  storage: sessionStorage,
});
```

### Building a custom storage creator

Instead of providing the same config every time, you can build a custom storage creator with your own defaults.

```ts
import { buildStorageCreator } from "safe-storage";
import { z } from "zod";
import superjson from "superjson";

const createStorage = buildStorageCreator({
  serializer: superjson,
  storage: sessionStorage,
});

const storage = createStorage("count", z.number());
```

### Asynchronous Storage

`createStorage` requires both storage and schemas to be synchronous. If you need asynchronous storage and/or schemas, use `createAsyncStorage` instead.

Defaults to `localStorage` and `JSON` serialisation.

```ts
import { createAsyncStorage } from "safe-storage";
import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = createAsyncStorage("count", z.number(), {
  storage: AsyncStorage,
});

await storage.set(1); // typed based on schema
console.log(await storage.get()); // typed based on schema

await storage.delete();
console.log(await storage.get()); // undefined
```

Supports all the same customisation options as the synchronous storage, but with asynchronous storage methods allowed. A storage creator can be built with `buildAsyncStorageCreator`.
