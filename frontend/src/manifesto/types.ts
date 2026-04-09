import {Structure} from '@/nextjs/structures';
import {JSX, CSSProperties, ComponentType as ReactComponentType} from 'react';

export type FieldType<Type = unknown> = Record<string, Type>;

export type ArrayType<Type = unknown> = Type[];

export type OperationType<ArgsType = unknown, ProductType = unknown> = (args?: ArgsType ) => ProductType | void;

export type Instance = Structure

export type InstanceCreator<ArgsType = unknown, ProductType extends Instance = Instance> = { createInstance: (args?: ArgsType) => ProductType }

export type ConstructorType<ArgsType = unknown, ProductType extends Instance = Instance> = new (args?: ArgsType, instanceCreator?: InstanceCreator<ArgsType, ProductType>) => ProductType;

export type CSS = CSSProperties

export type JSX = JSX.Element

export type ComponentType = ReactComponentType

export type ValueType<Type = unknown, ArgsType = unknown, ProductType = unknown, InstanceType extends Instance = Instance> = string | number | boolean | object | FieldType<Type> | ArrayType<Type> | OperationType<ArgsType, ProductType> | ConstructorType<ArgsType, InstanceType> | ComponentType | JSX | null; 

export type Value = ValueType<ValueType, ValueType, ValueType, Instance>;

export type SubType<Type, Key extends keyof Type> = Required<Pick<Type, Key>>

export type URL = string | FieldType<string>;