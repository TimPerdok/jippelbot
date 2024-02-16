import lzString from "lz-string";

export type Payload<T> = {
    command: string,
    subcommand?: string,
    payload: T
}

export default class CustomIdentifier {

    static toCustomId<T>(str: Payload<T>): string {
        return lzString.compressToUTF16(JSON.stringify(str))
    }


    static fromCustomId<T>(str: string): Payload<T> {
        return JSON.parse(lzString.decompressFromUTF16(str)) as Payload<T>
    }



}
