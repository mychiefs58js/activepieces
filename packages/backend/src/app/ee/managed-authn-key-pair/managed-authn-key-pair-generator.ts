import { promisify } from 'node:util'
import { RSAKeyPairOptions, generateKeyPair as generateKeyPairCallback } from 'node:crypto'
import { KeyPairAlgorithm } from '@activepieces/ee-shared'

const generateKeyPair = promisify(generateKeyPairCallback)

export const managedAuthnKeyPairGenerator = {
    async generate(): Promise<GeneratedKeyPair> {
        const algorithm = 'rsa'

        const options: RSAKeyPairOptions<'pem', 'pem'> = {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
        }

        const keyPair = await generateKeyPair(algorithm, options)

        return {
            ...keyPair,
            algorithm: KeyPairAlgorithm.RSA,
        }
    },
}

type GeneratedKeyPair = {
    privateKey: string
    publicKey: string
    algorithm: KeyPairAlgorithm
}
