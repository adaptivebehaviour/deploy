import {getManifest} from '@/manifesto/manifest'

export type LogLevel = { value: number, flag: string }

export type Log = { level: LogLevel, time: Date, message: string }

export type LogConfig = {
    level?: LogLevel 
    path?: string
    session?: boolean}

export interface Logging {
    logs: Log[]
    level: LogLevel
    path: string
    session: boolean
    setLevel(level: LogLevel): void
    startSession(level: LogLevel): void
    endSession(level: LogLevel): void
    log(level: LogLevel, message: string): void
    info(message: string): void
    warn(message: string): void
    error(message: string): void
    fatal(message: string): void
    debug(message: string): void
    output(log?: Log): string}

export class Logger implements Logging {
    static OFF: LogLevel = { value: 0, flag: 'OFF' }
    static INFO: LogLevel = { value: 1, flag: 'INFO' }
    static WARN: LogLevel = { value: 2, flag: 'WARN' }
    static ERROR: LogLevel = { value: 3, flag: 'ERROR' }
    static FATAL: LogLevel = { value: 4, flag: 'FATAL' }
    static DEBUG: LogLevel = { value: 5, flag: 'DEBUG' }
    
    logs: Log[]
    level: LogLevel
    path: string
    session: boolean
    
    constructor(config?: LogConfig) {
        this.logs = []
        this.level = config?.level || Logger.OFF
        this.path = config?.path || ""
        this.session = config?.session || false
        if (this.session) { this.startSession(this.level) }
    }

    setLevel(level: LogLevel) { this.level = level }

    startSession(level: LogLevel) {
        if (level.value <= this.level.value) {
            this.session = true
            this.logs = []
        }
    }

    endSession(level: LogLevel) {
        let output = ""
        if (level.value <= this.level.value) {
            output = this.output()
            this.logs = []
            this.session = false
        }
        return output
    }

    log(level: LogLevel, message: string) {
        if (level.value <= this.level.value) {
            if (this.session) { this.logs.push({ level: level, time: new Date(), message: message })
            } else { this.output({ level: level, time: new Date(), message: message }) }
        }
    }

    info(message: string) { this.log(Logger.INFO, message) }

    warn(message: string) { this.log(Logger.WARN, message) }

    error(message: string) { this.log(Logger.ERROR, message) }

    fatal(message: string) { this.log(Logger.FATAL, message) }

    debug(message: string) { this.log(Logger.DEBUG, message) }

    output(log?: Log) {
        let output = log ? (log.level.flag + ": " + log.time + '\n' + log.message + '\n') : ''
        if (this.session) {
            for (const log of this.logs) {
                output += (log.level.flag + ": " + log.time + '\n' + log.message + '\n')
            }
        }
        console.log(output)
        return output
    }
}

export function getLogger(level?: string){
    const manifestLogging: any = structuredClone(getManifest().logging)
    const logging = typeof manifestLogging === 'string' ? { global: manifestLogging } : manifestLogging
    logging.level = level || logging.level
    return new Logger(logging)
}
