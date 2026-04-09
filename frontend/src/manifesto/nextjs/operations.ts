export * from '@/nextjs/auth';

export function operation(name?: string){
    console.log('Undefined operation' + (name ? ': ' + name : ''));
}

export function click(event?: MouseEvent) {
        event?.preventDefault()
        return event}

