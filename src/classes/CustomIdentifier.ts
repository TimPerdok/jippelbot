import lzString from "lz-string";


export default class CustomIdentifier {

    static toCustomId(str: object): string {
        return lzString.compressToUTF16(JSON.stringify(str))
    }


    static fromCustomId<T>(str: string): T {
        return JSON.parse(lzString.decompressFromUTF16(str)) as T
    }



}
