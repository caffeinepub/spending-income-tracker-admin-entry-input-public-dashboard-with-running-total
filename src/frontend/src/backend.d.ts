import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface IncomeEntry {
    icpTokenValue: number;
    date: Time;
    personId: bigint;
    timestamp: Time;
    incomeValue: number;
    icpAmount: number;
}
export interface Person {
    id: bigint;
    name: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(personId: bigint, icpAmount: number, icpTokenValue: number, date: Time, adminToken: string, userProvidedToken: string): Promise<void>;
    createPerson(name: string, adminToken: string, userProvidedToken: string): Promise<bigint>;
    deleteEntry(timestamp: Time, adminToken: string, userProvidedToken: string): Promise<void>;
    deletePerson(personId: bigint, adminToken: string, userProvidedToken: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntries(): Promise<Array<IncomeEntry>>;
    getEntriesByPerson(personId: bigint): Promise<Array<IncomeEntry>>;
    getPerson(personId: bigint): Promise<Person | null>;
    getPersons(): Promise<Array<Person>>;
    getRolling30DayIncomeSum(personId: bigint): Promise<number>;
    getTotalIncome(): Promise<number>;
    getTotalIncomeByPerson(personId: bigint): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile, adminToken: string, userProvidedToken: string): Promise<void>;
}
