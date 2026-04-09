'use server'
import {Fields} from '@/nextjs/types';

export async function formAction(data: Fields)
{
    console.log("Form action received data: ", data)
    return data
}
