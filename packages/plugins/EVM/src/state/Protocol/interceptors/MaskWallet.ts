import { toHex } from 'web3-utils'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { SharedContextSettings, Web3StateSettings } from '../../../settings'

export class MaskWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { Protocol } = Web3StateSettings.value
        const { hasNativeAPI, send, account, chainId, signTransaction, signPersonalMessage, signTypedData } =
            SharedContextSettings.value

        // redirect to native app
        if (hasNativeAPI) {
            try {
                const response = await send(context.request)
                context.end(new Error(response.error?.message ?? 'Unknown Error'), response.result)
            } catch (error) {
                context.abort(error)
            } finally {
                await next()
            }
            return
        }

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(toHex(chainId.getCurrentValue()))
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([account])
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                const config = context.config

                if (!config?.from || !config?.to) {
                    context.abort(new Error('Invalid JSON payload.'))
                    break
                }
                try {
                    const rawTransaction = await signTransaction(config.from as string, config)

                    if (!rawTransaction) {
                        context.abort(new Error('Failed to sign transaction.'))
                        break
                    }

                    const connection = await Protocol?.getConnection?.({
                        chainId: context.chainId,
                    })
                    const tx = await connection?.sendSignedTransaction?.(rawTransaction, {
                        chainId: context.chainId,
                    })
                    context.write(tx)
                } catch (error) {
                    context.abort(error, 'Failed to send transaction.')
                }
                break
            case EthereumMethodType.PERSONAL_SIGN:
                try {
                    const [data, address] = context.request.params as [string, string]
                    context.write(await signPersonalMessage(data, address))
                } catch (error) {
                    context.abort(error, 'Failed to sign data.')
                }
                break
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                try {
                    const [address, data] = context.request.params as [string, string]
                    context.write(await signTypedData(address, JSON.parse(data)))
                } catch (error) {
                    context.abort(error, 'Failed to sign typed data.')
                }
                break
            default:
                break
        }
        await next()
    }
}