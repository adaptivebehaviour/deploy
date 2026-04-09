import * as Types from '@/collection/types';
import {collect} from '@/manifesto/collect';

export async function GET(request: Request) {

    const { searchParams } = new URL(request.url)
    let fetched = {}
    const fetcherId = searchParams.get('fetcher') || false;
    const target = searchParams.get('target') || false;
    if(fetcherId && target){
        const fetcher = collect().createInstance({
            id: fetcherId as string,
            target: target as string
        }) as Types.IFetcher;
        fetched = await fetcher.fetch() as Types.Fields;
    }
    return Response.json(fetched);

  }