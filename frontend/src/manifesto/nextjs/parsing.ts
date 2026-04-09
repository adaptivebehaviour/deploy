import * as Types from '@/nextjs/types'
import * as Utils from '@/nextjs/utils';

export enum Symbol {
    
    FETCH = '@',
    
    ID = '$',
    
    REF = '#',
    
    ARG = '%',
    
    QUERY = '?',
    
    ASSIGNMENT = '=',
    
    AND = '&',
    
    OR = '|',
    
    NOT = '!',
    
    WILD = '*',
    
    PATH = '>',
    
    ARRAY = '[]',
    
    PARSING = '{}',
    
    CODE = '<>'
}

export class Parser {

    factory: Types.Factories | null;

    token: string;

    reference: Types.Fields | null;

    body: string;

    queries: Types.Fields;

    isParseable: boolean;

    parsed: Types.Value;

    constructor(token: string, factory: Types.Factories | null, reference: Types.Fields | null = null) {
        this.factory = factory;
        this.token = token;
        this.reference = reference;
        this.body = '';
        this.queries = {};
        this.isParseable = false;    
        this.parsed = this.token;

        if (this.token.length > 2) {
            if (this.token.startsWith(Symbol.PARSING[0]) && this.token.endsWith(Symbol.PARSING[1]) && !/\s/.test(this.token)) {
                this.body = this.token.substring(1, this.token.length - 1);
                this.isParseable = Object.values(Symbol).some(symbol => {
                    return symbol.length === 1 ? this.body.startsWith(symbol) : this.body.includes(symbol[0]) && this.body.includes(symbol[1]) && this.body.indexOf(symbol[0]) < this.body.indexOf(symbol[1])});
            }
        }
        if(this.isParseable){
            const tokens = [];
            let token = '';
            for (const character of this.body) {
                if (character === Symbol.PARSING[0]) {
                    if (token.length > 0) {
                        tokens.push(token);
                        token = '';
                    }
                    token += character;
                }
                else if (character === Symbol.PARSING[1]) {
                    token += character;
                    tokens.push(token);
                    token = '';
                }
                else {
                    token += character;
                }
            }
            if (token.length > 0) {
                tokens.push(token);
            }
            if(tokens.length === 1) {
                this.parsing();
            }
            else {
                this.parsed = tokens.map(token => Parser.parse(token, this.factory!, this.reference)).join('');
            }
        }
    }

    parseQueries(): Types.Fields | false {
        if(this.body.includes(Symbol.QUERY)){
            const queryIndex = this.body.indexOf(Symbol.QUERY);
            const query = this.body.slice(queryIndex);
            this.queries = new Parser(this.parsing(query) as string, null).parsed as Types.Fields;
            return this.queries;
        }
        return false;
    }

    fetch(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.FETCH) : Symbol.FETCH + token;}
        const args = this.body.slice(1);
        if(Utils.isURL(args)){
            this.parsed = { uri: args }
            return this.parsed;
        }

        this.parseQueries();
        const query = this.body.slice(this.body.indexOf(Symbol.QUERY));
        let fetcher = this.body.slice(0, this.body.indexOf(Symbol.QUERY));
        const idIndex = this.body.indexOf(Symbol.ID);
        const id = idIndex > -1 ? this.body.slice(idIndex, this.body.indexOf(Symbol.QUERY)) : null;
        if(id !== null){
            fetcher = this.body.slice(0, idIndex);
            const construct = Parser.parse(this.parsing(id) as string, this.factory, this.reference) as Types.Fields;
            const fetch = Parser.parse(this.parsing(fetcher + query) as string, this.factory, this.reference) as Types.Fields;
            construct.content = [fetch]
            this.parsed = construct;
            return this.parsed
        }
        this.parsed = Parser.parse(this.parsing(Symbol.ID + fetcher.slice(1)) as string, this.factory, this.reference);
        (this.parsed as Types.FetcherProps).target = query.slice(1)
        return this.parsed;
    }

    id(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.ID) : Symbol.ID + token;}
        let id = this.body.slice(1);
        if(this.parseQueries()){
            id = id.slice(0, id.indexOf(Symbol.QUERY));
        }
        if(this.factory?.hasConstruct(id)){
            const structure = this.factory.getConstruct(id) as Types.IdFields;
            const mergedStructure = Utils.mergeStructures(structure as Types.MergeData, this.queries as Types.MergeData) as Types.Structures;
            this.parsed = Parser.parseStructure(mergedStructure, this.factory, this.reference) as Types.Structures;
            return this.parsed;
        }
        return false;
    }

    ref(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.REF) : Symbol.REF + token;}
        if(this.reference){
            const ref = this.body.slice(1)
            if(Object.hasOwn(this.reference, ref)){
                this.parsed = this.reference[ref];
                return this.parsed;
            }
        }
        return false;
    }

    arg(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.ARG) : Symbol.ARG + token;}
        if(this.reference){
            const ref = this.body.slice(1)
            if(Object.hasOwn(this.reference, ref)){
                this.parsed = this.reference[ref];
                return this.parsed;
            }
        }
        return false;
    }

    query(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.QUERY) : Symbol.QUERY + token;}
        const query = this.body.slice(1);
        const elements = query.includes(Symbol.AND) ? query.split(Symbol.AND) : [query];
        const parsed: Types.Fields = {};
        elements.forEach(element => {
            if(element.includes(Symbol.ASSIGNMENT)){
                const assignmentElements = element.split(Symbol.ASSIGNMENT);
                parsed[assignmentElements[0]] = assignmentElements[1];
            }
            else{
                parsed.content = parsed.content ? [...(parsed.content as Types.Value[]), [element]] : [element];
            }
        })
        this.parsed = parsed;
        return this.parsed;
    }
    and(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.AND) : Symbol.AND + token;}
    }
    or(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.OR) : Symbol.OR + token;}
    }
    not(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.NOT) : Symbol.NOT + token;}
    }
    wild(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.WILD) : Symbol.WILD + token;}
    }

    path(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.PATH) : Symbol.PATH + token;}
        this.parsed = this.body.split(Symbol.PATH);
        return this.parsed;
    }
    array(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.ARRAY) : Symbol.ARRAY[0] + token + Symbol.ARRAY[1];}
    }

    parsing(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.PARSING) : Symbol.PARSING[0] + token + Symbol.PARSING[1];}
        const symbol = this.body[0]
        let key = Object.entries(Symbol).find(([key, value]) => value.startsWith(symbol))?.[0];
        key = key?.toLowerCase() as string;
        if(key !== 'parsing'){
            const parser = this as unknown as Record<string, () => Types.Value>
            if (typeof parser[key] === 'function') {
                parser[key]();
            }
        }
    }
    code(token?: string, is: boolean = false){
        if(token){return is ? Parser.isSymbol(token, Symbol.CODE) : Symbol.CODE[0] + token + Symbol.CODE[1];}
    }

    parseToken(token: string, reference: Types.Fields | null = null){
        return new Parser(token, this.factory, reference ?? this.reference).parsed;
    }

    getParser(token: string | Types.Fields, reference: Types.Fields | null = null){
        return typeof token === 'string' ? new Parser(token, this.factory, reference ?? this.reference) : new StructureParser(token, this.factory, reference ?? this.reference);
    }

    static parse(token: string | Types.Fields, factory: Types.Factories | null, reference: Types.Fields | null = null): Types.Value {
        return typeof token === 'string' ? new Parser(token, factory, reference).parsed : new StructureParser(token, factory, reference).parsed;
    }

    static unwrap(token: string): string {
        for(const symbol of Object.values(Symbol)){
            if(symbol.length === 1 && token.startsWith(symbol)){
                return token.slice(1);
            }
            else if(token.startsWith(symbol[0]) && token.endsWith(symbol[1])){
                return token.slice(1, -1);
            }
        }
        return token;
    }

    static wrap(token: string): string {
        return token.startsWith(Symbol.PARSING[0]) && token.endsWith(Symbol.PARSING[1]) ? token : Symbol.PARSING[0] + token + Symbol.PARSING[1];
    }

    static parseText(text: string, factory: Types.Factories | null, reference: Types.Fields | null = null): string {
        return text.split(' ').map(token => new Parser(token, factory, reference).parsed).join(' ');
    }

    static parseStructure(structure: Types.Fields, factory: Types.Factories | null, reference: Types.Fields | null = null): Types.Fields {
        const parser = new StructureParser(structure, factory, reference);
        return parser.parsed;
    }

    static skipParsing(value: Types.Value, symbol: Symbol): boolean {
        return typeof value === 'string' ? Parser.isSymbol(value, symbol) : false;
    }

    static isSymbol(text?: string, symbol?: Symbol): boolean {
        if(text && symbol){
            let body = text;
            if(symbol === Symbol.PARSING){
                return new RegExp(`^\\${Symbol.PARSING[0]}.*\\${Symbol.PARSING[1]}$`).test(text)
            }
            else if(Parser.isSymbol(body, Symbol.PARSING)){
                body = Parser.unwrap(body);
            }
            return symbol.length === 1 ? body.startsWith(symbol) : new RegExp(`^\\${symbol[0]}.*\\${symbol[1]}$`).test(text);
        }
        return false;
    }

    static isParseableToken(token: string): boolean {
        if (token.length > 2) {
            if (token.startsWith(Symbol.PARSING[0]) && token.endsWith(Symbol.PARSING[1]) && !/\s/.test(token)) {
                const body = token.substring(1, token.length - 1);
                return Object.values(Symbol).some(symbol => {
                    return symbol.length === 1 ? body.startsWith(symbol) : body.includes(symbol[0]) && body.includes(symbol[1]) && body.indexOf(symbol[0]) < body.indexOf(symbol[1])});
            }
        }
        return false;
    }

    static isConstructableToken(token: string): boolean {
        if (token.length > 2) {
            if (token.startsWith(Symbol.PARSING[0]) && token.endsWith(Symbol.PARSING[1]) && !/\s/.test(token)) {
                const body = token.substring(1, token.length - 1);
                return [Symbol.FETCH, Symbol.ID].some(symbol => {
                    return symbol.length === 1 ? body.startsWith(symbol) : body.includes(symbol[0]) && body.includes(symbol[1]) && body.indexOf(symbol[0]) < body.indexOf(symbol[1])});
            }
        }
        return false;
    }
}

export class StructureParser {

    structure: Types.Fields;

    factory: Types.Factories | null;

    reference: Types.Fields | null;

    parsed: Types.Fields;

    constructor(structure: Types.Fields, factory: Types.Factories | null, reference: Types.Fields | null = null) {

        this.structure = structure;
        this.factory = factory;
        this.reference = reference;
        this.parsed = {};

        if(Object.keys(this.structure).length === 1){
            const key = Object.keys(this.structure)[0];
            const parser = new Parser(key, this.factory, this.reference);
            if(parser.isParseable){
                let parsedStructure = parser.parsed as Types.Fields;
                const value = this.structure[key];
                if(Array.isArray(value)){
                    parsedStructure.content = value.map((item: Types.Value) => Parser.parse(item as string | Types.Fields, this.factory, this.reference));
                }
                else{
                    parsedStructure = Parser.parse(value as string | Types.Fields, this.factory, parsedStructure) as Types.Fields;
                }
                this.structure = parsedStructure;
            }
        }
        for(const [key, value] of Object.entries(this.structure)){
            if(key === 'content'){
                this.parsed.content = Utils.arg(value).map((item: Types.Value) => {
                    return Parser.skipParsing(item, Symbol.REF) ? item : this.parseProperty(item);
                });
            }
            else{
                this.parseProperty(value, key);
            }
        }
    }

    parseProperty(value: Types.Value, key?: string): Types.Value {
        let parsedValue = value;
        if((Array.isArray(parsedValue) || typeof parsedValue === 'string' || typeof parsedValue === 'object') && parsedValue !== null){
            if(Array.isArray(value)){
                parsedValue = value.map((item: Types.Value) => Parser.parse(item as string | Types.Fields, this.factory, this.structure));
            }
            else{
                parsedValue = Parser.parse(value as string | Types.Fields, this.factory, this.structure);
            }
        }
        if(key){
            this.parsed[key] = parsedValue;
        }
        else{
            return parsedValue;
        }
        return value;
    }
}

