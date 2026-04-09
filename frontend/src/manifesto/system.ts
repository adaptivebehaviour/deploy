import fs from 'fs'
import path from 'path'
import {getLogger} from '@/manifesto/logging'

export const ROOT = path.resolve(__dirname, process.cwd())

const logging = getLogger()

function validatePath(inputPath: string): string {
    const resolvedPath = path.resolve(ROOT, inputPath)
    if (!resolvedPath.startsWith(ROOT)) {
        logging.error(`Invalid path at manifesto-system-file: ${resolvedPath}`)
        return ""}
    return resolvedPath}

export function list(inputPath: string): string[] {
    const validatedPath = validatePath(inputPath)
    return fs.readdirSync(validatedPath)}

export function exists(inputPath: string): boolean {
    const validatedPath = validatePath(inputPath)
    return fs.existsSync(validatedPath)
}

export function readFile(inputPath: string, asLines?: boolean): string | string[] {
    const validatedPath = validatePath(inputPath)
    if (exists(validatedPath)) {
        const file = fs.readFileSync(validatedPath, { encoding: 'utf8' })
        return asLines ? file.split('\n') : file
    }
    return ""
}

export function read(inputPath: string): string {
    return readFile(inputPath) as string
}

export function readLines(inputPath: string): string[] {
    return readFile(inputPath, true) as string[]
}

export async function readFileAsync(inputPath: string, asLines?: boolean): Promise<string | string[]> {
    const validatedPath = validatePath(inputPath)
    if (exists(validatedPath)) {
        const file = await fs.promises.readFile(validatedPath, { encoding: 'utf8' })
        return asLines ? file.split('\n') : file
    }
    return ""
}

export async function readAsync(inputPath: string): Promise<string> {
    return await readFileAsync(inputPath) as string
}

export async function readLinesAsync(inputPath: string): Promise<string[]> {
    return await readFileAsync(inputPath, true) as string[]
}

export function writeFile(inputPath: string, data: string) {
    const validatedPath = validatePath(inputPath)
    fs.writeFileSync(validatedPath, data)
}

export async function writeFileAsync(inputPath: string, data: string) {
    const validatedPath = validatePath(inputPath)
    await fs.promises.writeFile(validatedPath, data)
}

export function readJSON(inputPath: string): object | undefined {
    const file = read(inputPath)
    return file === "" ? undefined : JSON.parse(file)
}

export async function readJSONAsync(inputPath: string): Promise<object | false> {
    const file = await readAsync(inputPath)
    return file === "" ? false : JSON.parse(file)
}

export function writeJSON(inputPath: string, data: object) {
    writeFile(inputPath, JSON.stringify(data))
}

export async function writeJSONAsync(inputPath: string, data: object) {
    await writeFileAsync(inputPath, JSON.stringify(data))
}

export function deleteFile(inputPath: string) {
    const validatedPath = validatePath(inputPath)
    fs.unlinkSync(validatedPath)
}
