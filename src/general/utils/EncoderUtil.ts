import GeneralUtils from "./GeneralUtils"

class Encoder {
    static binaryFlagsEncode(flags: boolean[]) {
        const reduced = flags.reduce((prev, curr, i) => prev + (curr ? 2 ** i : 0), 0)
        const output = flags.length.toString().padStart(2, "0") + reduced.toString()
        return output
    }

    static binaryFlagsDecode(encoded: string) {
        const length = parseInt(encoded.slice(0, 2))
        const num = parseInt(encoded.slice(2))
        const flags: boolean[] = []
        for (let i = 0; i < length; i++) {
            flags.push((num & (2 ** i)) !== 0)
        }
        return flags
    }
}

export { Encoder }

const output = Encoder.binaryFlagsEncode([true, false, true, false, false, true, true, false])
console.log(output)

console.log(Encoder.binaryFlagsDecode(output))

let bool = []

for (let i = 0; i < 24; i++) {
    bool.push(true)
}
console.log(Encoder.binaryFlagsEncode(bool))