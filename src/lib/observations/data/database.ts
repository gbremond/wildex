import type { Observation } from '../model/observation';
import type { Trip } from '../model/trip';

type Stores = { observations: Observation; trips: Trip };
type StoreName = keyof Stores;

const DATABASE_NAME = 'wildex';
const VERSION = 1;

let opening: Promise<IDBDatabase> | undefined;

function asPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function openDatabase(): Promise<IDBDatabase> {
	opening ??= new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, VERSION);

		request.onupgradeneeded = () => {
			request.result.createObjectStore('observations', { keyPath: 'id' });
			request.result.createObjectStore('trips', { keyPath: 'id' });
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

	return opening;
}

export async function readAll<Name extends StoreName>(store: Name): Promise<Stores[Name][]> {
	const database = await openDatabase();
	return asPromise(database.transaction(store).objectStore(store).getAll());
}

export async function writeAll<Name extends StoreName>(
	store: Name,
	records: Stores[Name][]
): Promise<void> {
	const database = await openDatabase();
	const transaction = database.transaction(store, 'readwrite');

	for (const record of records) transaction.objectStore(store).put(record);

	await new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

export async function remove(store: StoreName, id: string): Promise<void> {
	const database = await openDatabase();
	await asPromise(database.transaction(store, 'readwrite').objectStore(store).delete(id));
}
