import {collect, JSX, ServerCollectionInstance} from '@/manifesto/collect';

const collection = collect() as ServerCollectionInstance;

let clientFetchComponent = collection.construct({"{$text}": ["{@backend}"]}) as JSX;
let text = await collection.fetch("{@backend}");
let serverFetchComponent = collection.construct(text) as JSX;

export default async function Home() {
    return (<div>{clientFetchComponent}{serverFetchComponent}</div>);
}
 